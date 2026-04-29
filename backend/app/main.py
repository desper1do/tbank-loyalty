from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users, offers, history, programs

app = FastAPI(
    title="T-Bank Loyalty API",
    description="API для раздела лояльности Т-Банка",
    version="1.0.0",
)

# CORS — разрешаем фронту (React на 5173) и мобилке обращаться к API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(offers.router, prefix="/offers", tags=["Offers"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(programs.router, prefix="/loyalty-programs", tags=["Programs"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "T-Bank Loyalty API is running"}