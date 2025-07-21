# Technical Debt & Known Issues

This document tracks known technical debt, unresolved issues, and areas for future improvement in the AI Business App project.

## 1. Backend Dependencies (`faiss-cpu` & `lxml`)

-   **Issue:** The `faiss-cpu` and `lxml` Python libraries fail to build from source on Windows without specific C++ build tools (SWIG, libxml2, libxslt). We have temporarily commented them out in `requirements.txt` to get the application running.
-   **Impact:** Core RAG (Vector Search) functionality and potentially some document parsing features in the backend are currently disabled.
-   **Resolution:**
    -   Find and use pre-built binary wheels (`.whl`) for `faiss-cpu` and `lxml` that are compatible with Python 3.11 on Windows.
    -   Alternatively, install the required build tools (SWIG, libxml2, libxslt) in the development environment.

## 2. Frontend UI Inconsistency

-   **Issue:** The frontend codebase contains components built with two different UI libraries: Material-UI (`@mui/material`) and Shadcn UI (`@/components/ui/...`).
-   **Impact:** Inconsistent UI/UX, increased bundle size, and maintenance complexity. We have refactored the components that were causing compilation errors (`ToolGenerator`, `PromptGenerator`) to use Material-UI, but other components might still be using the old library.
-   **Resolution:**
    -   Conduct a full audit of all React components.
    -   Decide on a single UI library to use for the entire project (likely Material-UI as it's more prevalent).
    -   Refactor any remaining components to use the chosen library.
    -   Remove the unused UI library and its dependencies from `package.json`.

## 3. Missing `user_bp` Blueprint

-   **Issue:** The main application factory in `backend/src/main.py` has a commented-out import for a `user_bp` (User Blueprint). This suggests that user management routes (like login, registration) were planned but are not yet implemented or were located in a file that was removed during refactoring.
-   **Impact:** No user authentication or management functionality is currently available. The application defaults to `user_id=1` in many places.
-   **Resolution:**
    -   Design and implement the user management routes (`user_bp`).
    -   Create endpoints for user registration, login, logout, and profile management.
    -   Integrate proper authentication (e.g., JWT) and replace all hardcoded `user_id=1` instances with the actual authenticated user's ID.
