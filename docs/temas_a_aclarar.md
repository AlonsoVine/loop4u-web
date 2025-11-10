**Temas a Aclarar — Loop4U**

- Instrucción: elimina las opciones que no uses y completa “Decisión”.
- Nota: “(Recomendado)” indica una sugerencia inicial; puedes cambiarla.

**Modelo De Datos**
- Campos base: `id`, `title`, `notes`, `categoryId`, `startDate`, `endDate?`, `timeOfDay`, `timezone`, `recurrence`, `leadTimes[]`, `priority`, `status`, `lastCompletedAt`, `nextOccurrence`, `history[]`.
- Identificadores:
  - [ ] `Firestore autoId` (simple)
  - [ ] `ulid` (orden temporal)
- Historial:
  - [ ] Solo `completedAt` (MVP)
  - [ ] También `skippedAt`, `snoozedUntil`
- Decisión: ...

**Recurrencias**
- Representación:
  - [ ] Simple (`frequency`, `interval`, `byDay`, `byMonthDay`) (Recomendado para MVP)
  - [ ] Estándar iCal `RRULE` (con `rrule.js`) (más potente)
- Mensual:
  - [ ] Día fijo del mes (p. ej., 15)
  - [ ] “Enésimo día de la semana” (2º lunes)
- Excepciones:
  - [ ] Permitir `exDates[]` (saltar una ocurrencia)
- Decisión: ...

**Zonas Horarias**
- Almacenamiento de TZ:
  - [ ] IANA (`Europe/Madrid`) (Recomendado)
  - [ ] Offset fijo
- Estrategia:
  - [ ] Guardar UTC + `timeOfDay` separado; convertir al mostrar (Recomendado)
- Decisión: ...

**Avisos / Anticipación**
- Modelo:
  - [ ] Un único `leadTime` (ej. 1 día)
  - [ ] Varios `leadTimes[]` (7d, 1d, 1h) (Recomendado)
- Unidades:
  - [ ] min / h / d / sem (configurable) (Recomendado)
- Decisión: ...

**Arquitectura De Notificaciones**
- [ ] Local (dispositivo con Capacitor Local Notifications) (+offline, -limitaciones iOS)
- [ ] Push backend (Cloud Scheduler/Functions + FCM) (+fiable en background)
- [ ] Híbrido (agenda locales próximas N + backup push) (Recomendado)
- Decisión: ...

**Cálculo De Próxima Ocurrencia**
- [ ] En cliente (recalcular en app resume/boot) (Recomendado para MVP)
- [ ] En backend (Cloud Function actualiza `nextOccurrence`)
- [ ] Híbrido (cliente calcula, backend valida/monitorea)
- Decisión: ...

**Estrategia Offline Y Sincronización**
- [ ] Firestore con persistencia local activada (Recomendado)
- [ ] Cola local de acciones con `lastUpdatedAt` (serverTimestamp)
- Resolución de conflictos:
  - [ ] Last-write-wins (Recomendado)
  - [ ] Reglas específicas por campo (fusionar arrays como `leadTimes`)
- Decisión: ...

**Categorías**
- Semilla inicial:
  - [ ] Salud, Hogar, Vehículo, Finanzas, Personales, Trabajo, Mascotas (Recomendado)
- Iconos:
  - [ ] Emoji (MVP) (Recomendado)
  - [ ] Set de iconos (Heroicons/Material) más adelante
- Colores:
  - [ ] Paleta Tailwind con contraste AA (Recomendado)
- Decisión: ...

**UX Y Navegación**
- Pantallas:
  - [ ] Onboarding (permisos), Dashboard, Calendario, Lista, Formulario, Ajustes (Recomendado)
- Navegación:
  - [ ] 5 tabs (Home, Calendario, Añadir, Lista, Ajustes) + FAB en Home
  - [ ] 3 tabs (Home, Calendario, Ajustes) + FAB global (Recomendado)
- Estados vacíos con CTA “Crear recordatorio”:
  - [ ] Sí (Recomendado)
- Decisión: ...

**Arquitectura Angular**
- Componentes:
  - [ ] Standalone + estructura por features (`features/...`, `core`, `shared`) (Recomendado)
- Estado:
  - [ ] Servicios con RxJS/Signals (Recomendado para MVP)
  - [ ] NgRx (store/effects) si crece la complejidad
- Decisión: ...

**Estilos UI**
- [ ] Tailwind únicamente (Recomendado)
- [ ] Tailwind + librería headless (Headless UI / Ark UI)
- [ ] Angular Material parcial (inputs, dialogs)
- Decisión: ...

**Autenticación**
- Modalidad:
  - [ ] Sin cuenta (anónima) con upgrade a Google/email (Recomendado)
  - [ ] Obligatoria (Google/email)
- Migración:
  - [ ] Permitir enlazar y migrar datos anónimos al iniciar sesión (Recomendado)
- Decisión: ...

**Privacidad Y Consentimiento**
- Primer arranque:
  - [ ] Consentimiento de notificaciones (opt-in) (Recomendado)
  - [ ] Consentimiento de analytics (opt-in)
- Enlace a política de privacidad:
  - [ ] Sí (Recomendado)
- Exportar/borrar datos:
  - [ ] Sí (Recomendado)
- Decisión: ...

**Backend / BBDD**
- [ ] Firebase (Auth + Firestore + FCM) (Recomendado)
- [ ] Supabase (+ Edge Functions) si se requiere SQL/joins complejos
- [ ] Híbrido (Firebase base, funciones personalizadas si hace falta)
- Decisión: ...

**Entornos Y Configuración**
- Firebase:
  - [ ] `dev`, `staging`, `prod` (Recomendado)
- Angular:
  - [ ] `environment.*` por entorno (Recomendado)
- Capacitor:
  - [ ] `appId`/`bundleId` por target (Recomendado)
- Secretos:
  - [ ] GitHub Actions Secrets (Recomendado)
- Decisión: ...

**CI/CD**
- Web:
  - [ ] Firebase Hosting (Recomendado con Firestore/FCM)
  - [ ] Vercel
- Mobile:
  - [ ] GitHub Actions + Fastlane (firmados) (Recomendado)
- Versionado:
  - [ ] Semántico + changelog (Recomendado)
- Decisión: ...

**PWA**
- [ ] Workbox (precache + rutas dinámicas) (Recomendado)
- [ ] Push web vía FCM (Recomendado)
- [ ] A2HS + manifest con iconos adaptativos (Recomendado)
- Decisión: ...

**Localización**
- [ ] Angular i18n (Recomendado)
- [ ] Transloco / ngx-translate (si se requiere runtime toggling complejo)
- Idiomas iniciales:
  - [ ] ES, EN (Recomendado)
- Decisión: ...

**Accesibilidad**
- [ ] WCAG 2.1 AA (contraste claro/oscuro) (Recomendado)
- [ ] Controles táctiles ≥ 44px, focus visible, lector de pantalla (Recomendado)
- Decisión: ...

**Fechas / Horas**
- Librería:
-  - [ ] `date-fns` + `date-fns-tz` (ligero) (Recomendado)
  - [ ] `Luxon` (API cómoda con TZ)
- Formato:
  - [ ] 24h; semana inicia lunes por región (Recomendado)
- Decisión: ...

**Testing**
- Unit:
  - [ ] Jest + Testing Library (Angular 18) (Recomendado)
- E2E:
  - [ ] Playwright (Recomendado)
- Cobertura:
  - [ ] Tests de cálculo de recurrencias y programación de notificaciones (mocks) (Recomendado)
- Decisión: ...

**Límites De Plataforma**
- iOS:
  - [ ] Programar “próximas N” (p. ej., 10) y recalcular en background/app resume (Recomendado)
- Android:
  - [ ] Canales y permisos runtime (13+) (Recomendado)
- Decisión: ...

**Codificación De Archivos**
- [ ] Usar UTF‑8 (sin BOM) en `README.md` y `docs/*` (Recomendado)
- [ ] Limpiar emojis/acentos corruptos
- Decisión: ...

---
## Temas aclarados

🧩 Modelo de Datos

✅ Firestore autoId, historial solo completedAt, estructura con leadTimes[], priority, status, nextOccurrence.

🔁 Recurrencias

✅ Representación simple (frequency, interval, byDay, byMonthDay), con opción de excepciones exDates[] más adelante.

🌍 Zonas Horarias

✅ IANA (Europe/Madrid) + guardar UTC + timeOfDay separado; conversión al mostrar.

🔔 Avisos / Anticipación

✅ Varios leadTimes[] (minutos/horas/días/semanas); configurable.

📱 Notificaciones

✅ Híbrido: locales para próximas N tareas + backup push via FCM.

🧮 Cálculo Próxima Ocurrencia

✅ En cliente (recalcular al abrir/app resume) para MVP.

🔄 Offline / Sync

✅ Firestore con persistencia local + resolución last-write-wins.

🗂️ Categorías

✅ Semilla: Salud, Hogar, Vehículo, Finanzas, Personales, Trabajo, Mascotas.
✅ Iconos emoji + colores Tailwind.

🧭 UX / Navegación

✅ 3 tabs (Home, Calendario, Ajustes) + FAB global.
✅ Estados vacíos con CTA “Crear recordatorio”.

⚙️ Arquitectura Angular

✅ Componentes standalone + estructura por features.
✅ Estado con servicios y Signals/RxJS (sin NgRx).

🎨 Estilos UI

✅ Tailwind puro (sin Material en MVP).

🔐 Autenticación

✅ Modo anónimo + opción de login Google/email con migración de datos.

🛡️ Privacidad

✅ Consentimientos opt-in (notificaciones, analytics), política visible, opción exportar/borrar datos.

☁️ Backend

✅ Firebase (Auth + Firestore + FCM).

🧱 Entornos / Config

✅ dev, staging, prod; secrets en GitHub Actions.

🚀 CI/CD

✅ Firebase Hosting (web) + GitHub Actions + Fastlane (mobile).
✅ Versionado semántico con changelog.

🌐 PWA

✅ Workbox + push web FCM + manifest A2HS.

🌎 Localización

✅ Angular i18n con ES/EN.

♿ Accesibilidad

✅ WCAG 2.1 AA + controles táctiles ≥44px + soporte lector pantalla.

⏰ Fechas / Horas

✅ date-fns + date-fns-tz, formato 24h, semana inicia lunes.

🧪 Testing

✅ Unit con Jest, E2E con Playwright, mocks para recurrencias/notificaciones.

📱 Límites Plataforma

✅ iOS: programar próximas N; Android: canales y permisos runtime.

💾 Codificación Archivos

✅ UTF-8 sin BOM; limpiar emojis/acentos corruptos.