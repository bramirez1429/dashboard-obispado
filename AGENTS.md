<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
Corregir las instrucciones de AGENTS.md.

Objetivo:
Permitir que Codex trabaje normalmente con los archivos del proyecto, pero sin ejecutar builds ni tests.

Reemplazar cualquier instrucción que prohíba todos los comandos de terminal por estas reglas:

**Comandos permitidos:**
- Explorar carpetas y archivos del proyecto.
- Buscar archivos con `rg`, `find` o `ls`.
- Leer código con `cat`, `sed` u otras herramientas de lectura.
- Consultar `git status` y `git diff`.
- Leer documentación de Next.js en `node_modules/next/dist/docs/`.
- Crear o modificar los archivos necesarios dentro del alcance autorizado.

**Comandos prohibidos:**
- `npm run build`
- `next build`
- `npm test`
- `npm run test`
- `npm run lint`
- `npx tsc`
- Ejecutar tests unitarios, de integración o E2E.
- Iniciar servidores sin autorización.

Se permite crear o modificar archivos de tests cuando el usuario lo solicite, pero NO ejecutarlos.

**Alcance:**
- Modificar únicamente los archivos necesarios para la tarea solicitada.
- No modificar otras carpetas o funcionalidades sin autorización.
- Si necesitás ampliar el alcance, consultarme primero.
- No hacer refactorizaciones innecesarias.
- No crear commits automáticamente.

Mantener intactas las demás reglas de AGENTS.md, incluyendo las instrucciones especiales de Next.js 16.



# Instrucciones para Codex — Dashboard Obispado

<!-- BEGIN:nextjs-agent-rules -->
**# This is NOT the Next.js you know**

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 1. Alcance: solo lo solicitado

- Modificar **únicamente lo que el usuario pida** y los archivos estrictamente necesarios para hacerlo.
- Antes de editar, localizar y leer la implementación existente. Reutilizarla en vez de duplicarla.
- No refactorizar, renombrar, reorganizar carpetas, cambiar estilos globales ni corregir problemas no relacionados por iniciativa propia.
- No modificar otros módulos, rutas, componentes, configuraciones, dependencias o carpetas ajenos a la tarea.
- Si una modificación fuera del alcance es necesaria, **explicarla y pedir autorización antes de realizarla**.
- Mantener el comportamiento existente que no forma parte del pedido. Si el cambio es visual, no modificar lógica.
- No crear commits automáticamente, salvo solicitud explícita.

## 2. Terminal: lectura permitida, ejecución de tests/builds prohibida

Se permite usar terminal o herramientas equivalentes para **inspeccionar** el proyecto: `pwd`, `ls`, `find`, `rg`, `cat`, `sed`, `git status`, `git diff` y lectura de documentación local. Se permite editar los archivos autorizados.

**No ejecutar**:

- `npm run build`, `next build` ni otros builds/compilaciones.
- `npm test`, `npm run test`, `npx jest`, `npx vitest` ni tests unitarios, de integración o E2E.
- `npm run lint`, `npx eslint`, `npx tsc` ni otros comandos de validación automatizada.
- `npm run dev` ni iniciar servidores, salvo pedido explícito.

**Sí se pueden crear o modificar tests** cuando el usuario lo solicite; simplemente **no ejecutarlos**. No interpretar estas reglas como una prohibición de explorar los archivos del proyecto.

## 3. Clean Code (código limpio)

- Escribir código legible, claro, coherente con el estilo actual y fácil de mantener.
- Usar nombres descriptivos para funciones, variables, componentes y tipos.
- Preferir funciones pequeñas con responsabilidades claras; evitar lógica repetida.
- Extraer helpers/componentes **solo si simplifican** la tarea: no sobreingenierizar ni crear abstracciones innecesarias.
- Simplificar condiciones y manejar estados de carga, vacíos y errores relevantes.
- Respetar el tipado TypeScript; evitar `any` innecesario, aserciones inseguras y código muerto.
- Mantener comentarios breves donde expliquen el *porqué*, no repetir lo evidente.
- Evitar cambios cosméticos masivos o reformatear archivos enteros sin necesidad.
- Mantener textos en español correctamente codificados (UTF-8, tildes y eñes).

## 4. Principios SOLID (aplicación pragmática)

- **S — Single Responsibility:** separar responsabilidades cuando realmente mejore la claridad; un componente o función debe tener un propósito claro.
- **O — Open/Closed:** preferir extender de forma localizada a reescribir funcionalidades existentes.
- **L — Liskov Substitution:** mantener contratos y comportamientos esperados de tipos/componentes existentes.
- **I — Interface Segregation:** utilizar props y tipos específicos; evitar interfaces grandes con campos que no se usan.
- **D — Dependency Inversion:** aprovechar interfaces, servicios, hooks y dependencias ya existentes; no acoplar innecesariamente la lógica de UI a detalles de infraestructura.

**Prioridad:** aplicar SOLID con criterio, sin introducir capas, patrones, servicios o archivos extras que el alcance no necesita. Un cambio pequeño debe seguir siendo pequeño.

## 5. Next.js, React y Ant Design

- Respetar la arquitectura existente, Next.js App Router y la documentación local de la versión instalada.
- Preferir Server Components y SSR para consultas iniciales cuando corresponda; usar Client Components solo para interactividad.
- No introducir `"use client"` sin necesidad, ni reemplazar consultas del servidor por fetch en cliente sin autorización.
- Evitar solicitudes redundantes, bucles en `useEffect` e inconsistencias de hidratación.
- Utilizar las APIs vigentes de Ant Design en la versión instalada; atender avisos de deprecación.
- Conservar diseño responsive y accesibilidad básica de elementos interactivos.

## 6. Supabase, permisos y datos

- No crear ni modificar tablas, columnas, políticas RLS, RPC, permisos o credenciales sin solicitud explícita.
- No cambiar autenticación, roles, reglas de negocio ni consultas que no pertenezcan a la tarea.
- Reutilizar los mecanismos existentes de acceso a datos; no agregar fetch innecesarios.
- Mantener los nombres y contratos reales de tablas, campos y funciones.
- No exponer secretos, claves privadas ni operaciones privilegiadas en el cliente.

## 7. Entrega

Al finalizar, informar brevemente:

1. Qué archivos fueron modificados.
2. Qué cambio se realizó.
3. Si surgió algo que requiere autorización o seguimiento.

No afirmar que los cambios fueron probados o compilados: **no se ejecutaron tests, builds ni validaciones**, por instrucción del usuario.
