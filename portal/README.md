## Running Lumora with Docker

This project provides a Docker-based setup for running the Lumora FastAPI service. Below are the specific instructions and requirements for building and running the service using Docker Compose.

### Project-Specific Docker Requirements
- **Python Version:** 3.11 (as specified in the Dockerfile)
- **Dependencies:** Installed from `requirements.txt` (must be present in the project root)
- **Application Code:** Located in the `lumora/` directory

### Environment Variables
- **Required at runtime:**
  - `OPENAI_API_KEY` (for OpenAI API access; must be set at runtime, do NOT hardcode secrets)
- **Optional configuration:**
  - `LUMORA_MODEL` (e.g., `gpt-4o-mini`)
  - `LUMORA_TEMPERATURE` (e.g., `0.2`)
  - `LUMORA_CORS_ORIGINS` (comma-separated list of allowed origins)
- You can use a `.env` file in `lumora/` and uncomment the `env_file` line in the compose file for local development.

### Build and Run Instructions
1. Ensure `requirements.txt` is present in the project root.
2. From the project root, build and start the service:
   ```sh
   docker compose -f lumora/docker-compose.yaml up --build
   ```
   (Adjust the path if your compose file is named or located differently.)
3. Set required environment variables (e.g., `OPENAI_API_KEY`) either in your shell or via a `.env` file.

### Service Details
- **Service Name:** `python-lumora`
- **Exposed Port:** `8000` (FastAPI HTTP API)
- **Network:** Uses a custom bridge network `lumora-net`
- **User:** Runs as a non-root user for security

### Special Configuration
- No external dependencies (database, cache) are required by default.
- If you add monitoring tools (e.g., Prometheus, Grafana), see the README for example Docker Compose additions.

---
*This section was updated to reflect the current Docker setup for Lumora. Please ensure your environment variables are set securely and that you have the required `requirements.txt` file in your project root before building the Docker image.*
