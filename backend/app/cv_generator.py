from typing import Dict, Any, Optional, List


def generate_cv(profile: Dict[str, Any], target_program: Optional[str] = None) -> str:
    name = profile.get("name") or "Candidate"
    education: List[str] = profile.get("education") or []
    skills: List[str] = profile.get("skills") or []
    lines: List[str] = []
    lines.append(name)
    if target_program:
        lines.append(f"Target: {target_program}")
    for e in education:
        lines.append(f"Education: {e}")
    if skills:
        lines.append("Skills: " + ", ".join(skills))
    return "\n".join(lines)
