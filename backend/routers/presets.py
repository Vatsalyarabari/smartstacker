from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import PalletPreset
from schema import PalletPresetCreate, PalletPresetOut
from typing import List

router = APIRouter(prefix="/presets", tags=["presets"])

@router.post("/", response_model=PalletPresetOut)
def create_preset(preset: PalletPresetCreate, db: Session = Depends(get_db)):
    new_preset = PalletPreset(**preset.model_dump())
    db.add(new_preset)
    db.commit()
    db.refresh(new_preset)
    return new_preset

@router.get("/company/{company_id}", response_model=List[PalletPresetOut])
def get_presets(company_id: int, db: Session = Depends(get_db)):
    return db.query(PalletPreset).filter(PalletPreset.company_id == company_id).all()

@router.delete("/{preset_id}")
def delete_preset(preset_id: int, db: Session = Depends(get_db)):
    preset = db.query(PalletPreset).filter(PalletPreset.id == preset_id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    db.delete(preset)
    db.commit()
    return {"message": "Preset deleted"}