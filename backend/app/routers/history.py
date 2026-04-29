from fastapi import APIRouter
from app.services import data_loader as dl

router = APIRouter()

@router.get("/")
def get_all_history():
    return dl.loyalty_history_df.to_dict(orient="records")