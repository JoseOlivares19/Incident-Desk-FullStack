from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    area = Column(String(50), nullable=False)
    prioridad = Column(String(20), nullable=False)
    estado = Column(String(20), nullable=False, default="Abierto")
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)

