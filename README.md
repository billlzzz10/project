# Project Orion: AI Agent Integration Framework

> **Vision:** "เราจะสร้างมาตรฐานกลางสำหรับ AI Agent Integration ที่ทำให้ทุกองค์กรสามารถใช้ประโยชน์จาก AI ได้อย่างปลอดภัย มีประสิทธิภาพ และยั่งยืน"
> "To establish the central standard for AI Agent Integration, enabling all organizations to leverage AI safely, efficiently, and sustainably."

---

This repository contains the source code for **Project Orion**, an integrated platform designed to be a comprehensive AI Agent Framework and Business OS. It is built with a modular, API-centric, and cloud-ready architecture to support robust workflow automation and a thriving developer ecosystem.

## 🏗️ Architecture: A Microservices Ecosystem

The project is architected as a collection of containerized microservices, orchestrated by Docker. This design ensures scalability, maintainability, and independent deployment of each component.

```
/
├── 📄 docker-compose.yml       # Main orchestrator for all services
├── 📂 api_gateway/              # (FastAPI) The single entry point for all incoming traffic
├── 📂 backend/                  # (Flask) Core business logic, database, and legacy integrations
├── 📂 frontend/                 # (React) The main user interface
├── 📂 image-generation-service/ # (FastAPI) Dedicated service for image generation
├── 📂 rag-model-service/        # (FastAPI) Handles RAG and agentic workflows
├── 📂 ai-assistant-extension/   # (Chrome Extension) Browser-based UI component
└── 📂 docs/                     # High-level documentation
```

## 🛠️ Technology Stack

- **Orchestration**: Docker, Docker Compose
- **API Gateway**: FastAPI, Uvicorn
- **Core Services**: Python, FastAPI, Flask, SQLAlchemy
- **Frontend**: React.js, Node.js, Material-UI, Recharts, React Flow
- **AI & Machine Learning**: LangChain, Google Vertex AI (Imagen 2), Pinecone, Sentence Transformers
- **Database**: PostgreSQL (Production), SQLite (Development)
- **Workflow Automation**: n8n (planned)

## 🚀 Getting Started: Development Environment

The entire development environment is managed by Docker. The single command below is all you need to get started.

### Prerequisites
- Docker
- Docker Compose

### Running the Platform

1.  **Prepare Environment Files**:
    Each service that requires credentials or specific configurations has an `.env.example` file. Copy it to a `.env` file in the same directory and fill in the required values.
    - `cp backend/.env.example backend/.env`
    - `cp image-generation-service/.env.example image-generation-service/.env`
    - `cp rag-model-service/.env.example rag-model-service/.env`

2.  **Build and Run All Services**:
    From the project root directory, run:
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build the Docker image for each service.
    - Start all containers.
    - Connect them to a shared network.

    Services will be available at:
    - **Frontend**: `http://localhost:3000`
    - **API Gateway**: `http://localhost:8080`
    - **Backend (Direct)**: `http://localhost:5001`
    - **Image Generation (Direct)**: `http://localhost:8000`
    - **RAG Service (Direct)**: `http://localhost:8081`


## 📈 Project Status & Progress

This project follows the phased development plan outlined in the "Business OS Integration" proposal.

- **Phase 0: Automation Foundation** - ✅ **Completed**
  - *Established baseline automation and logging.*

- **Phase 1: Core Infrastructure & API Gateway** - ✅ **Completed**
  - *Google Cloud Workstation environment is prepared.*
  - *Docker configurations for all services are complete.*
  - *API Gateway v0.1 (`api_gateway`) has been developed and deployed.*

- **Phase 2: Microservices & Automation** - 🚧 **In Progress**
  - *Core microservices (`rag-model-service`, `image-generation-service`) have been scaffolded.*
  - *Next steps: Implement core logic within these services and set up the n8n automation hub.*

- **Phase 3: Business OS Integration** - ⏳ **Pending**
- **Phase 4: Marketplace & Ecosystem** - ⏳ **Pending**

## 📚 Documentation

- **[Project Overview (TH/EN)](./docs/README.md)**: A high-level summary of the project's features and goals.
- **[AI Agent Instructions](./.github/copilot-instructions.md)**: Essential guidelines for AI agents contributing to this codebase.
- **Service-Specific `README.md`**: Each service directory contains its own `README.md` with detailed information.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/YourAmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/YourAmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
