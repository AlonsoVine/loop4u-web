# Registro de Contexto — Loop4U (Codex)

Propósito: mantener, en cada respuesta, un resumen claro de lo hecho, por qué, el estado y los próximos pasos. Este archivo permite retomar trabajo o transferirlo a otra IA/persona sin perder contexto.

## Formato de cada entrada
- Fecha (ISO): YYYY-MM-DD HH:mm
- Acciones realizadas
- Decisiones tomadas / pendientes
- Próximos pasos
- Archivos tocados (ruta:línea si aplica)
- Notas / riesgos

---

## 2025-11-12  Reparación de Ajustes + mejoras de formulario

- Acciones realizadas
  - Reescribí `src/app/features/settings/settings.page.ts` de forma segura para reparar bloque roto (fin de clase, métodos perdidos) que impedía compilar.
  - Añadí métodos faltantes usados por la plantilla de Ajustes: `editCategory`, `saveCategory`, `resetCategoryForm`, `clearLocalData`, `clearAllData`, `parseICS`, `splitIcsDate`, y restauré `readTheme`.
  - Implementé selector de color por cuadrícula para categorías (sin input manual) y añadí `colorOptions` (familias 400/500 + grises). Mantengo `bgColorClass` para sanear clases.
  - Emoji por defecto para categorías: si está vacío al guardar, uso 🏷️ (también en creación desde importaciones cuando falta categoría).
  - Normalicé textos sensibles en TS a ASCII (evita mojibake) y usé entidades HTML en la plantilla (`&aacute;`, `&ntilde;`, `&middot;`, etc.).
  - Formulario de recordatorios (`reminder-form.page.ts`): punto de prioridad dentro del `<select>` (overlay absoluto) y corrección del binding `[class]` concatenando `' pr-8'`. Añadí emoji visible en opciones de categoría.

- Motivo
  - La plantilla de Ajustes hacía referencia a métodos y estado que no existían (TS2339) y había código incrustado rompiendo el cierre de métodos/clase (TS1128/NG5002). Esto bloqueaba el bundle y ocultaba otros cambios.

- Resultado
  - Build vuelve a compilar. Ajustes: grid de colores completa; CRUD de categorías funcional; import/export (JSON/CSV/ICS) operativos; secciones visibles incluyendo “Sobre la app”.
  - Formulario: asterisco único en Título/Fecha/Hora; prioridad con punto dentro del selector; emoji visible en selector de categoría.

- Archivos tocados
  - `src/app/features/settings/settings.page.ts` (reescritura segura)
  - `src/app/features/reminders/reminder-form.page.ts` (overlay del punto en select y fix `[class]`)
  - `tailwind.config.js` (safelist ampliado para colores del selector)

- Notas / riesgos
  - Mantener entidades HTML en plantillas y ASCII en cadenas TS para evitar regresiones de codificación.
  - Tras cambios en `tailwind.config.js`, reiniciar dev server para regenerar las clases.

## 2025-11-11  Ajustes: limpieza de acentos y sección “Sobre la app”

- Acciones realizadas
  - Normalicé todos los textos de la plantilla de Ajustes a UTF-8 seguro usando entidades HTML para caracteres acentuados: `&aacute;`, `&eacute;`, `&iacute;`, `&oacute;`, `&uacute;`, `&ntilde;`, y el separador `&middot;`.
  - Reemplacé cadenas en código TypeScript (alertas/mensajes) por equivalentes ASCII para evitar mojibake en diálogos del navegador: “Formato invalido”, “Importacion completada”, “CSV vacio”, “Sin titulo”.
  - Corregí textos rotos en secciones: “Preferencias b&aacute;sicas…”, “Pesta&ntilde;a inicial”, “1 d&iacute;a”, “&Uacute;til para edici&oacute;n en tabla”, “Previsualizaci&oacute;n de importaci&oacute;n”, etc.
  - En la previsualización de importación reemplacé separadores corruptos por `&middot;` y aseguré “Sin t&iacute;tulo” en la plantilla (y “Sin titulo” en TS).
  - Restauré placeholders en el formulario de Categorías: `Nombre = "Salud"`, `Color = "emerald-500"`, y dejé `Emoji = ":)"` para evitar problemas de codificación.
  - Recoloqué “Sobre la app” al final de Ajustes, inmediatamente bajo la sección “Datos”, dentro de una tarjeta con borde. Contiene versión, autor (Alonso Viñé), enlace a portfolio y copyright dinámico `{{ year }}`.

- Racional
  - Los archivos habían sido guardados con codificación no UTF-8 en algún momento, causando mojibake (p. ej., “Â·”, “Pesta��a”, “d��a”). Usar entidades HTML en plantilla evita regresiones; en cadenas TS optamos por ASCII plano.

- Archivos tocados
  - `src/app/features/settings/settings.page.ts`

- Notas
  - Mantener esta estrategia (entidades HTML en templates, ASCII en cadenas TS) al tocar Dashboard/Calendario para garantizar consistencia visual sin depender del editor.

## 2025-11-11  Calendario: CTA al final de la lista

- Acciones realizadas
  - Añadido el botón "Crear recordatorio" también cuando el día seleccionado tiene elementos, colocándolo al final de la lista, con el mismo estilo del CTA de estado vacío.
  - El botón pasa `?date=YYYY-MM-DD` para prefijar la fecha en el formulario, igual que en el caso de día sin recordatorios.
- Decisiones
  - Mantener este CTA en ambas situaciones (vacío y con elementos) para consistencia y rapidez de uso.
- Archivos tocados
  - `src/app/features/calendar/calendar.page.ts`
- Notas / riesgos
  - Pendiente limpieza general de codificación en plantillas (acentos y separador `·`), se realizará en una pasada posterior usando entidades HTML o guardando en UTF-8.

## 2025-11-09  — Dashboard: selector y “Todos”

- Acciones realizadas
  - Sustituida la barra de pestañas por un selector “Ver:” alineado a la derecha con opciones: Próximos, Categorías, Pausados, Atrasados y Todos.
  - Añadida vista “Todos” que muestra todos los recordatorios, ordenados por proximidad (nextOccurrence asc) por defecto.
  - Añadido formulario pequeño de ordenación (Ordenar por + Dirección) con opciones: Proximidad, Prioridad, Título, Categoría, Estado, Actualizado, Creado.
  - Mantenida la vista de “Categorías” con chips (incluyendo “Sin categoría”) y filtrado como antes.
- Decisiones
  - Mantener confirmación nativa para eliminar en edición (sin modal custom, pendiente futuro).
  - No cambiar servicios: se reutilizan `RemindersMockService` y `CategoriesService` existentes.
- Próximos pasos
- Accesibilidad: focus visible en selector, chips y selects de orden.
- Tests ligeros para `bySelectedCategory`, ordenación en `allSorted` y mapeos de prioridad/estado.
- Revisar codificación de emojis en seeds de categorías (normalizar UTF-8).

## 2025-11-09 — Prioridad “Sin prioridad”

## 2025-11-10 — Import Preview + iCalendar

- Acciones realizadas
  - Añadido botón “Exportar iCalendar (.ics)” en Ajustes que exporta las próximas ocurrencias como eventos (30 min) con título, notas y categoría.
  - Añadidas opciones “Importar JSON (preview)” y “Importar CSV (preview)” que muestran previsualización, con conteo y muestra de primeros 3.
  - Opción para crear categorías faltantes por nombre durante la importación.
  - Al aplicar, crea recordatorios con prioridad “none” por defecto cuando no venga informada.
- Archivos tocados
  - `src/app/features/settings/settings.page.ts`
- Pendiente
  - Integrar preview en los flujos existentes (sin sufijo) o retirar los antiguos para evitar duplicidad.
  - Añadir informe descargable de resultados (creados/omitidos/errores) si se requiere.

## 2025-11-10 — Navbar fijo + FAB en Ajustes

## 2025-11-10 — Ajustes normalizado + Export/Import reestructurado

- Acciones realizadas
  - Reescrito `src/app/features/settings/settings.page.ts` para normalizar el archivo (encoding/una sola línea) y facilitar diffs.
  - Reestructurada la sección “Exportar / Importar” en tres bloques apilados: JSON, CSV e iCalendar; cada uno con su par Exportar/Importar y explicación debajo.
  - Añadido sub-bloque “Opciones avanzadas (preview)” al final con previsualización aplicable.
- Notas
  - Esta reorganización evita que botones queden fuera de su sección y afecten la maquetación.

## 2025-11-10 — Preferencias de iCalendar y Navbar

## 2025-11-10 — Estructura de assets para iconos

## 2025-11-10 — Logo en cabecera

## 2025-11-10 — Favicon en navegador

- Acciones realizadas
  - Configurado favicon en `src/index.html` con archivos dedicados: `favicon-32.png`, `favicon-16.png`, opcional `favicon.svg`, y `apple-touch-icon-180.png`.
  - `angular.json` ya copia `src/assets` a `assets/`, por lo que el navegador podrá resolver la ruta.
- Notas
  - Recomendable generar tamaños específicos (16, 32, 180) y vector `favicon.svg` para mayor nitidez.
 - Añadido `src/assets/icons/app/favicon.svg` proporcionado por el usuario.

- Acciones realizadas
  - Añadido el logo de la app en la cabecera, a la izquierda del título “Loop4U”.
  - Ruta del recurso: `assets/icons/app/logo.png` (servido desde `src/assets/icons/app/`).
- Archivos tocados
  - `src/app/app.component.ts` — se envolvió el título en un contenedor `flex` y se añadió `<img>` con clase `h-6 w-6`.
  - Posteriormente se aumentó el tamaño del logo ~50% (a 60px) con `h-[60px] w-[60px]` y se incrementó la altura de cabecera a `h-16` para dar espacio, manteniendo `object-contain`.

## 2025-11-10 — Activo assets y ruta de logo

- Acciones realizadas
  - Añadido `src/assets` a `angular.json` (`build.options.assets` y `test.options.assets`) para que el dev server copie los ficheros a `assets/` en tiempo de ejecución.
  - Comprobada ruta del logo: `assets/icons/app/logo-0000-sinNombre-niFondo.png`.
- Notas
  - Tras cambiar `angular.json`, es necesario reiniciar el dev server para que recoja la configuración.
  - Evitar nombres con espacios y variaciones de mayúsculas/minúsculas para los recursos; preferible `logo.png` simplificado.
- Acciones realizadas
  - Creadas carpetas para gestión de iconografía y fuentes maestras:
    - `src/assets/_source/` (archivos maestros: SVG/AI/Figma export)
    - `src/assets/icons/app/` (iconos empaquetados para PWA/favicon)
  - Añadidos `.gitkeep` para versionar directorios vacíos.
- Próximos pasos
  - Añadir `manifest.webmanifest` con referencias a `assets/icons/app/`.
  - Agregar links en `index.html` (favicons y apple-touch-icon).
  - Subir el icono maestro (1024x1024 o SVG) a `_source` y generar derivados (192, 512, maskable, etc.).
- Acciones realizadas
  - iCalendar: alineado al patrón JSON/CSV — contenedor `flex flex-wrap gap-3` (permite salto de línea cuando no quepa), sin scroll lateral y con el mismo estilo de botones.
  - Confirmado: navbar inferior fijo al viewport (fuera del contenedor principal) y `z-50`; FAB oculto solo en `/settings`.
- Resultado
  - Ajustes se ve estable y el navbar permanece siempre visible, tal y como prefiere el usuario.
- Acciones realizadas
  - Asegurado que el navbar inferior permanezca siempre visible por encima del contenido elevando su `z-index` (`z-20`).
  - El FAB “+” se oculta únicamente en la ruta `/settings` para evitar solaparse con contenidos de Ajustes.
- Archivos tocados
  - `src/app/app.component.ts`
- Notas
  - El `main` mantiene `pb-24` para evitar que el contenido quede oculto tras el navbar.
  - Ajuste adicional: movido el `<nav>` inferior fuera del contenedor principal para evitar efectos colaterales con contenedores con scroll/transform; ahora usa `z-50`.
- Acciones realizadas
  - Añadida opción de prioridad “Sin prioridad” como predeterminada en el formulario de crear/editar.
  - Modelo actualizado (`Reminder.priority` ahora permite `'none' | 'low' | 'med' | 'high'`).
  - UI: cuando la prioridad es “Sin prioridad”, el punto de prioridad se oculta en tarjetas, listas y calendario.
  - Ordenación en “Todos”: “Sin prioridad” se considera menor que “Baja”.
- Archivos tocados
  - `src/app/core/models/reminder.model.ts`
  - `src/app/features/reminders/reminder-form.page.ts`
  - `src/app/features/dashboard/dashboard.page.ts`
  - `src/app/features/calendar/calendar.page.ts`
- Archivos tocados
  - `src/app/features/dashboard/dashboard.page.ts`

## 2025-11-09 00:00 — Inicio y preparación

- Acciones realizadas
  - Revisión de `README.md`, `docs/PROMPT_maestro.md` y `docs/PROMPT_comportamientoAI.md` para entender producto y alcance.
  - Creación de checklist editable en `docs/temas_a_aclarar.md` con decisiones de arquitectura/dominio.
  - Recomendación de enfoque “front-first” con vertical slice y servicio mock.
  - Acordado mantener este registro y actualizar el comportamiento en `PROMPT_comportamientoAI.md`.
- Decisiones tomadas / pendientes
  - Tomadas: Mantener registro de contexto en `docs/codex.md` cada respuesta.
  - Pendientes: Definir recurrencias (Simple vs RRULE), avisos (`leadTimes`), TZ, notificaciones (Local vs Híbrido), estado Angular, librería de fechas.
- Próximos pasos
  - Usuario: marcar decisiones en `docs/temas_a_aclarar.md`.
  - Opcional: corregir encoding de `README.md`/docs a UTF-8.
  - Proponer esquema de colecciones Firestore y reglas base.
  - Preparar scaffolding Angular + Tailwind + Capacitor con servicio mock.
- Archivos tocados
  - `docs/temas_a_aclarar.md`
  - `docs/codex.md` (nuevo)
- Notas / riesgos
- Se detectan caracteres con codificación corrupta en documentación; conviene normalizar a UTF‑8.

---

## 2025-11-09 00:15 — Decisiones cerradas y plan siguiente

- Acciones realizadas
  - Revisión de `docs/temas_a_aclarar.md` con sección “Temas aclarados” completada por el usuario.
- Decisiones tomadas
  - Datos: `Firestore autoId`, historial solo `completedAt`, `leadTimes[]`, `priority`, `status`, `nextOccurrence`.
  - Recurrencias: representación simple (`frequency`, `interval`, `byDay`, `byMonthDay`), `exDates` opcional más adelante.
  - TZ: IANA + almacenamiento UTC + `timeOfDay` separado.
  - Avisos: múltiples `leadTimes[]` (min/h/d/sem).
  - Notificaciones: enfoque híbrido (locales próximas N + respaldo FCM).
  - Cálculo próxima: en cliente (recalcular en resume/boot).
  - Offline/Sync: Firestore con persistencia + LWW.
  - UX/Navegación: 3 tabs (Home, Calendario, Ajustes) + FAB global; estados vacíos con CTA.
  - Angular: componentes standalone + estructura por features; estado con servicios + Signals (sin NgRx).
  - UI: Tailwind puro.
  - Auth: anónima con upgrade Google/email + migración.
  - Backend: Firebase (Auth, Firestore, FCM).
  - Entornos/CI/CD: `dev/staging/prod`, secrets en Actions, Hosting Firebase + Actions + Fastlane; semver + changelog.
  - PWA: Workbox + push web FCM + manifest A2HS.
  - i18n: Angular i18n (ES/EN).
  - Accesibilidad: WCAG 2.1 AA, targets ≥44px, SR.
  - Fechas: `date-fns` + `date-fns-tz`, formato 24h, semana inicia lunes.
  - Testing: Unit con Jest, E2E con Playwright, mocks para recurrencias/notificaciones.
  - Límites plataforma: iOS programar próximas N; Android canales/permisos.
  - Codificación docs: UTF‑8 sin BOM; limpiar caracteres corruptos.
- Próximos pasos propuestos
  1) Documentar esquema Firestore y reglas base (`docs/firestore_schema.md`).
  2) Scaffold Angular 18 + Tailwind + estructura features + servicio mock.
  3) Implementar util de recurrencias con `date-fns(-tz)` + tests.
  4) UI inicial: 3 tabs + FAB + páginas (Dashboard, ReminderList, ReminderForm, Settings).
  5) Integrar Firebase (dev): Auth anónima, Firestore con offline, reemplazar servicio mock.
  6) Notificaciones locales (próximas N) y reprogramación en resume.
  7) Esqueleto de FCM backup (CF + Scheduler) documentado.
  8) CI: workflow básico de build/test y deploy web `dev`.
- Archivos tocados
  - `docs/temas_a_aclarar.md` (lectura)
  - `docs/codex.md` (actualización)
- Notas / riesgos
  - Pendiente normalización de encoding en docs para legibilidad.

---

## 2025-11-09 00:25 — Esquema Firestore creado

- Acciones realizadas
  - Creado `docs/firestore_schema.md` con colecciones (`users/{uid}/reminders`, `categories`, `settings`), modelo de campos, índices, reglas de seguridad de borrador, contratos TypeScript y patrones de consulta.
- Decisiones tomadas
  - Mantener `history` embebido con límite (p. ej., 50) en MVP.
  - Índices clave: `status + nextOccurrence`, y opcional `categoryId + nextOccurrence`.
- Próximos pasos
  1) Scaffold Angular 18 + Tailwind + estructura por features y servicio mock basado en contratos TS.
  2) Utilidades de recurrencia con `date-fns(-tz)` + tests de cálculo de `nextOccurrence`.
  3) Integración Firebase (entorno `dev`): Auth anónima, Firestore con offline, reemplazo del mock.
  4) Notificaciones locales (próximas N) y reprogramación en resume.
- Archivos tocados
  - `docs/firestore_schema.md` (nuevo)
  - `docs/codex.md` (actualizado)
- Notas / riesgos
  - Ajustar reglas de seguridad con validaciones de enums/tamaños a medida que avance el modelo.

---

## 2025-11-09 00:40 — Blueprint Front + Mock

- Acciones realizadas
  - Añadido blueprint de frontend en `frontend/` con modelos, utilidades de recurrencia y servicio mock de recordatorios.
  - Rutas base (3 tabs) y páginas placeholder: Dashboard, Calendario, Ajustes.
- Decisiones tomadas
  - Cálculo de próximas ocurrencias simple en UTC por ahora (se sustituirá por `date-fns-tz` al integrar).
  - Servicio mock persiste en `localStorage` para poder probar UI sin backend.
- Próximos pasos
  1) Generar proyecto Angular y copiar `frontend/src/app` al proyecto.
  2) Crear componentes reales de Lista y Form de Recordatorios; integrar `RemindersMockService`.
  3) Añadir util de notificaciones locales (siguiente hito) y posteriormente integrar Firestore.
- Archivos tocados
  - `frontend/README.md`
  - `frontend/src/app/core/models/*`
  - `frontend/src/app/core/utils/*`
  - `frontend/src/app/features/reminders/*`
  - `frontend/src/app/app.routes.ts`
  - `frontend/src/app/features/*/*.page.ts`
- Notas / riesgos
  - Faltan dependencias de Angular/fecha en este repo; se integrarán cuando se genere el proyecto real.

---

## 2025-11-09 00:50 — Error al abrir blueprint en IDE

- Acciones realizadas
  - Usuario reporta fallo al abrir `frontend/src/app/features/reminders/reminders.mock.service.ts` en el IDE.
- Hipótesis
  - Probable: errores de resolución de módulos (no existe `@angular/core` en este repo, es solo blueprint).
  - Alternativa: uso de `localStorage` en contexto SSR sin guardas.
- Recomendación inmediata
  1) Crear proyecto Angular y mover/copiar el blueprint dentro del `src/app` real para que el IDE resuelva dependencias.
  2) Si se quiere mantener en este repo, excluir `frontend/` del análisis TS del IDE o inicializar un workspace Angular independiente.
  3) Si habrá SSR: añadir guardas `isPlatformBrowser` alrededor de `localStorage` en el servicio.
- Pendiente
  - Esperar el texto exacto del error (mensaje/stack) para diagnóstico preciso.

---

## 2025-11-09 00:58 — Instrucciones de creación Angular

- Acciones/plan
  - Crear proyecto Angular fuera del repo actual (evitar conflicto de carpeta existente).
  - Integrar Tailwind y copiar el blueprint (`frontend/src/app`) al `src/app` del proyecto Angular.
- Comandos propuestos (PowerShell)
  1) `npm i -g @angular/cli`
  2) `cd C:\proyectos`
  3) `ng new loop4u-web --routing --style=scss --standalone`
  4) `cd loop4u-web`
  5) `npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
  6) Configurar `tailwind.config.js` → `content: ['src/**/*.{html,ts}']`
  7) En `src/styles.scss` añadir `@tailwind base; @tailwind components; @tailwind utilities;`
  8) Copiar `c:\proyectos\loop4u\frontend\src\app\*` a `src\app\` (sobrescribir rutas si procede)
  9) `ng serve -o`
- Notas
  - Si se desea monorepo, se puede crear el proyecto dentro de `frontend/` pero debe estar vacío antes.
  - Instalar `date-fns` y `date-fns-tz` cuando migremos el cálculo de recurrencias.

---

## 2025-11-09 01:05 — Error: "ng no se reconoce"

- Acciones realizadas
  - Usuario intenta `ng new` y la terminal muestra: "ng no se reconoce como un comando interno o externo".
- Causa
  - Angular CLI no está instalada globalmente o la ruta global de npm (`%AppData%\npm`) no está en `PATH`.
- Soluciones propuestas
  1) Usar NPX sin instalación global: `npx -p @angular/cli@latest ng new loop4u-web --routing --style=scss --standalone`.
  2) Instalar CLI global y refrescar PATH: `npm i -g @angular/cli` y reabrir VS Code. Verificar con `ng version`.
  3) Si persiste, agregar `%UserProfile%\AppData\Roaming\npm` al PATH del usuario o ejecutar `"$env:APPDATA\\npm\\ng.cmd" version`.
  4) Si aparece error de scripts (`.ps1`), ejecutar: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` en PowerShell.
- Próximos pasos
  - Ejecutar la opción 1 (NPX) para avanzar sin bloquearse por PATH y continuar con el scaffolding.

---

## 2025-11-09 01:12 — Decisión CLI Angular (SSR)

- Acciones realizadas
  - Usuario ejecuta `ng new` y la CLI pregunta por SSR/SSG.
- Decisión
  - SSR/SSG: No (N). Motivo: simplificar MVP y evitar guardas por `localStorage` en SSR. Se podrá añadir luego con `ng add @angular/ssr`.
- Próximos pasos inmediatos
  1) Completar `ng new` respondiendo N a SSR.
  2) `cd loop4u-web` y probar `ng serve -o`.
  3) Integrar Tailwind: instalar deps, `npx tailwindcss init -p`, configurar `content`, añadir directivas a `styles.scss`.
  4) Copiar `frontend/src/app` del repo al `src/app` del nuevo proyecto.
  5) (Opcional) `npm i date-fns date-fns-tz` para utilidades de recurrencia.

---

## 2025-11-09 01:18 — CLI instalado; refrescar terminal

- Observación
  - En `cmd.exe` `ng version` funciona (CLI 20.3.9). En terminal de VS Code dio “ng no se reconoce”.
- Causa
  - La sesión de VS Code no heredó el PATH actualizado (`%AppData%\\npm`).
- Recomendación
  1) Cerrar pestaña de terminal en VS Code y abrir una nueva (o reiniciar VS Code).
  2) Verificar: `ng version` en la nueva terminal.
  3) Si aún no funciona, usar `npx -p @angular/cli@latest ng new ...` o ejecutar `"%AppData%\\npm\\ng.cmd" new ...`.
- Próximo paso
  - Ejecutar `ng new loop4u-web --routing --style=scss --standalone` desde `C:\proyectos` y continuar con el plan.

---

## 2025-11-09 01:25 — Prompt CLI: AI tools

- Observación
  - La CLI pregunta: "Which AI tools do you want to configure with Angular best practices?".
- Decisión recomendada
  - Seleccionar `None` para evitar archivos/config extra en el MVP. Se puede integrar la IA elegida más adelante sin impacto.
- Alternativa
  - Si ya usas Copilot o Cursor de forma habitual, puedes marcar solo ese; no afecta al resto del plan.
- Próximos pasos
  1) Completar `ng new` (None) y terminar creación.
  2) `cd loop4u-web && ng serve -o` para verificar.
  3) Integrar Tailwind y copiar blueprint `frontend/src/app` al nuevo proyecto.

---

## 2025-11-09 01:35 — Proyecto Angular creado y arrancando

- Acciones realizadas
  - Usuario confirma `loop4u-web` creado y `ng serve -o` funcionando.
- Próximos pasos detallados
  1) Instalar y configurar Tailwind en `loop4u-web`:
     - `npm i -D tailwindcss postcss autoprefixer`
     - `npx tailwindcss init -p`
     - Editar `tailwind.config.js` → `content: ['src/**/*.{html,ts}']`
     - En `src/styles.scss` añadir al inicio: `@tailwind base; @tailwind components; @tailwind utilities;`
  2) Copiar blueprint del repo actual al proyecto Angular:
     - Copiar `c:\proyectos\loop4u\frontend\src\app\*` → `c:\proyectos\loop4u-web\src\app\` (sobrescribir `app.routes.ts`).
  3) Verificar arranque: `ng serve -o`.
- Notas / riesgos
  - El blueprint usa utilidades propias para fecha/recurrencia; luego migraremos a `date-fns(-tz)` si es necesario.

---

## 2025-11-09 01:45 — Error con `npx tailwindcss init -p`

- Síntoma
  - `npm error could not determine executable to run` al ejecutar `npx tailwindcss init -p`.
- Causas probables
  - `npx` no resuelve el binario de `tailwindcss` instalado localmente.
- Soluciones (intentar en orden)
  1) Forzar versión desde npx: `npx tailwindcss@latest init -p`
  2) Alternativa npx: `npx --package=tailwindcss@latest -- tailwindcss init -p`
  3) Ejecutar el CLI directamente: `node node_modules/tailwindcss/lib/cli.js init -p`
  4) Si falla, reinstalar deps: `npm i -D tailwindcss@latest postcss autoprefixer` y repetir 1).
- Opción manual (si todos fallan)
  - Crear `tailwind.config.js` con `content: ['src/**/*.{html,ts}']`.
  - Crear `postcss.config.js` con plugins `tailwindcss` y `autoprefixer`.
  - Añadir las directivas en `src/styles.scss`.
- Verificación
  - Añadir `<div class="p-4 bg-emerald-500 text-white">Tailwind ok</div>` en `app.html` y comprobar en `ng serve -o`.

---

## 2025-11-09 02:15 — Handover resumen y guía reproducible

- Estado actual
  - Proyecto Angular `loop4u-web` creado (CLI 20.x), sin SSR/SSG, standalone.
  - Blueprint copiado: modelos (`core/models`), utilidades (`core/utils`), mock service (`features/reminders/reminders.mock.service.ts`), páginas placeholder (Dashboard/Calendar/Settings) y rutas base.
  - Root fijo: `src/app/app.component.ts`, `src/app/app.ts`, `src/app/app.config.ts` recreados tras copia del blueprint.
  - La app arranca y muestra Dashboard placeholder en `http://localhost:4200`.

- Decisiones relevantes ya tomadas
  - Front-first con servicio mock; Firestore según `docs/firestore_schema.md`.
  - Recurrencias simples (`frequency`, `interval`, `byDay?`, `byMonthDay?`).
  - TZ IANA + almacenamiento UTC + `timeOfDay`.
  - Notificaciones híbridas (locales próximas N + backup FCM) en fase posterior.

- Pasos reproducibles (nuevo entorno)
  1) Requisitos: Node ≥ 18 (usamos 22.x), npm, Angular CLI 20.x.
  2) Crear proyecto (sin SSR):
     - `ng new loop4u-web --routing --style=scss --standalone`
     - Responder: SSR/SSG = No; AI tools = None.
  3) Copiar blueprint si se parte de cero:
     - Copiar `frontend/src/app/*` (de este repo) → `loop4u-web/src/app/`.
     - Asegurar que existen: `src/app/app.component.ts`, `src/app/app.ts`, `src/app/app.config.ts`.
     - No tocar `src/main.ts` ni `src/index.html` del proyecto Angular.
  4) Arrancar: `cd loop4u-web && ng serve -o`.
  5) (Opcional) Tailwind:
     - `npm i -D tailwindcss postcss autoprefixer`
     - `npx tailwindcss@latest init -p` (si falla en Windows, usar `node node_modules/tailwindcss/lib/cli.js init -p`).
     - `tailwind.config.js` → `content: ['src/**/*.{html,ts}']`.
     - `src/styles.scss` → `@tailwind base; @tailwind components; @tailwind utilities;`.

- Siguientes hitos sugeridos
  1) Añadir páginas de `ReminderList` y `ReminderForm` con rutas `/reminders` y `/reminders/new` y conectar `RemindersMockService`.
  2) Sembrar categorías/demo si hace falta (`features/reminders/seed.ts`).
  3) Integrar Tailwind (si no se hizo) y estilos básicos.
  4) Integración Firebase (entorno `dev`): Auth anónima, Firestore con offline; CRUD real según `docs/firestore_schema.md`.
  5) Notificaciones locales (Capacitor) y luego backup FCM (Cloud Functions + Scheduler) según el enfoque híbrido.

- Archivos de referencia clave (en esta carpeta `docs/`)
  - `docs/firestore_schema.md` — colecciones, campos, reglas y contratos TS.
  - `docs/temas_a_aclarar.md` — decisiones de arquitectura/domino cerradas.
  - `docs/PROMPT_maestro.md` — alcance, roadmap y entregables.
  - `docs/PROMPT_comportamientoAI.md` — guía de conducta + obligación de actualizar `docs/codex.md`.

- Consideraciones al mover solo `docs/` a otro proyecto
  - Asegurar que el otro proyecto tiene el código fuente del front (ya en `loop4u-web/src/app`). Si no, copiar el blueprint desde este repo o recrear piezas siguiendo `docs/firestore_schema.md`.
  - Mantener este archivo `docs/codex.md` y seguir agregando entradas por cada cambio/decisión.
  - Normalizar encoding a UTF‑8 (sin BOM) si aparecen caracteres corruptos en docs.
  - Si se habilita SSR más adelante, proteger accesos a `localStorage` con `isPlatformBrowser`.
  - En Windows, si `ng` no se reconoce en VS Code, abrir nueva terminal o usar `npx -p @angular/cli@latest ng ...`.
  - Si `npx tailwindcss init -p` falla, usar `npx tailwindcss@latest init -p` o ejecutar el CLI de `node_modules`.

- Checklist rápido para el siguiente agente
  - [ ] Confirmar que `http://localhost:4200` carga el Dashboard.
  - [ ] Crear `ReminderList` y `ReminderForm`; añadir rutas y navegación.
  - [ ] Validar cálculo de `nextOccurrence` con casos diarios/semanales/mensuales.
  - [ ] Integrar Tailwind (si procede) y un layout básico.
  - [ ] Preparar `.env`/`environment.*` con credenciales de Firebase (dev) y activar persistencia offline.
  - [ ] Definir `security rules` basadas en el borrador de `docs/firestore_schema.md`.
---

## 2025-11-09 19:35 — UI seed + form validation

- Acciones realizadas
  - Añadidos rutas `reminders/new` y `reminders/:id/edit`.
  - Nueva página `ReminderFormPage` con Reactive Forms y validaciones visibles (required, maxlength, min). Borde rojo en inválidos.
  - Dashboard ahora consume `RemindersMockService` (próximos/atrasados) y muestra estado vacío con CTA + botón “Cargar datos demo”.
  - Servicio mock: método `seedDemo()` que carga `demoReminders` si no hay datos.
  - Normalización Tailwind: configuración PostCSS y downgrade a Tailwind v3 para compatibilidad; build verificado.
- Decisiones
  - Mantener datos mock hasta integrar Firebase (`dev`).
  - Seed visible solo cuando no hay datos; si existen, se puede limpiar `localStorage` clave `loop4u.reminders`.
- Próximos pasos
  1) Mejoras UX en formulario (leadTimes múltiple, byDay/byMonthDay condicionales).
  2) Tests para `computeNextOccurrence` (daily/weekly/monthly/yearly).
  3) Integración Firebase (Auth anónima + Firestore con persistencia) y portar servicio.
- Archivos tocados
  - `src/app/app.routes.ts`
  - `src/app/features/reminders/reminder-form.page.ts`
  - `src/app/features/dashboard/dashboard.page.ts`
  - `src/app/features/reminders/reminders.mock.service.ts`
  - `postcss.config.js`, `tailwind.config.js`, `src/styles.scss`
- Notas / riesgos
  - Si no se ve el estado vacío, puede haber datos previos en `localStorage`; limpiar clave `loop4u.reminders`.
## 2025-11-09 19:50 — CTA siempre visible en Dashboard

- Acciones realizadas
  - El bloque de llamada a la acción en Dashboard ahora se muestra siempre, haya o no datos.
  - Mantiene dos acciones: “Crear recordatorio” y “Cargar datos demo”.
- Decisiones
  - Facilitar pruebas y onboarding mostrando el CTA de forma permanente.
- Próximos pasos
  1) Ajustar copy/estilos según feedback.
  2) Continuar con tests de recurrencia o integrar Firebase (dev).
- Archivos tocados
  - `src/app/features/dashboard/dashboard.page.ts`
## 2025-11-09 20:02 — Mejora visual de secciones en Dashboard

- Acciones realizadas
  - Aumentado tamaño y peso tipográfico de “Próximos” y “Atrasados” (`text-lg md:text-xl font-semibold`).
  - Reducido el tamaño del título de cada item a `text-sm md:text-base` para mayor contraste.
- Decisiones
  - Priorizar jerarquía visual clara de secciones en mobile-first.
- Próximos pasos
  - Ajustar spacing/bordes si se requiere más separación visual.
- Archivos tocados
  - `src/app/features/dashboard/dashboard.page.ts`
## 2025-11-09 20:08 — Tests de recurrencia (unit)

- Acciones realizadas
  - Añadido `src/app/core/utils/recurrence.util.spec.ts` con pruebas Jasmine:
    - Daily (mismo día vs. día siguiente)
    - Weekly con `byDay`
    - Monthly con `byMonthDay` (31 → 28/29)
    - Yearly
- Decisiones
  - No ejecutar tests automáticamente en esta sesión; se pueden lanzar con `npm test` cuando lo indiques.
- Próximos pasos
  - Extender casos (endDate, interval>1, byDay ordenado) si es necesario.
  - Iniciar integración Firebase (dev) para persistencia real.
- Archivos tocados
  - `src/app/core/utils/recurrence.util.spec.ts`
## 2025-11-09 20:12 — Calendario básico y Ajustes

- Acciones realizadas
  - Calendario mensual funcional sin eventos: navegación mes anterior/siguiente, semana inicia lunes, grid 6x7 con día actual resaltado.
  - Ajustes con opciones de tema (Sistema/Claro/Oscuro) y botón “Borrar datos locales”.
  - Sección “Acerca de” con nombre de app, versión y autor.
  - Configurado Tailwind `darkMode: 'class'` para que el toggle manual funcione.
- Próximos pasos
  - Añadir marcadores de eventos en el calendario a partir del servicio.
  - Persistir preferencia de tema y aplicarla al cargar (ya persiste; aplicar en bootstrap si se desea).
- Archivos tocados
  - `src/app/features/calendar/calendar.page.ts`
  - `src/app/features/settings/settings.page.ts`
  - `tailwind.config.js`
## 2025-11-09 20:17 — Ajustes: borrado total + autor

- Acciones realizadas
  - Añadido botón con confirmación “Borrar TODOS los datos” (limpia localStorage y sessionStorage).
  - Renombrado autor en “Acerca de” a “Alonso Viñé”.
- Notas
  - El borrado total limpia también la preferencia de tema; tras hacerlo puede ser necesario refrescar.
- Archivos tocados
  - `src/app/features/settings/settings.page.ts`
## 2025-11-09 20:30 — Preferencias y exportación/importación

- Acciones realizadas
  - Servicio `SettingsService` (hourFormat 12/24 y defaultLeadTimes con señales y persistencia en localStorage).
  - Dashboard usa `hourFormat` para mostrar fechas con `dd/MM/yy, HH:mm` o `dd/MM/yy, h:mm a`.
  - Formulario usa `defaultLeadTimes` al crear recordatorios.
  - Ajustes: secciones nuevas para Formato de hora, Avisos por defecto, Exportar JSON/CSV e Importar JSON.
  - Enlace a portfolio del autor (Alonso Viñé) en Acerca de.
- Próximos pasos
  - Opcional: Importar CSV además de JSON.
  - Aplicar preferencia de tema en bootstrap (antes de render) para evitar parpadeo.
- Archivos tocados
  - `src/app/core/services/settings.service.ts`
  - `src/app/features/settings/settings.page.ts`
  - `src/app/features/dashboard/dashboard.page.ts`
  - `src/app/features/reminders/reminder-form.page.ts`
## 2025-11-09 20:35 — Tema antes de bootstrap + pestaña inicial + CSV

- Acciones realizadas
  - `main.ts`: aplicar preferencia de tema antes de bootstrapping para evitar parpadeo.
  - `SettingsService`: nueva preferencia `initialTab` ('home'|'calendar'|'settings').
  - `AppComponent`: redirige a la pestaña inicial cuando la URL es `/`.
  - Ajustes: sección “Pestaña inicial”.
  - Exportar/Importar: añadido importador CSV básico además de JSON.
- Archivos tocados
  - `src/main.ts`, `src/app/app.component.ts`
  - `src/app/core/services/settings.service.ts`
  - `src/app/features/settings/settings.page.ts`
  - `src/app/features/dashboard/dashboard.page.ts`
## 2025-11-09 20:47 — Calendario con eventos y desglose diario

- Acciones realizadas
  - El calendario ahora muestra eventos por día: cada celda reparte el espacio entre los primeros 3 eventos con texto truncado y añade “+N” si hay más.
  - Al tocar un día, aparece un listado ordenado por hora con los recordatorios de ese día.
  - Generación de ocurrencias del mes visible a partir de las reglas de recurrencia existentes.
- Archivos tocados
  - `src/app/features/calendar/calendar.page.ts`
## 2025-11-09 20:58 — Prioridad reubicada + iconos de categoría + edición desde listas

- Acciones realizadas
  - Reubicado el punto de prioridad (verde/amarillo/rojo con glow) a la esquina superior derecha en Dashboard y tarjetas del calendario.
  - Añadido icono de categoría (emoji provisional por `categoryId`) junto al título.
  - Click en título abre el formulario de edición; botón “Eliminar” cuando se edita.
- Archivos tocados
  - `src/app/features/dashboard/dashboard.page.ts`
  - `src/app/features/calendar/calendar.page.ts`
  - `src/app/features/reminders/reminder-form.page.ts`
## 2025-11-10 — Modal descartado + tarjetas en Calendario

- Decisión
  - Se descarta el modal de detalle tanto en Inicio como en Calendario según preferencia del usuario.
- Acciones realizadas
  - Eliminada la lógica de modal y restaurados los enlaces a edición.
  - En Calendario, las tarjetas de la lista del día seleccionado pasan a usar el mismo estilo que en Dashboard (banda de color, punto de prioridad arriba a la derecha, título con emoji y línea secundaria con frecuencia · hora).
  - Indicador de “Pausado”:
    - En las minitarjetas del grid mensual: icono ⏸ en ámbar y ligera atenuación.
    - En la lista del día: badge “Pausado” (borde/texto ámbar) y opacidad reducida para distinguirlos rápidamente.
- Archivos tocados
  - `src/app/features/calendar/calendar.page.ts`
  - `src/app/features/dashboard/dashboard.page.ts`
