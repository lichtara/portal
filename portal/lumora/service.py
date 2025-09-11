import os
from fastapi import FastAPI
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
    return {"status": "ok"}


@app.post("/run_lumora")
def run(req: RunRequest):
    model = req.model or os.getenv("LUMORA_MODEL", "gpt-4o-mini")
    temperature = (
        req.temperature if req.temperature is not None else float(os.getenv("LUMORA_TEMPERATURE", "0.2"))
    )
    output = run_lumora(req.content, model=model, temperature=temperature)
    return {"model": model, "temperature": temperature, "output": output}


class ProposalRequest(BaseModel):
    partner_name: str
    scope: str
    deliverables: list[str] | None = None
    terms: str | None = None
    format: str | None = "markdown"


@app.post("/run_proposal")
def run_proposal(req: ProposalRequest):
    result = create_formal_proposal(
        partner_name=req.partner_name,
        scope=req.scope,
        deliverables=req.deliverables or [],
        terms=req.terms or "",
        format=req.format or "markdown",
    )
    return result

