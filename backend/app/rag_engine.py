import json
from pathlib import Path
from typing import List, Dict, Any

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "programs.json"


def search_programs(query: str) -> List[Dict[str, Any]]:
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    q = set(query.lower().split())
    results: List[Dict[str, Any]] = []
    for p in data:
        tags = set([t.lower() for t in p.get("keywords", [])])
        score = len(q & tags)
        if score > 0:
            item = dict(p)
            item["score"] = score
            results.append(item)
    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    return results[:10]
