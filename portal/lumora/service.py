import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prometheus_fastapi_instrumentator import Instrumentator
from .agent import run_lumora, create_formal_proposal


class RunRequest(BaseModel):
    content: str
    model: str | None = None
    temperature: float | None = None


app = FastAPI(title="Lumora Service", version="0.1.0")

# CORS (configurável via env LUMORA_CORS_ORIGINS, separado por vírgula)
cors_origins = os.getenv("LUMORA_CORS_ORIGINS", "").strip()
origins = [o.strip() for o in cors_origins.split(",") if o.strip()] if cors_origins else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app, include_in_schema=False)


@app.get("/health")
def health():
    has_key = bool(os.getenv("OPENAI_API_KEY"))
    return {"status": "ok", "openai_key": has_key}


@app.get("/ready")
def ready():
    has_key = bool(os.getenv("OPENAI_API_KEY"))
    status = "ready" if has_key else "degraded"
    return {"status": status, "openai_key": has_key}


@app.post("/run_lumora")
def run(req: RunRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY ausente no ambiente")
    model = req.model or os.getenv("LUMORA_MODEL", "gpt-4o-mini")
    temperature = (
        req.temperature if req.temperature is not None else float(os.getenv("LUMORA_TEMPERATURE", "0.2"))
    )
    try:
        output = run_lumora(req.content, model=model, temperature=temperature)
    except Exception as e:
        logging.exception("Erro em run_lumora")
        raise HTTPException(status_code=500, detail=str(e))
    return {"model": model, "temperature": temperature, "output": output}


class ProposalRequest(BaseModel):
    partner_name: str
    scope: str
    deliverables: list[str] | None = None
    terms: str | None = None
    format: str | None = "markdown"


@app.post("/run_proposal")
def run_proposal(req: ProposalRequest):
    if not os.getenv("OPENAI_API_KEY"):
        # Para proposta direta não é estritamente necessário, mas mantemos a mesma verificação por consistência
        logging.info("Executando run_proposal sem dependência do OpenAI")
    try:
        result = create_formal_proposal(
            partner_name=req.partner_name,
            scope=req.scope,
            deliverables=req.deliverables or [],
            terms=req.terms or "",
            format=req.format or "markdown",
        )
    except Exception as e:
        logging.exception("Erro em run_proposal")
        raise HTTPException(status_code=500, detail=str(e))
    return result
