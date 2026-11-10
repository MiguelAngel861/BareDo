import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, UTC

BASE = "http://localhost:5000/api/v1"

def api_request(method, path, data=None, token=None):
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw}

# 1. Registrar o loguear a damian
status, body = api_request("POST", "/auth/register", {
    "username": "damian",
    "password": "miguelscott"
})

if status not in (200, 201):
    print("Usuario ya existe o registro falló, haciendo login...")
    status, body = api_request("POST", "/auth/login", {
        "username": "damian",
        "password": "miguelscott"
    })

if status not in (200, 201):
    print(f"Error autenticando: {status} {body}")
    raise SystemExit(1)

token = body["access_token"]
print(f"Autenticado como damian. Token obtenido.")

# 2. Crear tags para tener tag_ids válidos
tag_names = ["Urgente", "Personal", "Trabajo", "Hogar", "Estudio", "Salud", "Compras"]
tag_ids = []
for name in tag_names:
    s, b = api_request("POST", "/tags", {"name": name}, token=token)
    if s == 201:
        tag_ids.append(b["tag_id"])
        print(f"Tag creado: {name} (id={b['tag_id']})")
    elif s == 409:
        # Ya existe, listar para obtener id
        pass

# Si algunos ya existían, listar tags para obtener sus IDs
if len(tag_ids) < len(tag_names):
    s, b = api_request("GET", "/tags", token=token)
    if s == 200:
        existing = {t["name"]: t["tag_id"] for t in b.get("tags", [])}
        for name in tag_names:
            if name in existing and existing[name] not in tag_ids:
                tag_ids.append(existing[name])
        print(f"Tags disponibles: {existing}")

print(f"Tag IDs: {tag_ids}")

# 3. Crear 20 tareas con todos los datos llenos
base_due = datetime.now(UTC)
tareas = [
    {
        "title": "Revisar correos pendientes",
        "description": "Revisar y responder todos los correos de la bandeja de entrada antes del mediodía.",
        "priority_id": 2,
        "due_date": (base_due + timedelta(days=1)).isoformat(),
        "tag_ids": [tag_ids[1]] if len(tag_ids) > 1 else None,
        "subtasks": [
            {"title": "Abrir cliente de correo", "completed": False},
            {"title": "Leer mensajes no leídos", "completed": False},
            {"title": "Responder prioritarios", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Preparar reporte semanal",
        "description": "Compilar los datos de la semana y generar el reporte para el equipo.",
        "priority_id": 3,
        "due_date": (base_due + timedelta(days=2)).isoformat(),
        "tag_ids": [tag_ids[2]] if len(tag_ids) > 2 else None,
        "subtasks": [
            {"title": "Recopilar métricas", "completed": False},
            {"title": "Redactar resumen", "completed": False},
            {"title": "Enviar a stakeholders", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Llamar al fontanero",
        "description": "Solicitar visita para revisar la fuga de la cocina.",
        "priority_id": 4,
        "due_date": (base_due + timedelta(days=3)).isoformat(),
        "tag_ids": [tag_ids[3]] if len(tag_ids) > 3 else None,
        "subtasks": [
            {"title": "Buscar contacto", "completed": True},
            {"title": "Hacer la llamada", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Comprar víveres para la semana",
        "description": "Ir al supermercado y comprar los alimentos de la lista semanal.",
        "priority_id": 3,
        "due_date": (base_due + timedelta(days=4)).isoformat(),
        "tag_ids": [tag_ids[6]] if len(tag_ids) > 6 else None,
        "subtasks": [
            {"title": "Hacer lista de compras", "completed": True},
            {"title": "Ir al supermercado", "completed": False},
            {"title": "Guardar productos", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Estudiar para el examen de Python",
        "description": "Repasar los capítulos de funciones, clases y decoradores.",
        "priority_id": 2,
        "due_date": (base_due + timedelta(days=5)).isoformat(),
        "tag_ids": [tag_ids[4]] if len(tag_ids) > 4 else None,
        "subtasks": [
            {"title": "Repasar funciones", "completed": False},
            {"title": "Hacer ejercicios de clases", "completed": False},
            {"title": "Resolver dudas", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Pago de servicios públicos",
        "description": "Pagar luz, agua e internet antes de la fecha límite.",
        "priority_id": 5,
        "due_date": (base_due + timedelta(days=6)).isoformat(),
        "tag_ids": [tag_ids[3]] if len(tag_ids) > 3 else None,
        "subtasks": [
            {"title": "Pagar luz", "completed": False},
            {"title": "Pagar agua", "completed": False},
            {"title": "Pagar internet", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Rutina de ejercicio matutino",
        "description": "30 minutos de cardio y estiramientos antes del desayuno.",
        "priority_id": 3,
        "due_date": (base_due + timedelta(days=7)).isoformat(),
        "tag_ids": [tag_ids[5]] if len(tag_ids) > 5 else None,
        "subtasks": [
            {"title": "Calentar", "completed": False},
            {"title": "Cardio", "completed": False},
            {"title": "Estirar", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Actualizar el portafolio web",
        "description": "Agregar los proyectos más recientes y actualizar el CV.",
        "priority_id": 2,
        "due_date": (base_due + timedelta(days=8)).isoformat(),
        "tag_ids": [tag_ids[2]] if len(tag_ids) > 2 else None,
        "subtasks": [
            {"title": "Seleccionar proyectos", "completed": False},
            {"title": "Editar código", "completed": False},
            {"title": "Desplegar cambios", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Lavar el coche",
        "description": "Lavado completo exterior e interior del vehículo familiar.",
        "priority_id": 4,
        "due_date": (base_due + timedelta(days=9)).isoformat(),
        "tag_ids": [tag_ids[3]] if len(tag_ids) > 3 else None,
        "subtasks": [
            {"title": "Lavar exterior", "completed": False},
            {"title": "Aspirar interior", "completed": False},
            {"title": "Limpiar cristales", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Leer capítulo del libro",
        "description": "Leer el capítulo 5 del libro de no ficción asignado.",
        "priority_id": 2,
        "due_date": (base_due + timedelta(days=10)).isoformat(),
        "tag_ids": [tag_ids[4]] if len(tag_ids) > 4 else None,
        "subtasks": [
            {"title": "Leer páginas 80-100", "completed": False},
            {"title": "Tomar notas", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Respaldo de archivos importantes",
        "description": "Copiar documentos y fotos al disco duro externo y a la nube.",
        "priority_id": 4,
        "due_date": (base_due + timedelta(days=11)).isoformat(),
        "tag_ids": [tag_ids[1]] if len(tag_ids) > 1 else None,
        "subtasks": [
            {"title": "Copiar documentos", "completed": False},
            {"title": "Copiar fotos", "completed": False},
            {"title": "Subir a la nube", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Cita con el dentista",
        "description": "Revisión dental semestral y limpieza.",
        "priority_id": 5,
        "due_date": (base_due + timedelta(days=12)).isoformat(),
        "tag_ids": [tag_ids[5]] if len(tag_ids) > 5 else None,
        "subtasks": [
            {"title": "Confirmar cita", "completed": True},
            {"title": "Ir a la consulta", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Organizar el escritorio",
        "description": "Despejar y ordenar el espacio de trabajo para mejorar la productividad.",
        "priority_id": 3,
        "due_date": (base_due + timedelta(days=13)).isoformat(),
        "tag_ids": [tag_ids[3]] if len(tag_ids) > 3 else None,
        "subtasks": [
            {"title": "Tirar basura", "completed": False},
            {"title": "Organizar cables", "completed": False},
            {"title": "Limpiar superficie", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Planificar vacaciones de verano",
        "description": "Buscar destinos, comparar precios y reservar alojamiento.",
        "priority_id": 2,
        "due_date": (base_due + timedelta(days=14)).isoformat(),
        "tag_ids": [tag_ids[1]] if len(tag_ids) > 1 else None,
        "subtasks": [
            {"title": "Elegir destino", "completed": False},
            {"title": "Buscar vuelos", "completed": False},
            {"title": "Reservar hotel", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Revisar suscripciones mensuales",
        "description": "Verificar qué servicios de suscripción están activos y cancelar los innecesarios.",
        "priority_id": 4,
        "due_date": (base_due + timedelta(days=15)).isoformat(),
        "tag_ids": [tag_ids[6]] if len(tag_ids) > 6 else None,
        "subtasks": [
            {"title": "Listar suscripciones", "completed": False},
            {"title": "Cancelar innecesarias", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Preparar cena para los amigos",
        "description": "Cocinar una cena sencilla y recibir a los amigos en casa el sábado.",
        "priority_id": 3,
        "due_date": (base_due + timedelta(days=16)).isoformat(),
        "tag_ids": [tag_ids[1]] if len(tag_ids) > 1 else None,
        "subtasks": [
            {"title": "Hacer lista de ingredientes", "completed": False},
            {"title": "Comprar ingredientes", "completed": False},
            {"title": "Cocinar", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Actualizar contraseñas",
        "description": "Cambiar las contraseñas de las cuentas principales por una más seguras.",
        "priority_id": 5,
        "due_date": (base_due + timedelta(days=17)).isoformat(),
        "tag_ids": [tag_ids[5]] if len(tag_ids) > 5 else None,
        "subtasks": [
            {"title": "Cambiar email principal", "completed": False},
            {"title": "Cambiar banca online", "completed": False},
            {"title": "Cambiar redes sociales", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Pasear al perro",
        "description": "Paseo de 30 minutos por el parque cercano por la tarde.",
        "priority_id": 3,
        "due_date": (base_due + timedelta(days=18)).isoformat(),
        "tag_ids": [tag_ids[5]] if len(tag_ids) > 5 else None,
        "subtasks": [
            {"title": "Poner correa", "completed": False},
            {"title": "Pasear 30 min", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Revisar el coche (nivel de aceite)",
        "description": "Comprobar nivel de aceite, líquido de frenos y presión de neumáticos.",
        "priority_id": 4,
        "due_date": (base_due + timedelta(days=19)).isoformat(),
        "tag_ids": [tag_ids[3]] if len(tag_ids) > 3 else None,
        "subtasks": [
            {"title": "Revisar aceite", "completed": False},
            {"title": "Revisar frenos", "completed": False},
            {"title": "Revisar neumáticos", "completed": False},
        ],
        "completed": False,
    },
    {
        "title": "Ver documental de historia",
        "description": "Ver el documental sobre civilizaciones antiguas recomendado.",
        "priority_id": 2,
        "due_date": (base_due + timedelta(days=20)).isoformat(),
        "tag_ids": [tag_ids[4]] if len(tag_ids) > 4 else None,
        "subtasks": [
            {"title": "Buscar documental", "completed": False},
            {"title": "Verlo completo", "completed": False},
        ],
        "completed": False,
    },
]

creadas = 0
for i, tarea in enumerate(tareas, 1):
    s, b = api_request("POST", "/tasks", tarea, token=token)
    if s in (200, 201):
        creadas += 1
        print(f"[{i}/20] Tarea creada: {tarea['title']} (id={b.get('task_id')})")
    else:
        print(f"[{i}/20] Error creando '{tarea['title']}': {s} {b}")

print(f"\nTotal creadas: {creadas}/20")
