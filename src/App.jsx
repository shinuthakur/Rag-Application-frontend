import { useRef, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");

  const [ingestionResult, setIngestionResult] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [loadingIngest, setLoadingIngest] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);

  const [error, setError] = useState("");

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setSourceUrl("");
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  const ingestPdf = async () => {
    if (!file) {
      setError("Please select a PDF first.");
      return;
    }

    setLoadingIngest(true);
    setError("");
    setAnswer("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_BASE_URL}/ingest/file`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to ingest PDF."
        );
      }

      setIngestionResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingIngest(false);
    }
  };

  const ingestUrl = async () => {
    if (!sourceUrl.trim()) {
      setError(
        "Please enter a website or YouTube URL."
      );
      return;
    }

    setLoadingIngest(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/ingest`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            source: sourceUrl.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to ingest URL."
        );
      }

      setIngestionResult(data);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingIngest(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    if (!ingestionResult?.document_id) {
      setError("Please ingest a source first.");
      return;
    }

    setLoadingAsk(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: question.trim(),
            document_id:
              ingestionResult.document_id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to generate answer."
        );
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAsk(false);
    }
  };

  const handleQuestionKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askQuestion();
    }
  };

  const sourceLabel = () => {
    if (!ingestionResult) return "";

    if (ingestionResult.source_type === "youtube") {
      return "YouTube";
    }

    if (ingestionResult.source_type === "web") {
      return "Website";
    }

    return "PDF";
  };

  return (
    <div className="app">

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            R
          </div>

          <div>
            <h1>RAG Assistant</h1>

            <p>
              Ask questions from your own sources
            </p>
          </div>

        </div>

        <div className="status">

          <span className="status-dot" />

          Backend connected

        </div>

      </header>


      <main className="container">

        <section className="hero">

          <div className="hero-badge">
            AI • RAG • KNOWLEDGE ASSISTANT
          </div>

          <h2>
            Talk to your
            <span> sources.</span>
          </h2>

          <p>
            Drop a PDF or paste a website or
            YouTube URL. Then ask questions
            directly from that source.
          </p>

        </section>


        <section className="card">

          <div className="section-header">

            <span className="step">
              01
            </span>

            <div>

              <h3>
                Add a knowledge source
              </h3>

              <p>
                Upload a PDF or paste a URL.
              </p>

            </div>

          </div>


          <div
            className={`drop-zone ${
              file ? "has-file" : ""
            }`}
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              hidden
              onChange={(event) =>
                handleFile(
                  event.target.files[0]
                )
              }
            />

            {file ? (
              <>
                <div className="upload-icon">
                  ✓
                </div>

                <strong>
                  {file.name}
                </strong>

                <span>
                  PDF ready to ingest
                </span>
              </>
            ) : (
              <>
                <div className="upload-icon">
                  ↑
                </div>

                <strong>
                  Drag & drop your PDF here
                </strong>

                <span>
                  or click to browse
                </span>
              </>
            )}

          </div>


          {file && (

            <button
              className="primary-button full-button"
              onClick={ingestPdf}
              disabled={loadingIngest}
            >
              {loadingIngest
                ? "Processing PDF..."
                : "Process PDF"}
            </button>

          )}


          <div className="or-divider">
            <span>OR</span>
          </div>


          <div className="url-row">

            <input
              value={sourceUrl}
              onChange={(event) =>
                setSourceUrl(event.target.value)
              }
              placeholder="Paste website or YouTube URL..."
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  ingestUrl();
                }
              }}
            />

            <button
              className="primary-button"
              onClick={ingestUrl}
              disabled={
                loadingIngest ||
                !sourceUrl.trim()
              }
            >
              {loadingIngest
                ? "Processing..."
                : "Add URL"}
            </button>

          </div>


          <div className="supported">

            <span>Supports</span>

            <b>PDF</b>
            <b>Websites</b>
            <b>YouTube</b>

          </div>


          {ingestionResult && (

            <div className="success-box">

              <div className="success-icon">
                ✓
              </div>

              <div>

                <strong>
                  Source ready
                </strong>

                <div className="metadata">

                  <span>
                    Type:
                    <b>
                      {sourceLabel()}
                    </b>
                  </span>

                  {ingestionResult.title && (

                    <span>
                      Title:
                      <b>
                        {ingestionResult.title}
                      </b>
                    </span>

                  )}

                </div>

              </div>

            </div>

          )}

        </section>


        <section
          className={`card ${
            !ingestionResult
              ? "chat-disabled"
              : ""
          }`}
        >

          <div className="section-header">

            <span className="step">
              02
            </span>

            <div>

              <h3>
                Ask your source
              </h3>

              <p>
                Answers are retrieved only
                from the selected source.
              </p>

            </div>

          </div>


          <div className="question-box">

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={
                handleQuestionKeyDown
              }
              disabled={
                !ingestionResult ||
                loadingAsk
              }
              placeholder={
                ingestionResult
                  ? "Ask anything about this source..."
                  : "Add a source first..."
              }
            />

            <button
              className="ask-button"
              onClick={askQuestion}
              disabled={
                !ingestionResult ||
                loadingAsk
              }
            >
              {loadingAsk
                ? "Thinking..."
                : "Ask Question"}
            </button>

          </div>


          {answer && (

            <div className="answer-box">

              <div className="answer-label">
                ✦ Answer
              </div>

              <div className="answer-text">
                {answer}
              </div>

            </div>

          )}

        </section>


        {error && (

          <div className="error-box">

            <span>!</span>

            {error}

          </div>

        )}


        <section className="pipeline">

          <div className="pipeline-title">
            Your RAG pipeline
          </div>

          <div className="pipeline-items">

            <div>Source</div>
            <span>→</span>

            <div>Loader</div>
            <span>→</span>

            <div>Chunking</div>
            <span>→</span>

            <div>Embeddings</div>
            <span>→</span>

            <div>ChromaDB</div>
            <span>→</span>

            <div>Retriever</div>
            <span>→</span>

            <div>Gemini</div>

          </div>

        </section>

      </main>


      <footer>
        RAG Assistant · FastAPI · LangChain ·
        ChromaDB · Gemini
      </footer>

    </div>
  );
}

export default App;