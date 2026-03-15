from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
from routers import event, station, trajectory
from database import connect_db, close_db, is_connected

load_dotenv()

# Configure logging
log_file = os.path.join(os.path.dirname(__file__), "..", "log.txt")
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Event Horizon API", version="1.0.0")

# Request logging middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log incoming request
        logger.info(f"METHOD: {request.method} | PATH: {request.url.path} | CLIENT: {request.client.host if request.client else 'Unknown'}")
        
        response = await call_next(request)
        
        # Log response status
        logger.info(f"RESPONSE: {response.status_code} | METHOD: {request.method} | PATH: {request.url.path}")
        
        return response

app.add_middleware(LoggingMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type","Authorization","ngrok-skip-browser-warning"],
)

# Events on startup and shutdown
@app.on_event("startup")
async def startup_event():
    try:
        await connect_db()
    except Exception as e:
        print(f"⚠️  Warning: {str(e)}")
        print("⚠️  MongoDB is not available. Endpoints will fail until MongoDB is running.")

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()

# Include routers
app.include_router(event.router, prefix="/event", tags=["event"])
app.include_router(station.router, prefix="/station", tags=["station"])
app.include_router(trajectory.router, prefix="/trajectory", tags=["trajectory"])

@app.get("/")
async def root():
    return {"message": "Event Horizon API"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "mongodb_connected": is_connected()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
