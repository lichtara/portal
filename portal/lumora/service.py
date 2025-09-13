import os
import logging
import httpx
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


# ---- CI orchestration endpoints (for ChatGPT Actions autonomy) ----
class TriggerReleaseRequest(BaseModel):
    region: str | None = None
    service_name: str | None = None
    ref: str | None = "main"


class TriggerE2ERequest(BaseModel):
    service_url: str
    ref: str | None = "main"


def _gh_headers(token: str):
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }


def _repo_tuple(repo: str):
    if "/" in repo:
        owner, name = repo.split("/", 1)
        return owner, name
    raise HTTPException(status_code=500, detail="GITHUB_REPO deve ser 'owner/repo'")


@app.post("/ops/trigger_release")
def trigger_release(req: TriggerReleaseRequest):
    token = os.getenv("GH_ACTIONS_TOKEN")
    repo = os.getenv("GITHUB_REPO", "lichtara/portal")
    if not token:
        raise HTTPException(status_code=503, detail="GH_ACTIONS_TOKEN ausente no ambiente")
    owner, name = _repo_tuple(repo)
    region = req.region or os.getenv("GCP_REGION", "sa-east1")
    service = req.service_name or os.getenv("LUMORA_SERVICE_NAME", "lumora")
    payload = {"ref": req.ref or "main", "inputs": {"region": region, "service_name": service}}
    url = f"https://api.github.com/repos/{owner}/{name}/actions/workflows/lumora-release.yml/dispatches"
    with httpx.Client(timeout=30) as client:
        r = client.post(url, json=payload, headers=_gh_headers(token))
    if r.status_code not in (201, 204):
        raise HTTPException(status_code=502, detail=f"GitHub dispatch falhou: {r.status_code} {r.text}
")
    return {"ok": True, "workflow": "lumora-release", "region": region, "service": service}


@app.post("/ops/run_e2e")
def run_e2e(req: TriggerE2ERequest):
    token = os.getenv("GH_ACTIONS_TOKEN")
    repo = os.getenv("GITHUB_REPO", "lichtara/portal")
    if not token:
        raise HTTPException(status_code=503, detail="GH_ACTIONS_TOKEN ausente no ambiente")
    owner, name = _repo_tuple(repo)
    payload = {"ref": req.ref or "main", "inputs": {"service_url": req.service_url}}
    url = f"https://api.github.com/repos/{owner}/{name}/actions/workflows/test-lumora-e2e.yml/dispatches"
    with httpx.Client(timeout=30) as client:
        r = client.post(url, json=payload, headers=_gh_headers(token))
    if r.status_code not in (201, 204):
        raise HTTPException(status_code=502, detail=f"GitHub dispatch falhou: {r.status_code} {r.text}")
    return {"ok": True, "workflow": "test-lumora-e2e", "service_url": req.service_url}
