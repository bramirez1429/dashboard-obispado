# Dashboard Obispado

Dashboard para organizar minuta sacramental, discursos y pantallas publicas de mensajes por ID.

## Stack

- Next.js 16
- React
- TypeScript
- Ant Design
- @ant-design/icons
- @ant-design/nextjs-registry
- CSS global
- GitHub
- Vercel futuro

## Estado actual

- El proyecto no usa Tailwind.
- Supabase todavia no esta integrado.
- Actualmente los datos son mock o visuales.
- La base de datos se agregara en una etapa posterior.

## Rutas actuales

- `/`
- `/dashboard`
- `/dashboard/minuta`
- `/dashboard/discursos`
- `/dashboard/discursos/nuevo`
- `/m/[id]`

## Funcionalidades actuales

- Sidebar responsive y colapsable.
- Dashboard inicial.
- Minuta sacramental editable e imprimible.
- Exportar PDF con `window.print()`.
- Pagina de discursos.
- Formulario visual de nuevo discurso.
- Link publico mock por ID.
- Pantalla publica solo lectura `/m/[id]`.

## Instalacion

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Dependencias importantes

- `antd`
- `@ant-design/icons`
- `@ant-design/nextjs-registry`

## Estructura del proyecto

```text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
    dashboard/
      layout.tsx
      page.tsx
      minuta/
        page.tsx
      discursos/
        page.tsx
        nuevo/
          page.tsx
    m/
      [id]/
        page.tsx
  components/
    dashboard/
      DashboardShell.tsx
    discursos/
      MessagePreviewCard.tsx
    minuta/
      SacramentalMinuteSheet.tsx
```

## Convencion de commits

Ejemplos:

- `feat(dashboard): add sidebar pages and discourse form`
- `style(dashboard): improve responsive sidebar`
- `feat(minute): add printable sacramental sheet`

## Proximas etapas

- Integrar Supabase.
- Agregar autenticacion.
- Guardar discursos reales.
- Generar IDs reales.
- Proteger rutas privadas.
- Deploy en Vercel.
