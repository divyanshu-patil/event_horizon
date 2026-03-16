from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
from routers import event, station, trajectory, velocity_curve
from database import connect_db, close_db, is_connected
# from mangum import Mangum

load_dotenv()

app = FastAPI(title="Event Horizon API", version="1.0.0")

# Request logging middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log incoming request
        response = await call_next(request)
        
        return response
    
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
        }
    )
    
app.add_middleware(LoggingMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
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

# Include routers with /api prefix for Vercel
app.include_router(event.router, prefix="/api/event", tags=["event"])
app.include_router(station.router, prefix="/api/station", tags=["station"])
app.include_router(trajectory.router, prefix="/api/trajectory", tags=["trajectory"])
app.include_router(velocity_curve.router, prefix="/api/velocity-curve", tags=["velocity-curve"])

@app.get("/")
async def root():
    return {"message": "Event Horizon API"}

@app.get("/api")
async def api_root():
    return {"message": "Event Horizon API", "version": "1.0.0"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "mongodb_connected": is_connected()
    }

@app.get("/api/health")
async def api_health():
    """API health check endpoint"""
    return {
        "status": "ok",
        "mongodb_connected": is_connected()
    }
# handler = Mangum(app)