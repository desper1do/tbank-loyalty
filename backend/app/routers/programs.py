from fastapi import APIRouter
from app.services import data_loader as dl

router = APIRouter()

@router.get("/")
def get_loyalty_programs():
    return dl.loyalty_programs_df.to_dict(orient="records")