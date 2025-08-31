---
# AI Business App Coding Instructions

This document provides essential guidance for AI agents working on the AI Business App codebase.

## Architecture Overview: Microservices with Docker

The project has evolved into a microservices architecture, orchestrated by Docker Compose. This is the primary way to run and develop the application.

**Core Services:**

1.  **`api_gateway/`**: A **FastAPI** application serving as the single entry point for all external traffic. It routes requests to the appropriate downstream service.
2.  **`backend/`**: The original **Flask** application, now functioning as a core service handling business logic, database interactions, and integrations (Notion, Airtable).
3.  **`frontend/`**: A **React** application for the user interface. It communicates with the `api_gateway`.
4.  **`image-generation-service/`**: A **FastAPI** microservice dedicated to generating images using Vertex AI.
5.  **`rag-model-service/`**: A **FastAPI** microservice for RAG (Retrieval-Augmented Generation) workflows, using LangChain and Pinecone.

**Other Components:**

-   **`ai-assistant-extension/`**: A supplementary Chrome Extension. Not part of the core Dockerized services.
-   **`docs/`**: Contains high-level project documentation.

## Development Workflow: Docker Compose

The entire development environment is managed by `docker-compose.yml` at the project root.

### **Primary Command: Running the Full Application**

To build and run all services simultaneously, use this command from the project root:

```bash
docker-compose up --build
```

-   This command builds the Docker image for each service if it doesn't exist or if the Dockerfile has changed.
-   It starts all services defined in `docker-compose.yml`.
-   Services are accessible on their specified ports (e.g., Frontend on `localhost:3000`, API Gateway on `localhost:8080`).

### Service Communication

Services communicate with each other over the internal Docker network using their service names as hostnames.

-   **Example**: The `backend` service can call the `image-generation-service` at `http://image-generation-service:8000`.
-   **Rule**: Do not use `localhost` for inter-service communication. Use the service name as defined in `docker-compose.yml`.

### Environment Variables

-   Each service has its own `.env.example` file.
-   To run the application, you must create a corresponding `.env` file for each service that requires one (e.g., `backend/`, `image-generation-service/`).
-   These `.env` files are loaded by `docker-compose.yml`. **Do not commit `.env` files to Git.**

## Key Patterns & Conventions (Backend Flask Service)

-   **Service Initialization**: All services within the `backend` Flask app are initialized in `src/main.py` and attached to `current_app`. Access them via `current_app.my_service`. **Do not** instantiate services directly in route files.
-   **RAG Workflow**: The `backend` service orchestrates the RAG process, calling the `rag-model-service` for embeddings and interacting with a vector database.

---
# Codacy Rules
Configuration for AI behavior when interacting with Codacy's MCP Server

## using any tool that accepts the arguments: `provider`, `organization`, or `repository`
- ALWAYS use:
 - provider: gh
 - organization: billlzzz10
 - repository: project
- Avoid calling `git remote -v` unless really necessary

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

- @azure Rule - Use Azure Best Practices: When generating code for Azure, running terminal commands for Azure, or performing operations related to Azure, invoke your `azure_development-get_best_practices` tool if available.