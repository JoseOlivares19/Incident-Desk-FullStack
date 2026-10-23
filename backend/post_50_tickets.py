import json
import random
import time
import urllib.request

API_URL = "http://127.0.0.1:8000/tickets"

AREAS = ["TI", "Operaciones", "Ventas", "Finanzas", "Recursos Humanos"]
PRIORIDADES = ["Baja", "Media", "Alta", "Critica"]
ESTADOS_POSIBLES = ["En Proceso", "Resuelto"]

TITULOS_DESCRIPCIONES = [
    # TI
    ("Fallo en sincronización de Active Directory", "Controlador de dominio secundario no replica cambios de unidades organizativas."),
    ("Reemplazo de batería en UPS de rack principal", "Alarma sonora en SAI Eaton de sala de servidores por bajo voltaje en celdas."),
    ("Acceso denegado a servidor SSH de staging", "Llave pública del desarrollador no está autorizada en ~/.ssh/authorized_keys."),
    ("Lentitud en consultas a réplica de base de datos", "Consulta pesada de analítica bloqueando hilos de lectura en servidor MySQL esclavo."),
    ("Actualización urgente de parche de seguridad Linux", "Vulnerabilidad de ejecución remota detectada en versión instalada de OpenSSL."),
    ("Configuración de nuevo túnel IPsec entre sedes", "Interconexión requerida entre oficinas de CDMX y Monterrey."),
    ("Falla en switch PoE de cámaras de vigilancia", "Ocho cámaras de seguridad del pasillo central perdieron alimentación PoE."),
    ("Bloqueo de puerto 443 por regla de firewall", "Regla de inspección profunda bloqueó llamadas hacia API de mensajería."),
    ("Mouse y teclado inalámbricos sin respuesta", "Colaborador de gerencia solicita periféricos de reemplazo inmediato."),
    ("Licencia de antivirus corporativo expirada", "Tres estaciones de trabajo de compras muestran alerta de suscripción vencida."),

    # Operaciones
    ("Sensor de humedad averiado en almacén de materias primas", "Valores oscilan fuera de la norma técnica ISO 9001."),
    ("Carga de batería lenta en transpaleta eléctrica #5", "Tiempo de recarga supera las 12 horas habituales."),
    ("Descuadre en pesaje de camión de carga pesada", "Báscula de patio exterior registra error de tara en 250 kg."),
    ("Etiquetadora térmica de códigos de barras trabada", "Cabezal de impresión con residuos de adhesivo en línea de empaque 2."),
    ("Fuga menor de agua en cuarto de bombas", "Se requiere inspección de válvula check en sistema de enfriamiento."),
    ("Retraso en confirmación de recepción de contenedor", "Documentación aduanera no coincide con lista de empaque física."),
    ("Falla de apertura en portón automatizado norte", "Motor eléctrico no responde a señales del control remoto ni botonera."),
    ("Falta de pallets certificados para exportación", "Inventario por debajo del stock de seguridad para despacho del fin de semana."),
    ("Revisión preventiva de montacargas de pasillo angosto", "Alcanzó las 500 horas de operación continua según horómetro."),
    ("Actualización de software en terminales PDA Honeywell", "Se requiere instalar versión 3.4 del cliente de recolección de pedidos."),

    # Finanzas
    ("Diferencia en cálculo de retenciones de impuestos", "Nómina quincenal calculó excedente de ISR en grupo de consultores."),
    ("Error de conexión con servicio web del SAT", "Web service no devuelve código de acuse para comprobantes de pago emitidos."),
    ("Fallo en generación de archivo TXT de dispersión bancaria", "Caracteres especiales en nombres de beneficiarios rompieron el formato plano."),
    ("Factura duplicada de proveedor de hosting AWS", "Se generaron dos órdenes de pago para el mismo folio de cobro mensual."),
    ("Solicitud de auditoría de gastos de representación", "Revisión requerida en reembolsos de viáticos del equipo directivo."),
    ("Rechazo de transferencias SPEI interbancarias", "Banco emisor reporta intermitencia en el sistema de pagos electrónicos."),
    ("Actualización de tipo de cambio en sistema ERP", "Tasa cambiaria oficial no se actualizó al inicio de jornada financiera."),
    ("Aprobación pendiente de anticipo a contratista de obra", "Contrato firmado requiere liberación del 30% del presupuesto asignado."),
    ("Error en emisión de nota de crédito para cliente corporativo", "Sistema no permite aplicar descuento sobre factura cerrada."),
    ("Reconciliación de saldos de tarjetas corporativas", "Tres transacciones en moneda extranjera pendientes de categorización contable."),

    # Ventas
    ("Desconexión de API de WhatsApp Business con CRM", "Mensajes entrantes de clientes no están generando tickets automáticos de venta."),
    ("Error en cotizador de promociones de temporada", "Descuento por volumen del 15% no se refleja en el resumen de cotización."),
    ("Caída de checkout en tienda virtual WooCommerce", "Pasarela de cobro no procesa transacciones con tarjetas de débito."),
    ("Prospectos sin asignar en embudo comercial", "Regla de asignación por territorio geográfico quedó desactivada."),
    ("Lentitud al cargar histórico de compras del cliente", "Módulo de cliente en CRM tarda más de 10 segundos en desplegar pedidos."),
    ("Comisión de ventas no calculada en venta especial", "Venta de contado de maquinaria industrial no acreditó porcentaje al asesor."),
    ("Solicitud de alta de nuevo distribuidor mayorista", "Expediente comercial completo pendiente de validación legal y de crédito."),
    ("Stock en web desincronizado con inventario real", "Se vendieron 5 unidades de producto agotado físicamente en bodega."),
    ("Error en plantilla de correo de bienvenida a clientes", "El enlace de confirmación de cuenta dirige a una página 404."),
    ("Fallo en sincronización de leads de LinkedIn Ads", "Formularios de generación de contactos no alimentan la base de datos de marketing."),

    # Recursos Humanos
    ("Incidencia en cálculo de horas extras nocturnas", "Turno de guardia del fin de semana no refleja el recargo nocturno correspondiente."),
    ("Solicitud de constancia de empleo para crédito hipotecario", "Colaborador de área técnica requiere documento timbrado urgente."),
    ("Lector biométrico de puerta lateral desconectado", "No registra entradas del personal de turno vespertino."),
    ("Error al cargar póliza de gastos médicos mayores", "Portal de la aseguradora no reconoce certificado patronal vigente."),
    ("Registro de nuevo colaborador en plataforma de inducción", "Ingreso de diseñador gráfico programado para el lunes."),
    ("Fallo al exportar reporte de puntualidad mensual", "El generador de PDF produce un archivo corrupto al superar 100 empleados."),
    ("Reclamo por días de vacaciones no computados", "Antigüedad no sumó los días adicionales correspondientes al quinto año."),
    ("Actualización de beneficiarios en seguro de vida colectivo", "Formulario físico firmado listo para ser registrado en el expediente digital."),
    ("Intermitencia en plataforma de cursos de capacitación", "Vídeos del módulo de seguridad e higiene se detienen al 50% de reproducción."),
    ("Solicitud de baja definitiva y cálculo de finiquito", "Proceso de salida voluntaria de asesor comercial con entrega de activos.")
]

def run_post_injection():
    print(f"Iniciando el envío de 50 registros vía POST hacia: {API_URL}")
    created_count = 0
    created_ids = []

    for i in range(50):
        item = TITULOS_DESCRIPCIONES[i % len(TITULOS_DESCRIPCIONES)]
        area = random.choice(AREAS)
        prioridad = random.choice(PRIORIDADES)
        
        payload = {
            "titulo": f"{item[0]} [Test-{i+1:02d}]",
            "descripcion": item[1],
            "area": area,
            "prioridad": prioridad
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            API_URL,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                if resp.status == 201:
                    created_data = json.loads(resp.read().decode("utf-8"))
                    created_count += 1
                    created_ids.append(created_data["id"])
                    print(f"[{i+1}/50] POST /tickets -> Creado ID #{created_data['id']} | {area} | {prioridad}")
        except Exception as e:
            print(f"Error en POST {i+1}: {e}")

        time.sleep(0.04)

    print(f"\n¡Se crearon exitosamente {created_count} tickets mediante POST!")

    # Actualizamos el estado de algunos de ellos con PUT para que las tarjetas de Power BI muestren cambios en todas las categorías
    print("\nActualizando estados de una muestra de los nuevos tickets vía PUT /tickets/{id}/estado...")
    put_count = 0
    for t_id in created_ids[:25]: # Tomamos la mitad para variar sus estados
        nuevo_estado = random.choice(ESTADOS_POSIBLES)
        put_payload = {"estado": nuevo_estado}
        put_bytes = json.dumps(put_payload).encode("utf-8")
        put_req = urllib.request.Request(
            f"{API_URL}/{t_id}/estado",
            data=put_bytes,
            headers={"Content-Type": "application/json"},
            method="PUT"
        )
        try:
            with urllib.request.urlopen(put_req) as put_resp:
                if put_resp.status == 200:
                    put_count += 1
        except Exception as e:
            print(f"Error en PUT para #{t_id}: {e}")

    print(f"Se actualizaron {put_count} tickets a estados 'En Proceso' o 'Resuelto'.")
    print("\n>>> Listo. Puedes ir a Power BI y presionar 'Actualizar'. <<<")

if __name__ == "__main__":
    run_post_injection()

