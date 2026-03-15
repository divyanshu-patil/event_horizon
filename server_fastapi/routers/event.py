from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime
from models.schemas import EventResponse
from controllers.events import handle_search_event

router = APIRouter()

@router.get("/", response_model=List[EventResponse])
async def search_event(
    searchQuery: Optional[str] = Query(None),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None)
):
    """
    Search for events by shower code or region, optionally filtered by date range
    """
    return await handle_search_event(
        search_query=searchQuery,
        start_date=start,
        end_date=end
    )
