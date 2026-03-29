import json
import re
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from backend.app.models import Internship
from backend.app.database import DATABASE_URL

def sanitize_link(s: str | None) -> str | None:
    if s is None:
        return None
    txt = str(s).strip()
    txt = re.sub(r"[`'\"]", "", txt)
    txt = txt.strip()
    m = re.search(r"(https?://[^\s]+)", txt)
    return m.group(1) if m else None

def canonical_field(s: str) -> str:
    key = (s or "").strip().lower()
    mapping = {
        "medicine": "Medicine",
        "medical": "Medicine",
        "engineering": "Engineering",
        "computer science": "Computer Science",
        "cs": "Computer Science",
        "business & economics": "Business & Economics",
        "business": "Business & Economics",
        "language & culture": "Language & Culture",
        "language": "Language & Culture",
    }
    return mapping.get(key, s)

def canonicalize_fields(arr):
    out = []
    seen = set()
    for f in arr or []:
        cf = canonical_field(f)
        if cf and cf not in seen:
            seen.add(cf)
            out.append(cf)
    return out

def import_internships(json_path: Path, clear: bool = False):
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    try:
        if clear:
            db.query(Internship).delete()
            db.commit()
        data = json.loads(json_path.read_text(encoding="utf-8"))
        items = data.get("internships") or []
        imported = 0
        for it in items:
            ext_id = it.get("ext_id")
            name = it.get("name")
            company = it.get("company")
            fields = canonicalize_fields(it.get("fields_offered") or [])
            link = sanitize_link(it.get("link"))
            desc = it.get("description")
            existing = db.query(Internship).filter(Internship.ext_id == ext_id).first()
            if existing:
                existing.company = company
                existing.name = name
                existing.fields_offered = json.dumps(fields, ensure_ascii=False)
                existing.city = None
                existing.link = link
                existing.deadline = None
                existing.description = desc
                existing.requirements = "{}"
            else:
                db.add(Internship(
                    ext_id=ext_id,
                    company=company,
                    name=name,
                    fields_offered=json.dumps(fields, ensure_ascii=False),
                    city=None,
                    link=link,
                    deadline=None,
                    description=desc,
                    requirements="{}"
                ))
            imported += 1
        db.commit()
        print(f"Imported internships: {imported}")
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Import internships from JSON")
    parser.add_argument("--json", type=str, default="knowledge/internships.json")
    parser.add_argument("--clear", action="store_true")
    args = parser.parse_args()
    p = Path(args.json)
    if not p.exists():
        print(f"JSON file not found: {p}")
        raise SystemExit(1)
    import_internships(p, clear=args.clear)
