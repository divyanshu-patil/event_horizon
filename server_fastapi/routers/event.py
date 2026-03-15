from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime
from models.schemas import EventResponse
from controllers.events import handle_search_event

router = APIRouter()

@router.get("/", response_model=List[EventResponse])
async def search_event(
    searchQuery: Optional[str] = Query(None),
    dateFrom: Optional[str] = Query(None),
    dateTo: Optional[str] = Query(None),
    shower: Optional[str] = Query(None),
    region: Optional[str] = Query(None),

    
):
    """
    Search for events by shower code or region, optionally filtered by date range
    """
    return await handle_search_event(
        searchQuery=searchQuery,
        start_date=dateFrom,
        end_date=dateTo,
        shower=shower ,
        region=region
    )
