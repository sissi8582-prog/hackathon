from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .rag_engine import search_programs, DATA_PATH
import json

router = APIRouter(prefix="/api", tags=["programs"])


class FilterQuery(BaseModel):
    cities: Optional[List[str]] = None
    fields: Optional[List[str]] = None
    sort_by: str = "qs"


@router.get("/options")
def get_options():
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    cities = sorted(list({p.get("city") for p in data if p.get("city")}))
    fields = sorted(list({f for p in data for f in p.get("fields", [])}))
    return {"cities": cities, "fields": fields, "sort_by": ["qs", "cn"]}


@router.post("/programs/filter")
def filter_programs(q: FilterQuery):
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    res = []
    for p in data:
        if q.cities and "ALL" not in q.cities:
            if p.get("city") not in q.cities:
                continue
        if q.fields and "ALL" not in q.fields:
            if not set(p.get("fields", [])).intersection(set(q.fields)):
                continue
        res.append(p)
    key = "qs_rank" if q.sort_by == "qs" else "cn_rank"
    res.sort(key=lambda x: x.get(key) or 1e9)
    return {"programs": res}


@router.get("/programs/{program_id}")
def program_detail(program_id: str):
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    for p in data:
        if p.get("id") == program_id:
            return p
    raise HTTPException(status_code=404, detail="not found")


class Profile(BaseModel):
    gpa: Optional[float] = None
    toefl: Optional[int] = None
    ielts: Optional[float] = None
    hsk: Optional[int] = None
    majors: Optional[List[str]] = []
    cities: Optional[List[str]] = []
    skills: Optional[List[str]] = []


@router.post("/programs/{program_id}/compare")
def compare_requirements(program_id: str, profile: Profile):
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = []
    prog = None
    for p in data:
        if p.get("id") == program_id:
            prog = p
            break
    if not prog:
        raise HTTPException(status_code=404, detail="not found")
    
    missing_requirements = []
    req = prog.get("requirements", {})
    
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
            "id": prog.get("id"),
            "name": prog.get("name"),
            "university": prog.get("university"),
            "requirements": req
        }
    }
