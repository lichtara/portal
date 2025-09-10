import os
import json
from typing import Any, Dict

# Troque por seu cliente OpenAI atual
from openai import OpenAI


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ---- Funções que o back-end executa (simples/mocks) ----
def generate_documentation(
    topic: str,
    audience: str,
    format: str,
    sections=None,
    tone: str = "neutro",
    include_summary: bool = True,
) -> Dict[str, Any]:
    sections = sections or ["Introdução", "Conteúdo", "Conclusões"]
    md = [f"# {topic}\n", f"**Público:** {audience}\n", f"**Tom:** {tone}\n"]
    if include_summary:
        md.append("## Resumo\n- Síntese breve dos principais pontos.\n")
    for s in sections:
        md.append(f"## {s}\nTexto base aqui.\n")
    return {
        "title": f"Documentação • {topic}",
        "content": "\n".join(md),
        "format": format,
    }


def create_formal_proposal(
    partner_name: str,
    scope: str,
    deliverables,
    terms: str = "",
    format: str = "markdown",
) -> Dict[str, Any]:
    deliverables = deliverables or []
    md = [
        f"# Proposta de Parceria • {partner_name}\n",
        "## Resumo Executivo\nTexto breve aqui.\n",
        "## Escopo\n" + scope + "\n",
        "## Entregáveis\n" + "\n".join([f"- {d}" for d in deliverables]) + "\n",
        "## Termos\n" + (terms or "A definir conjuntamente.") + "\n",
        "\n---\n_Coautoria humano–IA reconhecida._\n",
    ]
    return {
        "title": f"Proposta • {partner_name}",
        "content": "\n".join(md),
        "format": format,
    }


def translate_and_format(
    input_text: str, target_format: str, target_language: str = None
) -> Dict[str, Any]:
    # Aqui você pode plugar serviços de tradução ou apenas repassar
    return {
        "title": "Conteúdo traduzido/formatado",
        "content": input_text,
        "format": target_format,
        "lang": target_language,
    }


def synthesize_narrative(
    data_points, audience: str, tone: str = "inspirador", length: int = 6
) -> Dict[str, Any]:
    bullets = "\n".join(
        [
            f"- **{p.get('title','Ponto')}**: {p.get('value','...')} — {p.get('context','')}"
            for p in data_points
        ]
    )
    md = [
        f"# Narrativa para {audience}\n",
        f"_Tom: {tone}_\n",
        "## Pontos\n",
        bullets,
        "\n## Síntese\nTexto integrador aqui.\n",
    ]
    return {"title": f"Narrativa • {audience}", "content": "\n".join(md), "format": "markdown"}


def align_with_ecosystem(area: str) -> Dict[str, Any]:
    return {
        "aligned": True,
        "area": area,
        "note": "Alinhado com FLUX/SYNTARIS/ASTRAEL/VORTEXIS.",
    }


def validate_ethics_and_coauthorship(content: str) -> Dict[str, Any]:
    # Validação simplificada; aqui entrariam regras de compliance
    ok = True
    notes = ["Coautoria humano–IA deve ser reconhecida."]
    return {"ok": ok, "notes": notes}


# ---- Catálogo de funções (para function calling) ----
FUNCTIONS = [
    {
        "name": "generate_documentation",
        "description": "Converte informações em documentos estruturados",
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {"type": "string"},
                "audience": {"type": "string"},
                "format": {"type": "string", "enum": ["markdown", "pdf"]},
                "sections": {"type": "array", "items": {"type": "string"}},
                "tone": {"type": "string"},
                "include_summary": {"type": "boolean"},
            },
            "required": ["topic", "audience", "format"],
        },
    },
    {
        "name": "create_formal_proposal",
        "description": "Estrutura propostas comerciais/colaborativas",
        "parameters": {
            "type": "object",
            "properties": {
                "partner_name": {"type": "string"},
                "scope": {"type": "string"},
                "deliverables": {"type": "array", "items": {"type": "string"}},
                "terms": {"type": "string"},
                "format": {"type": "string", "enum": ["markdown", "pdf"]},
            },
            "required": ["partner_name", "scope"],
        },
    },
    {
        "name": "translate_and_format",
        "description": "Tradução e formatação",
        "parameters": {
            "type": "object",
            "properties": {
                "input_text": {"type": "string"},
                "target_format": {
                    "type": "string",
                    "enum": ["markdown", "pdf", "pptx"],
                },
                "target_language": {"type": "string"},
            },
            "required": ["input_text", "target_format"],
        },
    },
    {
        "name": "synthesize_narrative",
        "description": "Transforma dados/observações em narrativa clara",
        "parameters": {
            "type": "object",
            "properties": {
                "data_points": {"type": "array", "items": {"type": "object"}},
                "audience": {"type": "string"},
                "tone": {"type": "string"},
                "length": {"type": "integer"},
            },
            "required": ["data_points", "audience"],
        },
    },
    {
        "name": "align_with_ecosystem",
        "description": "Alinha com FLUX/SYNTARIS/ASTRAEL/VORTEXIS",
        "parameters": {
            "type": "object",
            "properties": {"area": {"type": "string"}},
            "required": ["area"],
        },
    },
    {
        "name": "validate_ethics_and_coauthorship",
        "description": "Verifica ética e coautoria humano–IA",
        "parameters": {
            "type": "object",
            "properties": {"content": {"type": "string"}},
            "required": ["content"],
        },
    },
]


# ---- Loop simples: 1 chamada com function calling + 1 resposta final ----
def run_lumora(user_content: str, model: str = "gpt-4o-mini", temperature: float = 0.2):
    system_path = os.path.join(os.path.dirname(__file__), "system_prompt.md")
    messages = [
        {"role": "system", "content": open(system_path).read()},
        {"role": "user", "content": user_content},
    ]

    # 1) decisão do modelo (chamar função ou responder direto)
    resp = client.chat.completions.create(
        model=model,  # ajuste ao seu modelo
        messages=messages,
        tools=[{"type": "function", "function": f} for f in FUNCTIONS],
        tool_choice="auto",
        temperature=temperature,
    )
    msg = resp.choices[0].message

    # 2) Se chamou função, executa e pede a resposta final
    if getattr(msg, "tool_calls", None):
        # Anexa a mensagem do assistente com as tool_calls
        messages.append({"role": "assistant", "tool_calls": msg.tool_calls})

        # Executa cada chamada e adiciona mensagens de tool com o tool_call_id
        for call in msg.tool_calls:
            name = call.function.name
            args = json.loads(call.function.arguments or "{}")

            if name == "generate_documentation":
                output = generate_documentation(**args)
            elif name == "create_formal_proposal":
                output = create_formal_proposal(**args)
            elif name == "translate_and_format":
                output = translate_and_format(**args)
            elif name == "synthesize_narrative":
                output = synthesize_narrative(**args)
            elif name == "align_with_ecosystem":
                output = align_with_ecosystem(**args)
            elif name == "validate_ethics_and_coauthorship":
                output = validate_ethics_and_coauthorship(**args)
            else:
                output = {"error": "função não implementada"}

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call.id,
                    "content": json.dumps(output, ensure_ascii=False),
                }
            )

        final = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
        )
        return final.choices[0].message.content

    # 3) Caso não precise de função
    return msg.content


if __name__ == "__main__":
    print(
        run_lumora(
            "Preciso de uma Proposta Lumora para parceria com a empresa Aurora Research, focando documentação e portal público.",
            model=os.getenv("LUMORA_MODEL", "gpt-4o-mini"),
            temperature=float(os.getenv("LUMORA_TEMPERATURE", "0.2")),
        )
    )

