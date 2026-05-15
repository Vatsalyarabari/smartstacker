from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Company
from schema import CompanyCreate, CompanyOut

router = APIRouter(prefix="/companies", tags=["companies"])

@router.post("/", response_model=CompanyOut)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    if db.query(Company).filter(Company.name == company.name).first():
        raise HTTPException(status_code=400, detail="Company already exists")
    new_company = Company(name=company.name)
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company