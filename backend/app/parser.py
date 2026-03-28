from typing import Dict, Any, Optional
import json
import os
import re
import httpx

try:
    import anthropic
except Exception:
    anthropic = None

def parse_resume(text: str) -> Dict[str, Any]:
    tokens = [t for t in text.replace("\n", " ").split(" ") if t]
    return {"characters": len(text), "tokens": len(tokens), "sections": [], "raw": text}


def extract_profile(text: str) -> Dict[str, Any]:
    minimax_key = os.getenv("MINIMAX_API_KEY")
    minimax_base = os.getenv("MINIMAX_BASE_URL", "https://api.minimax.chat/v1")
    minimax_model = os.getenv("MINIMAX_MODEL", "abab6.5-chat")
    if minimax_key:
        try:
            prompt = (
                "请从以下简历内容中提取信息，并返回JSON："
                "键名为 gpa, toefl, ielts, hsk；若没有对应信息，值设为空字符串。\n\n"
                f"{text}"
            )
            payload = {
                "model": minimax_model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 400,
            }
            url = f"{minimax_base.rstrip('/')}/text/chatcompletions"
            headers = {"Authorization": f"Bearer {minimax_key}", "Content-Type": "application/json"}
            resp = httpx.post(url, json=payload, headers=headers, timeout=30)
            data = resp.json()
            content = None
            if isinstance(data, dict) and data.get("choices"):
                ch0 = data["choices"][0]
                if isinstance(ch0, dict):
                    msg = ch0.get("message")
                    if isinstance(msg, dict):
                        content = msg.get("content")
                    if content is None:
                        content = ch0.get("text")
            if isinstance(content, str):
                m = re.search(r"\{[\s\S]*\}", content)
                raw_json = m.group(0) if m else content
                parsed = json.loads(raw_json)
                return {
                    "gpa": parsed.get("gpa"),
                    "toefl": parsed.get("toefl"),
                    "ielts": parsed.get("ielts"),
                    "hsk": parsed.get("hsk"),
                    "hsk_level": parsed.get("hsk_level") or parsed.get("hsk"),
                    "hsk_score": parsed.get("hsk_score"),
                    "majors": parsed.get("majors") or [],
                    "cities": parsed.get("cities") or [],
                    "skills": parsed.get("skills") or [],
                }
        except Exception:
            pass
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
                "hsk_level": parsed.get("hsk_level") or parsed.get("hsk"),
                "hsk_score": parsed.get("hsk_score"),
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
    hsk_level = None
    hsk_score = None
    t = text
    gpa_match = re.search(r"\bGPA[:\s]*([0-4](?:\.\d{1,2})?)", t, flags=re.IGNORECASE)
    if gpa_match:
        try:
            g = float(gpa_match.group(1))
            if 0.0 <= g <= 4.0:
                gpa = str(g)
        except Exception:
            pass
    toefl_match = re.search(r"\bTOEFL\b[^\d]{0,20}(\d{2,3})", t, flags=re.IGNORECASE)
    if toefl_match:
        try:
            v = int(toefl_match.group(1))
            if 0 <= v <= 120:
                toefl = str(v)
        except Exception:
            pass
    ielts_match = re.search(r"\bIELTS\b[^\d]{0,20}(\d(?:\.\d)?)", t, flags=re.IGNORECASE)
    if ielts_match:
        try:
            v = float(ielts_match.group(1))
            if 0 <= v <= 9:
                ielts = str(v)
        except Exception:
            pass
    hsk_match = re.search(r"HSK(?:\s*Level|\s*等级)?\s*([1-6])(?:\s*[≥>=]?\s*(\d{2,3}))?", t, flags=re.IGNORECASE)
    if hsk_match:
        hsk_level = hsk_match.group(1)
        hsk_score = hsk_match.group(2) if hsk_match.group(2) else None
    score_match = re.search(r"HSK.*?(?:Score|分数)[:：]?\s*(\d{2,3})", t, flags=re.IGNORECASE)
    if score_match and not hsk_score:
        hsk_score = score_match.group(1)
    majors = []
    cities = []
    skills = []
    return {
        "gpa": gpa,
        "toefl": toefl,
        "ielts": ielts,
        "hsk": hsk_level or hsk,
        "hsk_level": hsk_level,
        "hsk_score": hsk_score,
        "majors": majors,
        "cities": cities,
        "skills": skills
    }
