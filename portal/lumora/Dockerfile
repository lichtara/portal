# syntax=docker/dockerfile:1

FROM python:3.11-slim AS base

# Builder stage: install dependencies in a venv
FROM base AS builder
WORKDIR /app

# Copy requirements.txt if it exists, for dependency caching
# (Assume requirements.txt is in the project root, not in lumora/)
COPY --link ../requirements.txt ./requirements.txt

# Create venv and install dependencies with pip cache
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m venv .venv && \
    .venv/bin/pip install --upgrade pip && \
    .venv/bin/pip install -r requirements.txt

# Copy application code (lumora package)
COPY --link . ./lumora

# Final stage: minimal image, non-root user
FROM base AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system lumora && adduser --system --ingroup lumora lumora

# Copy venv and app code from builder
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/lumora /app/lumora

# Set environment for venv
ENV PATH="/app/.venv/bin:$PATH"

# Expose the service port
EXPOSE 8000

# Switch to non-root user
USER lumora

# Default command: start the FastAPI app with uvicorn
CMD ["uvicorn", "lumora.service:app", "--host", "0.0.0.0", "--port", "8000"]
