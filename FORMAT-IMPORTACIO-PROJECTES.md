# Formato de importación de proyectos — Gestor

Este documento describe cómo otra aplicación (o un agente de IA) debe generar el contenido para importar **un** proyecto al Gestor de proyectos (vía la UI «Importar» o la API `POST /api/import`).

---

## 0. Instrucciones obligatorias para quien genera el export

**Debéis generar un solo archivo.** No generéis varios archivos (ni varios formatos, ni ejemplos alternativos en archivos separados). Un proyecto = un archivo.

- **Formato óptimo (recomendado):** un **único archivo JSON** con extensión `.json` que contenga **un solo objeto** proyecto con todos los campos que tengamos (véase sección 3). Este formato permite que el Gestor cree la ficha con nombre, descripción, estado, fechas, enlaces y etiquetas.
- **Nombre del archivo:** podéis usar por ejemplo `proyecto-gestor.json` o un nombre descriptivo del proyecto.
- **Contenido:** el archivo debe ser JSON válido: un objeto con las propiedades `name`, `description` y, si hay, `status`, `startDate`, `endDate`, `links`, `tags` (sin `id`, `createdAt` ni `updatedAt`).

Si por restricciones de contexto solo se puede generar texto plano o Markdown, generad **un solo** archivo `.md` o `.txt`: primera línea = nombre del proyecto, el resto = descripción (véase sección 4). En ese caso el Gestor no podrá importar enlaces ni etiquetas; para la mejor ficha posible, usad JSON.

---

## 1. Opciones de importación (referencia)

El Gestor acepta tres tipos de entrada:

| Tipo     | Campo `type` | Descripción |
|----------|--------------|-------------|
| JSON     | `json`       | Estructura con campos del proyecto (nombre, descripción, enlaces, etc.). |
| Markdown | `markdown`   | Texto con título (opcionalmente `# Título`) y cuerpo como descripción. |
| Texto    | `text`       | Mismo tratamiento que Markdown: primera línea = nombre, el resto = descripción. |

---

## 2. Importación vía API

El endpoint es:

```http
POST /api/import
Content-Type: application/json
```

Cuerpo de la petición:

```json
{
  "type": "json",
  "content": "<contenido según el tipo>"
}
```

- **`type`**: `"json"` | `"markdown"` | `"text"`.
- **`content`**:
  - Si `type` es `"json"`: string con JSON válido **o** objeto JSON (según lo que acepte tu cliente).
  - Si `type` es `"markdown"` o `"text"`: string con el texto/Markdown.

En todos los casos, el Gestor genera él mismo `id`, `createdAt` y `updatedAt` del proyecto; no hace falta enviarlos.

---

## 3. Formato JSON

### 3.1 Objeto proyecto (contenido del archivo JSON)

El archivo que generéis debe contener **un único objeto** con los campos que conozcáis. Los que no se envíen se toman por defecto en el Gestor.

```json
{
  "name": "Nombre del proyecto",
  "description": "Descripción u objetivos del proyecto. Texto largo.",
  "status": "actiu",
  "startDate": "2025-01-15",
  "endDate": "2025-06-30",
  "links": [
    { "title": "Repositorio", "url": "https://github.com/usuario/repo" },
    { "title": "Página web", "url": "https://wiki.example.com" }
  ],
  "tags": ["frontend", "prioridad-alta"]
}
```

**Campos aceptados:**

| Campo         | Tipo    | Obligatorio | Descripción |
|---------------|---------|-------------|-------------|
| `name`        | string  | No          | Nombre del proyecto. Por defecto: «Importado». |
| `description` | string  | No          | Descripción o notas. |
| `status`      | string  | No          | `"actiu"`, `"pausat"` o `"acabat"`. Por defecto: `"actiu"`. |
| `startDate`   | string  | No          | Fecha de inicio en formato ISO (ej.: `YYYY-MM-DD`). |
| `endDate`     | string  | No          | Fecha prevista de fin en formato ISO. |
| `links`       | array   | No          | Lista de objetos `{ "title": string, "url": string }`. |
| `tags`        | array   | No          | Lista de strings (etiquetas). |

**No se usan** en la importación (el Gestor los genera): `id`, `createdAt`, `updatedAt`.

### 3.2 Un solo objeto (lo que debéis generar)

Para la importación al Gestor, **generad un único objeto** proyecto dentro de un único archivo JSON. No generéis arrays con varios proyectos ni varios archivos: un proyecto a importar = un archivo con un objeto.

El Gestor acepta también (por compatibilidad) un array o `{ "projects": [ ... ] }`, pero en todos los casos **solo se importa el primer elemento**. Por tanto, el formato directo y óptimo es un solo objeto en un solo archivo.

### 3.3 Ejemplo mínimo (nombre y descripción)

```json
{
  "name": "Mi proyecto",
  "description": "Objetivos y notas del proyecto."
}
```

### 3.4 Ejemplo con enlaces y etiquetas

```json
{
  "name": "App móvil",
  "description": "Desarrollo de una app de gestión de tareas.",
  "status": "actiu",
  "endDate": "2025-09-01",
  "links": [
    { "title": "Figma", "url": "https://figma.com/file/xxx" },
    { "title": "Backlog", "url": "https://trello.com/b/yyy" }
  ],
  "tags": ["react-native", "MVP"]
}
```

---

## 4. Formato Markdown / texto

Cuando `type` es **`markdown`** o **`text`**, el Gestor interpreta el `content` así:

1. **Nombre del proyecto**: la **primera línea** del texto.
   - Si empieza con uno o más `#` (por ejemplo `# Título` o `## Título`), se toma el texto después de los `#` (sin espacios iniciales).
   - Si no hay `#`, se toma toda la primera línea.
2. **Descripción**: todo lo que viene **después** de la primera línea (incluidos saltos de línea). Si no hay, se puede usar todo el texto como descripción.

No se reconocen enlaces ni etiquetas dentro del Markdown; solo se deriva nombre + descripción. Para enlaces y etiquetas hay que usar **JSON**.

### 4.1 Ejemplo Markdown (título con #)

```markdown
# Nombre del proyecto

Esta es la descripción o el objetivo del proyecto.
Puedo escribir varias líneas.

- Punto 1
- Punto 2
```

Resultado en Gestor: **Nombre** = «Nombre del proyecto», **Descripción** = el párrafo y la lista.

### 4.2 Ejemplo texto (sin #)

```
Mi proyecto
Descripción breve en una o más líneas.
```

Resultado: **Nombre** = «Mi proyecto», **Descripción** = «Descripción breve en una o más líneas.»

### 4.3 Ejemplo solo descripción

Si la primera línea se deja vacía o no se quiere título, se puede enviar solo texto; el nombre del proyecto quedará por defecto («Importado») y todo el texto será la descripción.

```markdown

Esta es solo la descripción sin título.
```

---

## 5. Resumen para quien genera el export

- **Generad un solo archivo.** No varios archivos ni varios formatos.
- **Formato óptimo:** un archivo `.json` con un **único objeto** que tenga como mínimo `name` y `description`, y si hay: `status`, `startDate`, `endDate`, `links` (array de objetos `{ "title", "url" }`), `tags` (array de strings). Fechas en ISO (`YYYY-MM-DD`). Sin `id`, `createdAt` ni `updatedAt`.
- **Alternativa (si no se puede JSON):** un solo archivo `.md` o `.txt`: primera línea = nombre, el resto = descripción (enlaces y etiquetas no se importan).

Con un solo archivo en este formato, el Gestor puede crear la ficha del proyecto de forma óptima.
