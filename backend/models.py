from database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship, mapped_column

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    users = relationship("User", back_populates="company")
    boxes = relationship("Box", back_populates="company")
    pallet_presets = relationship("PalletPreset", back_populates="company")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    company_id = Column(Integer, ForeignKey("companies.id"))

    company = relationship("Company", back_populates="users")


class PalletPreset(Base):
    __tablename__ = "pallet_presets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    length = Column(Float)
    width = Column(Float)
    height = Column(Float)
    max_weight = Column(Float)
    max_height = Column(Float)
    company_id = Column(Integer, ForeignKey("companies.id"))

    company = relationship("Company", back_populates="pallet_presets")


class Pallet(Base):
    __tablename__ = "pallets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    length = Column(Float)
    width = Column(Float)
    height = Column(Float)
    max_weight = Column(Float)
    max_height = Column(Float)

    boxes = relationship("Box", back_populates="pallet")


class Box(Base):
    __tablename__ = "boxes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    length = Column(Float)
    width = Column(Float)
    height = Column(Float)
    weight = Column(Float)
    photo_url = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    pallet_id = Column(Integer, ForeignKey("pallets.id"), nullable=True)

    company = relationship("Company", back_populates="boxes")
    pallet = relationship("Pallet", back_populates="boxes")