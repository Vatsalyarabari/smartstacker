from pydantic import BaseModel, EmailStr
from typing import Optional

class CompanyCreate(BaseModel):
    name: str
    
class CompanyOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True
        
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    company_id: int
    
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    company_id: int
    class Config:
        from_attributes = True
        
class Token(BaseModel):
    access_token: str
    token_type: str
    
class BoxCreate(BaseModel):
    name: str
    length: float
    width: float
    height: float
    weight: float
    company_id: int

class BoxOut(BaseModel):
    id: int
    photo_url: Optional[str] = None
    class Config:
        from_attributes = True
        
class PalletPresetCreate(BaseModel):
    name: str
    length: float
    width: float
    height: float
    max_weight: float
    max_height: float
    company_id: int
    
class PalletPresetOut(BaseModel):
    id: int
    class Config:
        from_attributes = True