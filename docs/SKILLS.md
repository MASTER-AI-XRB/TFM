# Skills.sh – Comandos para el proyecto

## Impacto en el peso de la app

**No.** Incorporar skills de [skills.sh](https://skills.sh) **no aumenta el peso de la aplicación** que se despliega.

- Las skills se instalan en el proyecto (p. ej. dentro de `.cursor/` o similar) y son archivos de configuración para el agente (Cursor, Claude, etc.).
- Esos archivos **no** forman parte del bundle de Next.js ni se despliegan en Vercel.
- El impacto es **solo a nivel local** (y en el repositorio si se hace commit de los archivos añadidos).

---

## Comandos útiles

Ejecútalos desde la raíz del proyecto. Se puede desactivar la telemetría con `DISABLE_TELEMETRY=1` si lo prefieres.

### Instalar una skill

```bash
pnpm dlx skills add <owner>/<skill-name>
```

**Cuando salga la lista de agentes:** el CLI pregunta para qué agente quieres la skill (Cursor, Claude Code, Windsurf, etc.). Hay que **elegir el que usas** (p. ej. Cursor): normalmente se marca con la barra espaciadora y se confirma con Enter. Si solo usas Cursor, selecciona solo Cursor. Una vez confirmado, la skill se instala en la carpeta que toca (p. ej. `.cursor/`) y Cursor la usará automáticamente.

### Listar skills disponibles en el repo oficial

```bash
pnpm dlx skills add vercel-labs/agent-skills --list
```

### Skills recomendadas para este proyecto (Next.js, React, Vercel)

```bash
pnpm dlx skills add vercel-labs/agent-skills

pnpm dlx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
pnpm dlx skills add vercel-labs/agent-skills --skill web-design-guidelines
pnpm dlx skills add vercel-labs/agent-skills --skill vercel-composition-patterns
```

### Buscar y gestionar skills

```bash
pnpm dlx skills find [consulta]
pnpm dlx skills check
pnpm dlx skills update
```

### Opciones habituales

```bash
pnpm dlx skills add vercel-labs/agent-skills -y
DISABLE_TELEMETRY=1 pnpm dlx skills add vercel-labs/agent-skills
```

---

## Dónde se guardan las skills

Depende del agente; en Cursor suele ir a `.cursor/` o `.agents/` dentro del proyecto. Esas carpetas se pueden versionar con Git para compartir las mismas skills con el equipo.
