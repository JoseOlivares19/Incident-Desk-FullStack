import os
from typing import List
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crea las tablas en MySQL automáticamente al iniciar si aún no existen
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Sistema de Gestión de Tickets de Soporte e Incidentes",
    description="API RESTful para administración de tickets de incidencias",
    version="1.0.0",
    lifespan=lifespan
)

# Configuración de CORS para desarrollo local
cors_origins_env = os.getenv("CORS_ORIGIN", "http://localhost:5173")
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
if "http://127.0.0.1:5173" not in origins:
    origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API de Gestión de Tickets activa"}

@app.post(
    "/tickets",
    response_model=schemas.TicketResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Tickets"]
)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    """Crear un nuevo ticket de soporte o incidente."""
    nuevo_ticket = models.Ticket(
        titulo=ticket.titulo,
        descripcion=ticket.descripcion,
        area=ticket.area,
        prioridad=ticket.prioridad.value,
        estado=schemas.EstadoEnum.ABIERTO.value
    )
    db.add(nuevo_ticket)
    db.commit()
    db.refresh(nuevo_ticket)
    return nuevo_ticket

@app.get(
    "/tickets",
    response_model=List[schemas.TicketResponse],
    tags=["Tickets"]
)
def get_tickets(db: Session = Depends(get_db)):
    """Listar todos los tickets registrados en orden cronológico inverso."""
    tickets = db.query(models.Ticket).order_by(models.Ticket.id.desc()).all()
    return tickets

@app.put(
    "/tickets/{ticket_id}/estado",
    response_model=schemas.TicketResponse,
    tags=["Tickets"]
)
def update_ticket_status(
    ticket_id: int,
    status_update: schemas.TicketStatusUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar únicamente el estado de un ticket por su ID."""
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket con id {ticket_id} no fue encontrado"
        )
    
    ticket.estado = status_update.estado.value
    db.commit()
    db.refresh(ticket)
    return ticket

