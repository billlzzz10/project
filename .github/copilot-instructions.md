---
# AI Business App Coding Instructions

This document provides essential guidance for AI agents working on the AI Business App codebase.

## Architecture Overview

The project is a monorepo containing three main parts: a Flask backend, a React frontend, and a separate RAG model service.

1.  **`backend/`**: A Flask application that serves as the central API. It follows the **Application Factory Pattern**.
    -   **Entry Point**: `run.py`
    -   **App Creation**: `src/main.py` contains the `create_app` factory. This is where all services are initialized and attached to the Flask `app` object.
    -   **Services (`src/services/`)**: Contains the business logic. Key services include:
        -   `enhanced_rag_service.py`: Manages the Retrieval-Augmented Generation workflow, orchestrating calls to the embedding model and the vector database.
        -   `ai_service.py`: Handles interactions with generative AI models (e.g., Google Gemini).
        -   `notion_service.py` & `airtable_service.py`: Contain logic for interacting with external SaaS APIs directly.
    -   **Routes (`src/routes/`)**: Defines the API endpoints. Each file corresponds to a feature area and uses a Flask Blueprint.
    -   **Models (`src/models.py`)**: Contains all SQLAlchemy database models.

2.  **`frontend/`**: A React application for the user interface.
    -   **Components (`src/components/`)**: All React components are located here. `App.jsx` is the main component that handles routing.
    -   **API Communication**: Components make API calls to the Flask backend. The base URL is configured via `VITE_API_BASE` in the `.env` file and defaults to `http://localhost:5001/api`.

3.  **`rag_model_service/`**: A self-contained Gradio application responsible for generating text embeddings. It is intended to be run as a separate microservice. The main backend communicates with this service for embedding tasks.

## Development Workflow

### Running the Application

To run the full application, you need to start both the backend and frontend servers.

1.  **Backend Setup**:
    ```bash
    # Navigate to the backend directory
    cd backend

    # Activate the virtual environment
    # On Windows
    .\\venv\\Scripts\\activate
    # On macOS/Linux
    # source venv/bin/activate

    # Run the server
    python run.py
    ```
    The backend runs on `http://localhost:5001`.

2.  **Frontend Setup**:
    ```bash
    # Navigate to the frontend directory
    cd frontend

    # Install dependencies (if not already done)
    npm install

    # Start the development server
    npm start
    ```
    The frontend runs on `http://localhost:3000` and proxies API requests to the backend.

### Key Patterns & Conventions

-   **Service Initialization**: All services are initialized within the `create_app` function in `backend/src/main.py` and attached to the `current_app` context. When accessing a service from a route, use `from flask import current_app` and then `current_app.my_service`. **Do not** instantiate services directly in route files.
-   **Environment Variables**: All secrets and configuration variables are managed through a `.env` file in the `backend/` directory. Refer to `.env.template` for the required variables.
-   **RAG Workflow**: The RAG process is decoupled. The `enhanced_rag_service.py` acts as an orchestrator. It calls the `rag_model_service/` (or a Hugging Face Inference API) to get embeddings and then uses a vector database service (like Pinecone) for storage and retrieval. It does **not** run the embedding model in its own process.

---
# Codacy Rules
Configuration for AI behavior when interacting with Codacy's MCP Server

## After ANY successful `edit_file` or `reapply` operation
- YOU MUST IMMEDIATELY run the `codacy_cli_analyze` tool from Codacy's MCP Server for each file that was edited, with:
 - `rootPath`: set to the workspace path
 - `file`: set to the path of the edited file
 - `tool`: leave empty or unset
- If any issues are found in the new edits, propose and apply fixes for them.
- > NOTE: Failure to follow this rule is considered a critical error.

## CRITICAL: Dependencies and Security Checks
- IMMEDIATELY after ANY of these actions:
 - Running npm/yarn/pnpm install
 - Adding dependencies to package.json
 - Adding requirements to requirements.txt
 - Adding dependencies to pom.xml
 - Adding dependencies to build.gradle
 - Any other package manager operations
- You MUST run the `codacy_cli_analyze` tool with:
 - `rootPath`: set to the workspace path
 - `tool`: set to "trivy"
 - `file`: leave empty or unset
- If any vulnerabilities are found because of the newly added packages:
 - Stop all other operations
 - Propose and apply fixes for the security issues
 - Only continue with the original task after security issues are resolved
- EXAMPLE:
 - After: npm install react-markdown
 - Do: Run codacy_cli_analyze with trivy
 - Before: Continuing with any other tasks

## General
- Repeat the relevant steps for each modified file.
- "Propose fixes" means to both suggest and, if possible, automatically apply the fixes.
- You MUST NOT wait for the user to ask for analysis or remind you to run the tool.
- Do not run `codacy_cli_analyze` looking for changes in duplicated code or code complexity metrics.
- Do not run `codacy_cli_analyze` looking for changes in code coverage.
- Do not try to manually install Codacy CLI using either brew, npm, npx, or any other package manager.
- If the Codacy CLI is not installed, just run the `codacy_cli_analyze` tool from Codacy's MCP Server.
- When calling `codacy_cli_analyze`, only send provider, organization and repository if the project is a git repository.

## Whenever a call to a Codacy tool that uses `repository` or `organization` as a parameter returns a 404 error
- Offer to run the `codacy_setup_repository` tool to add the repository to Codacy
- If the user accepts, run the `codacy_setup_repository` tool
- Do not ever try to run the `codacy_setup_repository` tool on your own
- After setup, immediately retry the action that failed (only retry once)
---