from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Box
from schema import BoxCreate, BoxOut
from typing import List

router = APIRouter(prefix="/boxes", tags=["boxes"])

@router.post("/", response_model=BoxOut)
def create_box(box: BoxCreate, db: Session = Depends(get_db)):
    new_box = Box(**box.model_dump())
    db.add(new_box)
    db.commit()
    db.refresh(new_box)
    return new_box

@router.get("/company/{company_id}", response_model=List[BoxOut])
def get_boxes(company_id: int, db: Session = Depends(get_db)):
    return db.query(Box).filter(Box.company_id == company_id).all()

@router.delete("/{box_id}")
def delete_box(box_id: int, db: Session = Depends(get_db)):
    box = db.query(Box).filter(Box.id == box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")
    db.delete(box)
    db.commit()
    return {"message": "Box deleted"}