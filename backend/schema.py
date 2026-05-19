from pydantic import BaseModel, EmailStr, field_validator
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
    
    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v) > 72:
            raise ValueError("Password cannot exceed 72 characters")
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v
    
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
    name: str
    length: float
    width: float
    height: float
    weight: float
    photo_url: Optional[str] = None
    company_id: int
    class Config:
        from_attributes = True
        
class PalletPresetCreate(BaseModel):
    name: str
    length: float
    width: float
    height: float
    max_weight: float
    company_id: int
    
class PalletPresetOut(BaseModel):
    id: int
    name: str
    length: float
    width: float
    height: float
    max_weight: float
    class Config:
        from_attributes = True