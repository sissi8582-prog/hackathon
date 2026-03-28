from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os

try:
    import anthropic
except Exception:
    anthropic = None

from .parser import parse_resume
from .rag_engine import search_programs
from .cv_generator import generate_cv

app = FastAPI()


class ChatInput(BaseModel):
    text: str
    system: Optional[str] = None
    model: Optional[str] = None
    max_tokens: Optional[int] = 512


class ParseInput(BaseModel):
    text: str


class RAGQuery(BaseModel):
    query: str


class CVRequest(BaseModel):
    profile: Dict[str, Any]
    target_program: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/parse")
def api_parse(payload: ParseInput):
    return parse_resume(payload.text)


@app.post("/api/rag")
def api_rag(payload: RAGQuery):
    return {"matches": search_programs(payload.query)}


@app.post("/api/cv")
def api_cv(payload: CVRequest):
    return {"cv": generate_cv(payload.profile, payload.target_program)}


@app.post("/api/llm/chat")
def api_chat(payload: ChatInput):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    base_url = os.getenv("ANTHROPIC_BASE_URL")
    if anthropic is None:
        raise HTTPException(status_code=500, detail="anthropic sdk not installed")
    if not api_key:
        raise HTTPException(status_code=400, detail="missing ANTHROPIC_API_KEY")
    client = anthropic.Anthropic(api_key=api_key, base_url=base_url) if hasattr(anthropic, "Anthropic") else None
    if client is None:
        raise HTTPException(status_code=500, detail="anthropic client unavailable")
    model = payload.model or "MiniMax-M2.7"
    max_tokens = payload.max_tokens or 512
    system = payload.system or "You are a helpful assistant."
    try:
        resp = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": [{"type": "text", "text": payload.text}]}],
        )
        texts: List[str] = []
        for block in resp.content:
            if getattr(block, "type", None) == "text":
                texts.append(block.text)
        return {"text": "\n".join(texts)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
