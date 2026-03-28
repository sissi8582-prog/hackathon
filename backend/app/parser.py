from typing import Dict, Any


def parse_resume(text: str) -> Dict[str, Any]:
    tokens = [t for t in text.replace("\n", " ").split(" ") if t]
    return {"characters": len(text), "tokens": len(tokens), "sections": [], "raw": text}
