from typing import Dict, Any, Optional
import json
import os

try:
    import anthropic
except Exception:
    anthropic = None

def parse_resume(text: str) -> Dict[str, Any]:
    tokens = [t for t in text.replace("\n", " ").split(" ") if t]
    return {"characters": len(text), "tokens": len(tokens), "sections": [], "raw": text}


def extract_profile(text: str) -> Dict[str, Any]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    base_url = os.getenv("ANTHROPIC_BASE_URL")
    if anthropic and api_key:
        try:
            client = anthropic.Anthropic(api_key=api_key, base_url=base_url) if hasattr(anthropic, "Anthropic") else None
            system = "Extract candidate profile as compact JSON with keys: gpa, toefl, ielts, hsk, majors, cities, skills."
            prompt = f"Resume:\n{text}\nReturn JSON only."
            resp = client.messages.create(
                model=os.getenv("ANTHROPIC_MODEL", "MiniMax-M2.7"),
                max_tokens=400,
                system=system,
                messages=[{"role": "user", "content": [{"type": "text", "text": prompt}]}],
            )
            content = ""
            for b in resp.content:
                if getattr(b, "type", None) == "text":
                    content += b.text
            parsed = json.loads(content.strip())
            return {
                "gpa": parsed.get("gpa"),
                "toefl": parsed.get("toefl"),
                "ielts": parsed.get("ielts"),
                "hsk": parsed.get("hsk"),
                "majors": parsed.get("majors") or [],
                "cities": parsed.get("cities") or [],
                "skills": parsed.get("skills") or [],
            }
        except Exception:
            pass
    gpa = None
    toefl = None
    ielts = None
    hsk = None
    majors = []
    cities = []
    skills = []
    return {"gpa": gpa, "toefl": toefl, "ielts": ielts, "hsk": hsk, "majors": majors, "cities": cities, "skills": skills}
