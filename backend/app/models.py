from typing import Optional
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import Session
import json
from .database import Base, engine, SessionLocal
from pathlib import Path


class University(Base):
    __tablename__ = "universities"
    id = Column(Integer, primary_key=True, index=True)
    ext_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    city = Column(String, index=True)
    qs_rank = Column(Integer, nullable=True)
    cn_rank = Column(Integer, nullable=True)
    fees = Column(Integer, nullable=True)
    deadline = Column(String, nullable=True)
    scholarships = Column(Text, nullable=True)
    official_link = Column(String, nullable=True)
    fields_offered = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    program_ext_id = Column(String, index=True, nullable=False)

class Competition(Base):
    __tablename__ = "competitions"
    id = Column(Integer, primary_key=True, index=True)
    ext_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    fields_offered = Column(Text, nullable=True)
    city = Column(String, index=True, nullable=True)
    level = Column(String, nullable=True)
    link = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    description = Column(Text, nullable=True)

class Internship(Base):
    __tablename__ = "internships"
    id = Column(Integer, primary_key=True, index=True)
    ext_id = Column(String, unique=True, index=True, nullable=False)
    company = Column(String, index=True, nullable=True)
    name = Column(String, index=True, nullable=False)
    fields_offered = Column(Text, nullable=True)
    city = Column(String, index=True, nullable=True)
    link = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)

class PolicyLink(Base):
    __tablename__ = "policy_links"
    id = Column(Integer, primary_key=True, index=True)
    university_ext_id = Column(String, index=True, nullable=True)
    university_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    link = Column(String, nullable=False)

def seed_universities_from_json(path: Path):
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        count = db.query(University).count()
        if count > 0:
            return
        data = json.loads(path.read_text(encoding="utf-8"))
        for item in data:
            u = University(
                ext_id=item.get("id"),
                name=item.get("university") or item.get("name"),
                city=item.get("city"),
                qs_rank=item.get("qs_rank"),
                cn_rank=item.get("cn_rank"),
                fees=item.get("fees"),
                deadline=item.get("deadline"),
                scholarships=json.dumps(item.get("scholarships") or [] , ensure_ascii=False),
                official_link=item.get("official_link"),
                fields_offered=json.dumps(item.get("fields") or [] , ensure_ascii=False),
                requirements=json.dumps(item.get("requirements") or {} , ensure_ascii=False),
            )
            db.add(u)
        db.commit()
    finally:
        db.close()
