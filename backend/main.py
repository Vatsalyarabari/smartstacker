from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from routers import auth, companies, boxes, presets, optimizer

app = FastAPI()

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(boxes.router)
app.include_router(presets.router)
app.include_router(optimizer.router)

@app.get("/")
def read_root():
    return {"status": "SmartStacker API running"}