[README.md](https://github.com/user-attachments/files/32610335/README.md)
# 🤖 RAG Assistant

> 🚀 **A full-stack, source-grounded AI assistant for PDFs, websites, and YouTube content.**

> A full-stack Retrieval-Augmented Generation (RAG) platform that lets
> users ingest a **PDF, website, or YouTube source** and ask
> natural-language questions grounded only in the retrieved source
> context.

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=white)](https://github.com/shinuthakur/Rag-Application-frontend)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://github.com/shinuthakur/Rag-Application)
[![LLM](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Vector
DB](https://img.shields.io/badge/Vector%20Store-ChromaDB-FF6B35)](https://www.trychroma.com/)
[![RAG](https://img.shields.io/badge/Architecture-RAG-7C3AED)](#architecture)

------------------------------------------------------------------------

## 🧠 Overview

RAG Assistant is a full-stack AI application designed around a simple
principle:

**Retrieve relevant information from the user's source first, then
generate an answer from that retrieved context.**

Instead of sending an entire document or arbitrary external content
directly to a language model, the application builds a searchable vector
representation of the source, retrieves the most relevant chunks for a
question, and supplies those chunks to Gemini as grounded context.

The application currently supports three source types:

-   **PDF documents**
-   **Web pages**
-   **YouTube videos/transcripts**

The project is split into two independently deployable repositories:

  Layer      Repository                   Technology
  ---------- ---------------------------- ------------------
  Frontend   `Rag-Application-frontend`   React 19 + Vite
  Backend    `Rag-Application`            Python + FastAPI

### Live deployment

-   **Frontend:** https://rag-application-frontend-eight.vercel.app
-   **Backend:** https://rag-application-p1yh.onrender.com
-   **API documentation:**
    https://rag-application-p1yh.onrender.com/docs
-   **Health check:** https://rag-application-p1yh.onrender.com/health


## 🖼️ Frontend Preview

The deployed React + Vite interface provides a focused workspace for adding a source and asking grounded questions.

<img width="1920" height="2028" alt="frontend-preview" src="https://github.com/user-attachments/assets/6a24fc5a-a1f2-4e40-93cd-57779d6123ce" />

> 💡 **Experience:** Upload a PDF, paste a website or YouTube URL, select the source, and ask questions directly against its retrieved context.

------------------------------------------------------------------------

# ✨ Key Features

### 📚 Multi-source ingestion

Users can provide knowledge through:

-   Drag-and-drop PDF upload
-   Website URL
-   YouTube URL

### 🎯 Source-grounded question answering

Questions are answered using retrieved chunks from the selected source
rather than treating the entire web or model knowledge as the answer
source.

### 🔎 Semantic retrieval

Source text is split into manageable chunks, transformed into vector
embeddings, stored in ChromaDB, and retrieved using semantic similarity.

### 🧩 MMR retrieval

The retrieval layer uses **Maximal Marginal Relevance (MMR)** to balance
relevance and diversity among retrieved chunks.

### 🏷️ Metadata-aware retrieval

Each chunk carries metadata such as:

-   `document_id`
-   `source_type`
-   `source`
-   `title`
-   `chunk_index`
-   page information where available
-   timestamp information where available

### 🛡️ Hallucination-aware generation

The generation prompt explicitly instructs Gemini to:

-   use only retrieved context
-   avoid unsupported facts
-   avoid inventing information
-   report when the answer cannot be found in the supplied context

### 🔌 REST API

The backend exposes a clean FastAPI interface for:

-   health monitoring
-   source ingestion
-   PDF upload
-   question answering

### 📖 Automatic API documentation

FastAPI provides interactive Swagger/OpenAPI documentation at:

`/docs`

------------------------------------------------------------------------

# 🏗️ Architecture

## 🌐 High-level architecture

``` text
                         ┌─────────────────────────┐
                         │      User / Browser      │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   React + Vite Frontend │
                         │                         │
                         │  • PDF Upload           │
                         │  • URL Input            │
                         │  • Question Interface   │
                         └────────────┬────────────┘
                                      │ HTTPS / REST
                                      ▼
                         ┌─────────────────────────┐
                         │      FastAPI Backend     │
                         │                         │
                         │  /health                │
                         │  /ingest                │
                         │  /ingest/file           │
                         │  /ask                   │
                         └────────────┬────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     │                │                │
                     ▼                ▼                ▼
              ┌────────────┐  ┌────────────┐  ┌──────────────┐
              │ PDF Loader │  │ Web Loader │  │YouTube Loader│
              └─────┬──────┘  └─────┬──────┘  └──────┬───────┘
                    │                │                 │
                    └────────────────┼─────────────────┘
                                     ▼
                          ┌─────────────────────┐
                          │  Document Chunker   │
                          │                     │
                          │ Recursive splitter  │
                          │ 800 chars / 150     │
                          │ overlap             │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │ Gemini Embeddings   │
                          │ gemini-embedding-001│
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │      ChromaDB       │
                          │   Vector Store      │
                          └──────────┬──────────┘
                                     │
                          User question
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │      Retriever      │
                          │                     │
                          │ MMR Search          │
                          │ Top-K = 5           │
                          │ Fetch-K = 10        │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   RAG Generator     │
                          │                     │
                          │ Google Gemini       │
                          │ Context-grounded    │
                          │ generation          │
                          └──────────┬──────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │      Answer         │
                          └─────────────────────┘
```

------------------------------------------------------------------------

# 🔄 RAG Pipeline

The application follows a standard retrieval-augmented generation
pipeline.

``` text
SOURCE
  │
  ▼
SOURCE DETECTION
  │
  ├── PDF
  ├── WEB
  └── YOUTUBE
  │
  ▼
LOADER
  │
  ▼
NORMALIZED DOCUMENT
  │
  ▼
CHUNKING
  │
  ▼
EMBEDDING
  │
  ▼
CHROMADB
  │
  │
  │ User Question
  ▼
QUERY EMBEDDING
  │
  ▼
MMR RETRIEVAL
  │
  ▼
TOP-K CONTEXT
  │
  ▼
GEMINI
  │
  ▼
GROUNDED ANSWER
```

------------------------------------------------------------------------

# ⚙️ Backend Architecture

The backend follows a layered structure rather than putting all
application logic inside API routes.

``` text
app/
│
├── api/
│   └── routes.py
│
├── loaders/
│   ├── base_loader.py
│   ├── pdf_loader.py
│   ├── web_loader.py
│   ├── youtube_loader.py
│   ├── source_detector.py
│   └── loaders_factory.py
│
├── processing/
│   └── chunker.py
│
├── retrieval/
│   └── retriever.py
│
├── rag/
│   ├── generator.py
│   └── service.py
│
├── services/
│   └── ingestion_service.py
│
├── schemas/
│   ├── chat.py
│   ├── document.py
│   └── ingestion.py
│
├── vectorstore/
│   ├── embeddings.py
│   └── chroma_store.py
│
├── config.py
└── main.py
```

## 🗺️ Backend responsibility map

  Module           Responsibility
  ---------------- ------------------------------------
  `api/`           HTTP/API layer
  `loaders/`       Source-specific ingestion
  `processing/`    Text processing and chunking
  `services/`      Application/business orchestration
  `schemas/`       Pydantic data contracts
  `vectorstore/`   Embeddings and ChromaDB
  `retrieval/`     Semantic/MMR retrieval
  `rag/`           Context-aware answer generation
  `config.py`      Environment configuration
  `main.py`        FastAPI application entry point

------------------------------------------------------------------------

# 🎨 Frontend Architecture

The frontend is built as a React single-page application using Vite.

``` text
src/
│
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

### 🖥️ Frontend responsibilities

-   Render the RAG Assistant interface
-   Accept PDF files
-   Accept website URLs
-   Accept YouTube URLs
-   Send ingestion requests to FastAPI
-   Store/use the returned document identifier
-   Send user questions to `/ask`
-   Display generated answers
-   Show backend/source processing states
-   Provide responsive visual interaction

The frontend communicates with the backend over HTTP using the backend's
deployed API URL.

------------------------------------------------------------------------

# 🛠️ Technology Stack

## 🎨 Frontend

  Technology         Role
  ------------------ --------------------------------------------
  React 19           UI framework
  Vite               Frontend build tool and development server
  JavaScript / JSX   Application logic
  CSS                UI styling
  Oxlint             Linting
  npm                Dependency management

## ⚡ Backend

  Technology      Role
  --------------- -----------------------------
  Python 3.12     Runtime
  FastAPI         REST API framework
  Uvicorn         ASGI server
  Pydantic        Request/response validation
  python-dotenv   Environment configuration

## 🧠 AI / RAG

  Technology                 Role
  -------------------------- ------------------------------------
  LangChain Core             RAG application primitives
  LangChain Text Splitters   Recursive document chunking
  LangChain Google GenAI     Gemini LLM + embedding integration
  Google Gemini              Embeddings and answer generation
  ChromaDB                   Persistent vector storage
  MMR                        Diverse semantic retrieval

## 📥 Source ingestion

  Source    Processing
  --------- -------------------------------------
  PDF       `PyPDFLoader` / PDF text extraction
  Website   HTTP retrieval + HTML parsing
  YouTube   Transcript extraction

## ☁️ Deployment

  Component        Platform
  ---------------- ----------
  Frontend         Vercel
  Backend          Render
  Source control   GitHub

------------------------------------------------------------------------

# ⚙️ Configuration

The backend is configured using environment variables.

Example:

``` env
GOOGLE_API_KEY=your_google_api_key

LLM_MODEL=gemini-3.6-flash
LLM_FALLBACK_MODEL=gemini-3.5-flash

EMBEDDING_MODEL=gemini-embedding-001

CHROMA_PERSIST_DIRECTORY=./chroma_db

CHUNK_SIZE=800
CHUNK_OVERLAP=150

TOP_K=5
FETCH_K=10
```

### 🔐 Security

Never commit a real API key.

Use:

``` text
.env
```

for local secrets and:

``` text
.env.example
```

for safe configuration templates.

The real API key should be supplied through the deployment platform's
environment-variable system.

------------------------------------------------------------------------

# 🔍 Retrieval Configuration

Current retrieval configuration:

``` text
Chunk size       : 800 characters
Chunk overlap    : 150 characters
Top K             : 5
MMR Fetch K       : 10
Embedding model   : gemini-embedding-001
```

## Why chunking?

Large documents are divided into smaller semantic units so that
retrieval can identify focused passages relevant to a question instead
of passing the entire source to the LLM.

## Why overlap?

Overlap helps preserve contextual continuity when information spans
chunk boundaries.

## Why MMR?

Maximal Marginal Relevance attempts to retrieve results that are both:

1.  relevant to the query
2.  sufficiently diverse from one another

This reduces the chance that all retrieved results contain nearly
identical passages.

------------------------------------------------------------------------

# 🔌 API Reference

## Health

``` http
GET /health
```

Response:

``` json
{
  "status": "ok",
  "message": "RAG backend is running."
}
```

------------------------------------------------------------------------

## Ingest a source

``` http
POST /ingest
Content-Type: application/json
```

Request:

``` json
{
  "source": "https://example.com"
}
```

The backend detects whether the source is a website, YouTube URL, or PDF
URL, loads it, chunks it, creates embeddings, and stores the chunks.

------------------------------------------------------------------------

## Upload a PDF

``` http
POST /ingest/file
Content-Type: multipart/form-data
```

Form field:

``` text
file=<PDF>
```

The backend:

1.  receives the PDF
2.  stores it temporarily
3.  loads the document
4.  chunks the text
5.  creates embeddings
6.  stores vectors in ChromaDB
7.  returns a document identifier

------------------------------------------------------------------------

## Ask a question

``` http
POST /ask
Content-Type: application/json
```

Request:

``` json
{
  "question": "What is this document about?",
  "document_id": "document-id"
}
```

Response:

``` json
{
  "answer": "..."
}
```

------------------------------------------------------------------------

# 💻 Local Development

## Prerequisites

-   Python 3.12+
-   Node.js
-   npm
-   Git
-   Google Gemini API key

## ⚡ Backend

Clone the backend:

``` bash
git clone https://github.com/shinuthakur/Rag-Application.git
cd Rag-Application
```

Create and activate a virtual environment.

### Windows

``` powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

``` powershell
pip install -r requirements.txt
```

Create `.env`:

``` env
GOOGLE_API_KEY=your_google_api_key
```

Start the backend:

``` powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open:

``` text
http://127.0.0.1:8000/docs
```

------------------------------------------------------------------------

## 🎨 Frontend

Clone the frontend:

``` bash
git clone https://github.com/shinuthakur/Rag-Application-frontend.git
cd Rag-Application-frontend
```

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

Open:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# ☁️ Deployment Architecture

``` text
                    INTERNET
                       │
                       ▼
          ┌─────────────────────────┐
          │         Vercel          │
          │                         │
          │ React + Vite Frontend   │
          └────────────┬────────────┘
                       │ HTTPS
                       ▼
          ┌─────────────────────────┐
          │         Render          │
          │                         │
          │ FastAPI + Uvicorn       │
          └────────────┬────────────┘
                       │
              ┌────────┴─────────┐
              ▼                  ▼
        ┌───────────┐      ┌─────────────┐
        │ ChromaDB  │      │ Google      │
        │           │      │ Gemini API  │
        └───────────┘      └─────────────┘
```

### ⚡ Backend deployment

Render starts the application with:

``` bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 🎨 Frontend deployment

Vercel builds the React/Vite application:

``` bash
npm run build
```

and serves the generated `dist/` directory.

------------------------------------------------------------------------

# 📦 Project Repositories

### ⚡ Backend

https://github.com/shinuthakur/Rag-Application

### 🎨 Frontend

https://github.com/shinuthakur/Rag-Application-frontend

------------------------------------------------------------------------

# 🧱 Engineering Principles

The project is organized around several core engineering principles.

### Separation of concerns

API routing, source loading, chunking, retrieval, vector storage, and
generation are separated into distinct modules.

### Dependency isolation

Backend Python dependencies are isolated in a virtual environment.

### Typed data contracts

Pydantic models define structured API request and response contracts.

### Source-aware retrieval

Documents are assigned a `document_id`, allowing retrieval to be scoped
to a particular source.

### Grounded generation

The generator is instructed to answer from retrieved context and
explicitly acknowledge when the source does not contain the requested
information.

### Environment-based configuration

Secrets and deployment-specific configuration are kept outside source
code.

------------------------------------------------------------------------

# ⚠️ Current Limitations

This project is currently a functional full-stack RAG prototype/demo and
has several areas that should be strengthened before production-scale
use.

### Storage persistence

The current deployment uses local ChromaDB storage and local
uploaded-file storage. Ephemeral/free hosting environments may not
provide durable storage across all restarts or redeployments.

### Authentication

There is currently no user authentication or account-level data
isolation.

### Multi-user isolation

The architecture currently supports source-level isolation using
`document_id`, but it does not yet implement user accounts and per-user
storage boundaries.

### Production CORS

The initial deployment configuration uses permissive CORS for rapid
integration. Production deployment should restrict allowed origins to
the deployed frontend domain.

### Scaling

The current architecture is designed for a lightweight deployment and
demonstration environment. High-volume production usage would benefit
from managed vector storage, object storage, background ingestion
workers, rate limiting, observability, and horizontal scaling.

### Source coverage

Different websites and YouTube videos may have different accessibility,
transcript, or parsing constraints.

------------------------------------------------------------------------

# 🚀 Planned Improvements

Potential next-stage improvements include:

-   [ ] Production CORS configuration
-   [ ] Managed vector database
-   [ ] Persistent object/file storage
-   [ ] User authentication
-   [ ] Per-user document isolation
-   [ ] Streaming LLM responses
-   [ ] Source citations in answers
-   [ ] Retrieval score visibility
-   [ ] Conversation history
-   [ ] Better document metadata
-   [ ] Background ingestion jobs
-   [ ] Rate limiting
-   [ ] Structured logging
-   [ ] Monitoring and observability
-   [ ] Automated backend tests
-   [ ] Frontend component testing
-   [ ] Docker deployment
-   [ ] CI/CD with GitHub Actions
-   [ ] RAG evaluation with benchmark datasets

------------------------------------------------------------------------

# 🧪 Testing Strategy

The backend includes a `tests/` directory for automated testing.

The intended testing layers are:

``` text
Unit Tests
   │
   ├── Source detection
   ├── Chunking
   ├── Schema validation
   └── Service logic
   │
   ▼
Integration Tests
   │
   ├── Ingestion API
   ├── Retrieval
   └── RAG generation
   │
   ▼
End-to-End Tests
   │
   ├── Frontend → Backend
   ├── Source ingestion
   └── Question answering
```

Run the backend tests with:

``` bash
python -m pytest
```

------------------------------------------------------------------------

# 📁 Repository Structure

## ⚡ Backend repository

``` text
Rag-Application/
│
├── app/
│   ├── api/
│   │   └── routes.py
│   │
│   ├── loaders/
│   │   ├── base_loader.py
│   │   ├── pdf_loader.py
│   │   ├── web_loader.py
│   │   ├── youtube_loader.py
│   │   ├── source_detector.py
│   │   └── loaders_factory.py
│   │
│   ├── processing/
│   │   └── chunker.py
│   │
│   ├── retrieval/
│   │   └── retriever.py
│   │
│   ├── rag/
│   │   ├── generator.py
│   │   └── service.py
│   │
│   ├── services/
│   │   └── ingestion_service.py
│   │
│   ├── schemas/
│   │   ├── chat.py
│   │   ├── document.py
│   │   └── ingestion.py
│   │
│   ├── vectorstore/
│   │   ├── embeddings.py
│   │   └── chroma_store.py
│   │
│   ├── config.py
│   └── main.py
│
├── tests/
│
├── .env.example
├── .gitignore
├── .python-version
├── requirements.txt
├── main.py
└── README.md
```

## 🎨 Frontend repository

``` text
Rag-Application-frontend/
│
├── public/
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

------------------------------------------------------------------------

# 🔐 Security Notes

-   Never commit `.env`.
-   Never expose a Gemini API key in frontend JavaScript.
-   Use deployment-provider environment variables for secrets.
-   Rotate any API key that has been accidentally exposed.
-   Avoid logging API keys or sensitive source content.
-   Restrict CORS before production.
-   Add authentication and per-user isolation before handling private
    user data at scale.

------------------------------------------------------------------------

# 🔁 Development Workflow

``` text
Idea / Change
     │
     ▼
Local Development
     │
     ├── Backend: FastAPI
     └── Frontend: Vite
     │
     ▼
Local Testing
     │
     ▼
Git Commit
     │
     ▼
GitHub
     │
     ├───────────────┐
     ▼               ▼
   Render          Vercel
 Backend           Frontend
     │               │
     └───────┬───────┘
             ▼
       Live RAG System
```

------------------------------------------------------------------------

# 📄 License

This project is currently intended for educational, experimental, and
portfolio purposes.

A formal open-source license can be added when the project's
distribution terms are finalized.

------------------------------------------------------------------------

# 👨‍💻 Author

**Shivam Thakur**

B.Tech --- Computer Science & Engineering (AI & ML)

GitHub: https://github.com/shinuthakur

------------------------------------------------------------------------

## 📌 Project Status

**Status:** Active Development

The core full-stack RAG pipeline and cloud deployment are implemented.
The project is continuing toward stronger persistence, security,
evaluation, scalability, and production readiness.
