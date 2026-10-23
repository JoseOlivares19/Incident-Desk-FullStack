import random
from datetime import datetime, timedelta
from database import SessionLocal
import models

AREAS = ["TI", "Operaciones", "Ventas", "Finanzas", "Recursos Humanos"]
PRIORIDADES = ["Baja", "Media", "Alta", "Critica"]
ESTADOS = ["Abierto", "En Proceso", "Resuelto"]

INCIDENT_TEMPLATES = [
    # TI
    ("Fallo de conexión a la VPN corporativa", "Los colaboradores en trabajo remoto no logran autenticarse con el servidor OpenVPN.", "TI", "Alta"),
    ("Impresora de red sin respuesta en Piso 3", "La impresora compartida HP LaserJet muestra estado offline tras actualización de firmware.", "TI", "Baja"),
    ("Bloqueo de cuenta en Directorio Activo", "Usuario superó intentos máximos de contraseña al iniciar sesión en estación de trabajo.", "TI", "Baja"),
    ("Lentitud extrema en navegación y salida a internet", "Latencia superior a 400ms hacia DNS externos en el segmento de red operativa.", "TI", "Media"),
    ("Caída del enlace secundario de fibra óptica", "El router de borde reporta interfaz WAN2 caída; tráfico balanceado al enlace principal.", "TI", "Critica"),
    ("Alerta de espacio crítico en servidor de base de datos", "El volumen /var/lib/mysql superó el 92% de capacidad en el nodo de producción.", "TI", "Critica"),
    ("Solicitud de acceso a repositorio Git de proyectos", "Nuevo desarrollador requiere permisos de lectura y escritura en el grupo frontend.", "TI", "Baja"),
    ("Pantalla azul constante (BSOD) en estación de diseño", "Error DRIVER_IRQL_NOT_LESS_OR_EQUAL recurrente tras arrancar software CAD.", "TI", "Media"),
    ("Campaña de phishing detectada en bandejas de entrada", "Múltiples usuarios recibieron correo fraudulento solicitando restablecer credenciales bancarias.", "TI", "Critica"),
    ("Renovación de certificados SSL para subdominios", "El certificado comodín *.empresa.com vence en 48 horas.", "TI", "Alta"),
    ("Fallo en sincronización de carpetas en Nextcloud", "Archivos compartidos no replican en los clientes de escritorio de contabilidad.", "TI", "Media"),
    ("Monitores duplicados sin señal tras docking station", "Usuario reporta pantalla negra en ambos monitores HDMI conectados al dock USB-C.", "TI", "Baja"),

    # Operaciones
    ("Descalibración en balanza de pesaje de almacén central", "Las lecturas registran una variación de 1.5kg respecto al peso estándar de calibración.", "Operaciones", "Alta"),
    ("Fallo en lectura de códigos de barras (PDA #04)", "El escáner láser de la terminal no detecta códigos QR en pallets de entrada.", "Operaciones", "Media"),
    ("Retraso en generación de rutas de despacho matutino", "El módulo de optimización de rutas arrojó timeout al procesar los pedidos del día.", "Operaciones", "Alta"),
    ("Fuga de aceite en montacargas eléctrico #2", "Se detectó derrame en pasillo B de bodega; equipo fuera de servicio preventivo.", "Operaciones", "Critica"),
    ("Discrepancia de stock físico vs sistema en anaquel 14", "Faltante de 40 unidades en SKU-8823 detectado durante conteo cíclico.", "Operaciones", "Media"),
    ("Cámara de refrigeración registró aumento de temperatura", "Sensor marcó 8°C cuando el rango permitido es de 2°C a 4°C.", "Operaciones", "Critica"),
    ("Falla en cinta transportadora de empaque", "Motor principal emite zumbido intermitente y reduce velocidad de arrastre.", "Operaciones", "Alta"),
    ("Solicitud de reabastecimiento de insumos de embalaje", "Stock de cinta adhesiva y film alveolar por debajo del umbral mínimo de seguridad.", "Operaciones", "Baja"),
    ("Error de sincronización con operador logístico externo", "La API de tracking de FedEx reporta fallos al consultar números de guía generados.", "Operaciones", "Media"),

    # Finanzas
    ("Error al timbrar factura electrónica CFDI", "El PAC devuelve error '301: Certificado revocado o inválido' en lote de facturación.", "Finanzas", "Critica"),
    ("Descuadre en conciliación bancaria mensual", "Diferencia de saldo no asignada de $1,450.00 en cuenta corriente Banco Santander.", "Finanzas", "Alta"),
    ("Retraso en dispersión de nómina quincenal", "El archivo plano para el portal bancario generó error de validación en columna RFC.", "Finanzas", "Critica"),
    ("Rechazo masivo de pagos con tarjeta de crédito", "Pasarela Stripe arrojó código de error 504 Gateway Timeout durante la última hora.", "Finanzas", "Critica"),
    ("Reporte contable de depreciación no cuadra con activos", "Módulo de activos fijos no calculó depreciación del mes en vehículos de reparto.", "Finanzas", "Media"),
    ("Solicitud de aumento de línea de crédito para cliente VIP", "Área comercial solicita evaluación urgente de historial crediticio de Grupo Delta.", "Finanzas", "Media"),
    ("Fallo en exportación de balance general a Excel", "Al generar archivo XLSX el sistema genera error por memoria insuficiente.", "Finanzas", "Baja"),
    ("Aclaración de doble cargo a proveedor de servicios", "Factura de proveedor de telefonía fue liquidada en dos órdenes de transferencia distintas.", "Finanzas", "Alta"),

    # Ventas
    ("No carga el catálogo digital de productos en portal B2B", "Los distribuidores no pueden visualizar lista de precios mayoristas.", "Ventas", "Critica"),
    ("Formulario de cotizaciones web no envía correos", "Prospectos completan formulario de contacto pero no llega notificación a los ejecutivos.", "Ventas", "Alta"),
    ("Error en cálculo de comisiones del trimestre", "El reporte de ventas excluyó descuentos aprobados para la zona norte.", "Ventas", "Media"),
    ("Integración CRM Salesforce desactualizada", "Nuevos leads captados por pauta en Meta no están ingresando automáticamente al pipeline.", "Ventas", "Alta"),
    ("Falla al aplicar cupón de descuento en ecommerce", "El código PROMOCIONAL2026 arroja 'Cupón inválido' a pesar de estar vigente.", "Ventas", "Media"),
    ("Cliente reporta pedido incompleto en orden #10924", "Falta envío de 3 ítems confirmados en la orden de compra original.", "Ventas", "Alta"),
    ("Solicitud de actualización de ficha técnica de producto", "Catálogo web muestra especificaciones obsoletas del modelo Pro v2.", "Ventas", "Baja"),

    # Recursos Humanos
    ("Reloj biométrico de acceso principal desincronizado", "Los registros de marcación matutina de 45 empleados no figuran en el portal.", "Recursos Humanos", "Alta"),
    ("Error en portal de autoservicio para solicitud de vacaciones", "Botón 'Confirmar fechas' permanece inhabilitado tras adjuntar comprobante.", "Recursos Humanos", "Media"),
    ("Alta urgente de usuario para nuevo ingreso", "Ingeniero de planta inicia funciones mañana y no cuenta con credenciales activas.", "Recursos Humanos", "Alta"),
    ("Actualización de datos bancarios para pago de viáticos", "Colaborador cambió de institución bancaria; solicita actualizar cuenta CLABE.", "Recursos Humanos", "Baja"),
    ("Constancia laboral con firma digital requerida", "Excolaborador solicita constancia con sello digital para trámite de visado.", "Recursos Humanos", "Baja"),
    ("Encuesta de clima laboral no guarda respuestas", "Colaboradores reportan error 500 al enviar cuestionario anónimo.", "Recursos Humanos", "Media"),
]

def generate_100_tickets():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        tickets_to_add = []

        for i in range(1, 101):
            base_template = random.choice(INCIDENT_TEMPLATES)
            titulo = f"{base_template[0]} [Ref-{i:03d}]"
            descripcion = f"{base_template[1]} (Generado automáticamente para simulación de carga y monitoreo)."
            area = base_template[2]
            
            # Ligera variación aleatoria en prioridad o estado para diversidad estadística
            prioridad = random.choices(
                PRIORIDADES,
                weights=[25, 40, 25, 10], # Mayoría Media y Baja
                k=1
            )[0]

            estado = random.choices(
                ESTADOS,
                weights=[45, 30, 25], # Abierto, En Proceso, Resuelto
                k=1
            )[0]

            # Fecha aleatoria en los últimos 15 días
            dias_atras = random.uniform(0, 15)
            fecha = now - timedelta(days=dias_atras)

            ticket = models.Ticket(
                titulo=titulo[:100],
                descripcion=descripcion,
                area=area,
                prioridad=prioridad,
                estado=estado,
                fecha_creacion=fecha
            )
            tickets_to_add.append(ticket)

        db.add_all(tickets_to_add)
        db.commit()
        print(f"Éxito: Se inyectaron correctamente {len(tickets_to_add)} tickets en MySQL.")
    except Exception as e:
        db.rollback()
        print(f"Error al inyectar datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    generate_100_tickets()

