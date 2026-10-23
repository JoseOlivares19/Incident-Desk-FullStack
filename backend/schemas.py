from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict

class PrioridadEnum(str, Enum):
    BAJA = "Baja"
    MEDIA = "Media"
    ALTA = "Alta"
    CRITICA = "Critica"

class EstadoEnum(str, Enum):
    ABIERTO = "Abierto"
    EN_PROCESO = "En Proceso"
    RESUELTO = "Resuelto"

class TicketBase(BaseModel):
    titulo: str = Field(..., max_length=100, description="Título del ticket")
    descripcion: str = Field(..., min_length=1, description="Descripción detallada del incidente")
    area: str = Field(..., max_length=50, description="Área solicitante (ej: Operaciones, Ventas, TI, Finanzas)")
    prioridad: PrioridadEnum = Field(default=PrioridadEnum.MEDIA, description="Nivel de prioridad")

class TicketCreate(TicketBase):
    pass

class TicketStatusUpdate(BaseModel):
    estado: EstadoEnum = Field(..., description="Nuevo estado del ticket")

class TicketResponse(TicketBase):
    id: int
    estado: EstadoEnum
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)

