from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Box, PalletPreset
from pydantic import BaseModel
from typing import List, Optional
from py3dbp import Packer, Bin, Item

router = APIRouter(prefix="/optimizer", tags=["optimizer"])

class BoxRequest(BaseModel):
    box_id: Optional[int] = None
    name: str
    length: float
    width: float
    height: float
    weight: float
    quantity: int

class PalletRequest(BaseModel):
    length: float
    width: float
    height: float
    max_weight: float

class OptimizeRequest(BaseModel):
    pallet: PalletRequest
    boxes: List[BoxRequest]

class PlacedBox(BaseModel):
    name: str
    length: float
    width: float
    height: float
    weight: float
    position_x: float
    position_y: float
    position_z: float
    rotation_type: int

class OptimizeResult(BaseModel):
    placed_boxes: List[PlacedBox]
    unfitted_boxes: List[str]
    total_boxes: int
    total_weight: float
    volume_utilization: float

@router.post("/", response_model=OptimizeResult)
def optimize(request: OptimizeRequest):
    packer = Packer()

    packer.add_bin(Bin(
        "pallet",
        request.pallet.length,
        request.pallet.width,
        request.pallet.height,
        request.pallet.max_weight
    ))

    for box_req in request.boxes:
        for i in range(box_req.quantity):
            packer.add_item(Item(
                f"{box_req.name}_{i}",
                box_req.length,
                box_req.width,
                box_req.height,
                box_req.weight
            ))

    packer.pack()

    bin = packer.bins[0]
    placed = []
    for item in bin.items:
        placed.append(PlacedBox(
            name=item.name,
            length=float(item.width),
            width=float(item.height),
            height=float(item.depth),
            weight=float(item.weight),
            position_x=float(item.position[0]),
            position_y=float(item.position[1]),
            position_z=float(item.position[2]),
            rotation_type=item.rotation_type
        ))

    unfitted = [item.name for item in bin.unfitted_items]

    total_weight = sum(float(i.weight) for i in bin.items)
    vol_used = sum(float(i.width) * float(i.height) * float(i.depth) for i in bin.items)
    vol_total = request.pallet.length * request.pallet.width * request.pallet.height
    utilization = round((vol_used / vol_total) * 100, 2) if vol_total > 0 else 0

    return OptimizeResult(
        placed_boxes=placed,
        unfitted_boxes=unfitted,
        total_boxes=len(placed),
        total_weight=round(total_weight, 2),
        volume_utilization=utilization
    )


@router.post("/from-preset/{preset_id}", response_model=OptimizeResult)
def optimize_from_preset(
    preset_id: int,
    boxes: List[BoxRequest],
    db: Session = Depends(get_db)
):
    preset = db.query(PalletPreset).filter(PalletPreset.id == preset_id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")

    pallet = PalletRequest(
        length=preset.length,
        width=preset.width,
        height=preset.height,
        max_weight=preset.max_weight
    )

    return optimize(OptimizeRequest(pallet=pallet, boxes=boxes))