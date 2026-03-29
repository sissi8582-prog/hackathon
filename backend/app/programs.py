from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json
from .database import get_db
from .models import University, Competition, Internship, PolicyLink

router = APIRouter(prefix="/api", tags=["programs"])

def canonical_field(s: str) -> str:
    key = (s or "").strip().lower()
    mapping = {
        "medicine": "Medicine",
        "medical": "Medicine",
        "engineering": "Engineering",
        "computer science": "Computer Science",
        "computer-science": "Computer Science",
        "cs": "Computer Science",
        "software engineering": "Computer Science",
        "business": "Business & Economics",
        "business & economics": "Business & Economics",
        "economics": "Business & Economics",
        "language": "Language & Culture",
        "language & culture": "Language & Culture",
        "culture": "Language & Culture",
        "linguistics": "Language & Culture",
    }
    return mapping.get(key, s)

def canonicalize_list(arr: List[str]) -> List[str]:
    out = []
    seen = set()
    for f in arr or []:
        cf = canonical_field(f)
        if cf and cf not in seen:
            seen.add(cf)
            out.append(cf)
    return out


class FilterQuery(BaseModel):
    cities: Optional[List[str]] = None
    fields: Optional[List[str]] = None
    sort_by: str = "qs"


@router.get("/options")
def get_options(db: Session = Depends(get_db)):
    rows = db.query(University).all()
    cities = sorted(list({r.city for r in rows if r.city}))
    fields = set()
    for r in rows:
        arr = []
        try:
            arr = json.loads(r.fields_offered) if r.fields_offered else []
        except Exception:
            arr = []
        for f in canonicalize_list(arr):
            fields.add(f)
    fields = sorted(list(fields))
    return {"cities": cities, "fields": fields, "sort_by": ["qs", "cn"]}


@router.post("/programs/filter")
def filter_programs(q: FilterQuery, db: Session = Depends(get_db)):
    rows = db.query(University).all()
    res = []
    q_fields = canonicalize_list(q.fields or [])
    for r in rows:
        if q.cities and "ALL" not in q.cities:
            if r.city not in q.cities:
                continue
        fields = []
        try:
            fields = json.loads(r.fields_offered) if r.fields_offered else []
        except Exception:
            fields = []
        fields = canonicalize_list(fields)
        if q_fields and "ALL" not in (q.fields or []):
            if not set(fields).intersection(set(q_fields)):
                continue
        req = {}
        try:
            req = json.loads(r.requirements) if r.requirements else {}
        except Exception:
            req = {}
        res.append({
            "id": r.ext_id,
            "name": r.name,
            "university": r.name,
            "city": r.city,
            "fields": fields,
            "qs_rank": r.qs_rank,
            "cn_rank": r.cn_rank,
            "fees": r.fees,
            "deadline": r.deadline,
            "scholarships": json.loads(r.scholarships) if r.scholarships else [],
            "official_link": r.official_link,
            "requirements": req
        })
    key = "qs_rank" if q.sort_by == "qs" else "cn_rank"
    res.sort(key=lambda x: x.get(key) or 1e9)
    return {"programs": res}


@router.get("/programs/{program_id}")
def program_detail(program_id: str, db: Session = Depends(get_db)):
    r = db.query(University).filter(University.ext_id == program_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="not found")
    fields = []
    try:
        fields = json.loads(r.fields_offered) if r.fields_offered else []
    except Exception:
        fields = []
    req = {}
    try:
        req = json.loads(r.requirements) if r.requirements else {}
    except Exception:
        req = {}
    return {
        "id": r.ext_id,
        "name": r.name,
        "university": r.name,
        "city": r.city,
        "fields": fields,
        "qs_rank": r.qs_rank,
        "cn_rank": r.cn_rank,
        "fees": r.fees,
        "deadline": r.deadline,
        "scholarships": json.loads(r.scholarships) if r.scholarships else [],
        "official_link": r.official_link,
        "requirements": req
    }


class Profile(BaseModel):
    gpa: Optional[float] = None
    toefl: Optional[int] = None
    ielts: Optional[float] = None
    hsk: Optional[int] = None
    majors: Optional[List[str]] = []
    cities: Optional[List[str]] = []
    skills: Optional[List[str]] = []


@router.post("/programs/{program_id}/compare")
def compare_requirements(program_id: str, profile: Profile, db: Session = Depends(get_db)):
    r = db.query(University).filter(University.ext_id == program_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="not found")
    
    missing_requirements = []
    try:
        req = json.loads(r.requirements) if r.requirements else {}
    except Exception:
        req = {}
    
    # GPA comparison
    gpa_min = req.get("gpa_min")
    if gpa_min is not None:
        if profile.gpa is None:
            missing_requirements.append({
                "type": "gpa",
                "message": f"Missing GPA information",
                "required": f"Minimum GPA: {gpa_min}",
                "user_value": "Not provided"
            })
        elif profile.gpa < gpa_min:
            missing_requirements.append({
                "type": "gpa",
                "message": f"Your GPA: {profile.gpa} | Required: {gpa_min}",
                "required": f"Minimum GPA: {gpa_min}",
                "user_value": f"{profile.gpa}"
            })
    
    # TOEFL comparison
    toefl_min = req.get("toefl_min")
    if toefl_min is not None:
        if profile.toefl is None:
            missing_requirements.append({
                "type": "toefl",
                "message": f"Missing TOEFL score",
                "required": f"Minimum TOEFL: {toefl_min}",
                "user_value": "Not provided"
            })
        elif profile.toefl < toefl_min:
            missing_requirements.append({
                "type": "toefl",
                "message": f"Your TOEFL: {profile.toefl} | Required: {toefl_min}",
                "required": f"Minimum TOEFL: {toefl_min}",
                "user_value": f"{profile.toefl}"
            })
    
    # IELTS comparison
    ielts_min = req.get("ielts_min")
    if ielts_min is not None:
        if profile.ielts is None:
            missing_requirements.append({
                "type": "ielts",
                "message": f"Missing IELTS score",
                "required": f"Minimum IELTS: {ielts_min}",
                "user_value": "Not provided"
            })
        elif profile.ielts < ielts_min:
            missing_requirements.append({
                "type": "ielts",
                "message": f"Your IELTS: {profile.ielts} | Required: {ielts_min}",
                "required": f"Minimum IELTS: {ielts_min}",
                "user_value": f"{profile.ielts}"
            })
    
    # HSK comparison
    hsk_required = req.get("hsk_required")
    if hsk_required:
        if profile.hsk is None:
            missing_requirements.append({
                "type": "hsk",
                "message": f"Missing HSK certificate",
                "required": "HSK certificate required",
                "user_value": "Not provided"
            })
        elif profile.hsk <= 0:
            missing_requirements.append({
                "type": "hsk",
                "message": f"Invalid HSK score: {profile.hsk}",
                "required": "Valid HSK certificate required",
                "user_value": f"{profile.hsk}"
            })
    
    is_eligible = len(missing_requirements) == 0
    
    return {
        "is_eligible": is_eligible,
        "missing_requirements": missing_requirements,
        "program_info": {
            "id": r.ext_id,
            "name": r.name,
            "university": r.name,
            "requirements": req
        }
    }

class OppQuery(BaseModel):
    cities: Optional[List[str]] = None
    fields: Optional[List[str]] = None

@router.get("/competitions")
def list_competitions(q: OppQuery = Depends(), db: Session = Depends(get_db)):
    def normalize(val):
        if val is None:
            return []
        if isinstance(val, list):
            return val
        s = str(val)
        if "," in s:
            return [x.strip() for x in s.split(",") if x.strip()]
        return [s] if s.strip() else []
    cities = normalize(q.cities)
    fields_filter = canonicalize_list(normalize(q.fields))
    rows = db.query(Competition).all()
    res = []
    for r in rows:
        fields = []
        try:
            fields = json.loads(r.fields_offered) if r.fields_offered else []
        except Exception:
            fields = []
        fields = canonicalize_list(fields)
        if cities and "ALL" not in cities:
            if r.city not in cities:
                continue
        if fields_filter and "ALL" not in fields_filter:
            if not set(fields).intersection(set(fields_filter)):
                continue
        res.append({
            "id": r.ext_id,
            "name": r.name,
            "city": r.city,
            "level": r.level,
            "fields": fields,
            "link": r.link,
            "deadline": r.deadline,
            "description": r.description
        })
    return {"competitions": res}

@router.get("/internships")
def list_internships(q: OppQuery = Depends(), db: Session = Depends(get_db)):
    def normalize(val):
        if val is None:
            return []
        if isinstance(val, list):
            return val
        s = str(val)
        if "," in s:
            return [x.strip() for x in s.split(",") if x.strip()]
        return [s] if s.strip() else []
    cities = normalize(q.cities)
    fields_filter = canonicalize_list(normalize(q.fields))
    rows = db.query(Internship).all()
    res = []
    for r in rows:
        fields = []
        try:
            fields = json.loads(r.fields_offered) if r.fields_offered else []
        except Exception:
            fields = []
        fields = canonicalize_list(fields)
        if cities and "ALL" not in cities:
            if r.city not in cities:
                continue
        if fields_filter and "ALL" not in fields_filter:
            if not set(fields).intersection(set(fields_filter)):
                continue
        res.append({
            "id": r.ext_id,
            "company": r.company,
            "name": r.name,
            "city": r.city,
            "fields": fields,
            "link": r.link,
            "deadline": r.deadline,
            "description": r.description,
            "requirements": r.requirements
        })
    return {"internships": res}

@router.get("/policies")
def list_policies(db: Session = Depends(get_db)):
    rows = db.query(PolicyLink).all()
    res = []
    for r in rows:
        res.append({
            "university": r.university_name,
            "title": r.title,
            "link": r.link
        })
    return {"policies": res}
