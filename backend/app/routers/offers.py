from fastapi import APIRouter
from app.services import data_loader as dl

router = APIRouter()

@router.get("/")
def get_all_offers():
    return dl.offers_df.to_dict(orient="records")