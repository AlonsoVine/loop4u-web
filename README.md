# 📱 Loop4U — Asistente inteligente de recordatorios recurrentes

## 🧠 Descripción general

**Loop4U** es una aplicación **mobile-first** (Android / iOS) con versión web complementaria, diseñada para ayudar a las personas a **recordar tareas, revisiones y gestiones periódicas** de cualquier ámbito: salud, hogar, vehículo, finanzas o compromisos personales.

Su objetivo es **automatizar los recordatorios recurrentes**, liberando al usuario de tener que recordar fechas de mantenimiento, citas médicas, pagos o revisiones.  
Loop4U actúa como un **asistente inteligente** que centraliza todas esas tareas en un solo lugar, notificando al usuario en el momento adecuado.

---

## 🎯 Objetivos principales

- Recordar **todo lo recurrente**: revisiones del coche, facturas, seguros, mediciones médicas, citas, tareas domésticas, etc.
- Que estos recordatorios estén **agrupados por categorias**
- Posibilidad de **crear una nueva categoría**, asignarle un emoji o un color, etc.
- Notificar con **anticipación configurable** (1 día, 1 semana, etc.).
- Ofrecer una **interfaz limpia y visual** adaptada a móvil.
- Sincronizar datos entre dispositivos de forma segura.
- Permitir el uso **sin conexión**, con sincronización automática al recuperar conexión.
- Facilitar la publicación en **Google Play** y **App Store** desde un único código base.

---

## 🧩 Funcionalidades clave

| Categoría | Descripción |
|------------|-------------|
| 🗓️ **Gestión de recordatorios** | Crear, editar, eliminar tareas recurrentes con frecuencia personalizada (diaria, semanal, mensual, anual o definida por el usuario). |
| 🧭 **Categorías e iconos** | Clasificación por ámbito (salud, hogar, coche, finanzas, personales, etc.) con iconos y colores propios. |
| 🔔 **Notificaciones inteligentes** | Envío de recordatorios locales y push mediante Firebase Cloud Messaging. |
| 📊 **Dashboard principal** | Vista general con próximas tareas, atrasadas y resumen de estado. |
| 🌙 **Modo oscuro / claro** | Tema dinámico y adaptativo según el sistema o preferencia del usuario. |
| ☁️ **Sincronización cloud** | Persistencia automática de datos en Firestore y sincronización en tiempo real entre dispositivos. |
| 🧾 **Historial / estadísticas** | Registro de cumplimiento y análisis básico de hábitos. |
| 🔐 **Autenticación opcional** | Inicio de sesión con Google o email/contraseña. |
| 📱 **App nativa** | Empaquetada con Capacitor para Android/iOS. |
| 🌐 **Versión web** | Desplegada como PWA accesible desde navegador. |

---

## ⚙️ Stack tecnológico

### 🖥️ Frontend — **Angular 18**
- **Motivo:**  
  Angular ofrece una **arquitectura escalable, modular y tipada**, ideal para proyectos con múltiples vistas, servicios y lógica compleja.
- **Ventajas:**  
  - CLI robusta para scaffolding rápido.  
  - Formularios reactivos y validaciones integradas.  
  - Soporte completo para **PWA**, ideal para la versión web.  
  - Excelente tipado y tooling con **TypeScript**.  
  - Separación clara de capas (componentes, servicios, módulos, pipes).  
- **Alternativas consideradas:** React, Vue — descartadas por menor estructura nativa y más dependencia de librerías externas.

---

### 🎨 Estilos — **Tailwind CSS**
- **Motivo:**  
  Tailwind permite un diseño **rápido, consistente y liviano**, ideal para interfaces móviles minimalistas.
- **Ventajas:**  
  - Estilos utilitarios sin necesidad de escribir CSS personalizado.  
  - **Modo oscuro nativo** con clases condicionales.  
  - Facilita un **diseño coherente y adaptable** sin sobrecargar el bundle.  
- **Alternativas:** Angular Material (podría combinarse para inputs, modales o menús).

---

### 📱 Mobile — **Capacitor**
- **Motivo:**  
  Capacitor (de Ionic) permite **convertir un proyecto Angular en app nativa** para Android y iOS sin reescribir la interfaz.
- **Ventajas:**  
  - Plugins nativos para notificaciones, almacenamiento, cámara, fondo, etc.  
  - Fácil integración con **Firebase Cloud Messaging** (FCM) para push.  
  - Mismo código para web, Android e iOS.  
  - Compatibilidad con Xcode y Android Studio para publicación.  
- **Alternativas:** Ionic completo o Flutter.  
  - Flutter ofrece UI nativa pura, pero implica reescribir la app.  
  - Capacitor mantiene un único stack JS.

---

### ☁️ Backend / Base de datos — **Firebase (Firestore)**
- **Motivo:**  
  Reduce tiempo de desarrollo, sin gestionar servidores ni infraestructura.
- **Ventajas:**  
  - **Firestore**: base de datos NoSQL en tiempo real, offline-ready.  
  - **Firebase Auth**: autenticación Google, email o anónima.  
  - **Firebase Cloud Messaging (FCM)**: gestión completa de notificaciones.  
  - **Firebase Hosting**: despliegue rápido de la PWA.  
  - **Firebase Functions (opcional)**: lógica backend serverless (por ejemplo, recordatorios automáticos).  
- **Alternativas:**  
  - **Supabase (PostgreSQL + RLS)** → más SQL y self-hosted.  
  - **Node.js + Express + MongoDB** → más flexible, pero más mantenimiento.

---

### 🔄 CI/CD y despliegue
- **GitHub Actions:** automatización de test, build y deploy.  
- **Vercel / Firebase Hosting:** despliegue de la versión web.  
- **Builds móviles:** scripts `npm run build:android` y `npm run build:ios` para generar artefactos listos para subir a tiendas.  

---

## 🧱 Arquitectura general

/loop4u
├── src/
│ ├── app/
│ │ ├── modules/
│ │ │ ├── reminders/
│ │ │ ├── dashboard/
│ │ │ ├── settings/
│ │ │ └── auth/
│ │ ├── core/
│ │ │ ├── services/
│ │ │ ├── models/
│ │ │ └── guards/
│ │ └── shared/
│ ├── assets/
│ ├── environments/
│ └── main.ts
├── capacitor.config.ts
├── firebase.json
├── package.json
├── README.md
└── angular.json

``` yaml
## 🔔 Notificaciones

- **Locales:** programadas directamente en el dispositivo con Capacitor Local Notifications.  
- **Push:** gestionadas mediante Firebase Cloud Messaging (mensajes programados o automáticos).  
- **Política de permisos:** el usuario elige qué tipo de avisos desea recibir (notificaciones, correo, etc.).

---

## 🎨 Identidad visual

| Elemento | Valor |
|-----------|-------|
| **Nombre:** | Loop4U |
| **Eslogan:** | “Recuerda todo, sin pensar en nada.” |
| **Icono:** | Bucle o ciclo ↻ estilizado |
| **Paleta:** | Azul (#3A76F0), verde menta (#53D1B0), violeta suave (#8C78F0), blanco, gris oscuro. |
| **Tipografía:** | Inter / Poppins (según disponibilidad) |
| **Estilo:** | Minimalista, moderno, calmado, enfocado en productividad y orden mental. |

---

## 🧭 Roadmap de desarrollo

| Fase | Descripción | Resultado esperado |
|------|--------------|--------------------|
| **1️⃣ Setup** | Estructura Angular + Tailwind + Firebase + Capacitor | Proyecto base funcional |
| **2️⃣ Core App** | CRUD de recordatorios y categorías | Gestión básica operativa |
| **3️⃣ Notificaciones** | Push y locales (Android/iOS/web) | Recordatorios automáticos |
| **4️⃣ UI/UX** | Dashboard, modo oscuro, diseño responsive | Experiencia fluida |
| **5️⃣ Auth & Sync** | Login + Firestore sincronizado | Sesiones y persistencia |
| **6️⃣ Testing & QA** | Unit, E2E, rendimiento | App estable |
| **7️⃣ Mobile Build** | Generación y pruebas en dispositivos reales | Apps nativas listas |
| **8️⃣ Publicación** | Play Store / App Store | Lanzamiento oficial |
| **9️⃣ Extras** | IA sugerencias, exportación .ics, widgets | Versión premium / V2 |

---

## 🔒 Privacidad y permisos

- Permisos mínimos: notificaciones, almacenamiento local.  
- Política de privacidad y pantalla de consentimiento inicial.  
- Sin recopilación de datos sensibles sin autorización.  
- Cumple con **GDPR** y **App Store Privacy Guidelines**.

---

## 🧰 Herramientas complementarias

- **Figma** → prototipado UI/UX.  
- **Postman** → pruebas de endpoints (si se usa backend Node).  
- **ESLint + Prettier** → formateo y linting automático.  
- **Git + GitHub Projects** → gestión de issues y roadmap.  

---

## 💡 Razones del stack elegido

| Tecnología | Justificación clave |
|-------------|----------------------|
| **Angular** | Estructura modular, TypeScript, ideal para apps medianas-grandes. |
| **Tailwind** | Diseño rápido y limpio; coherencia visual sin sobrecarga CSS. |
| **Capacitor** | Permite un solo código para Android/iOS/Web con plugins nativos. |
| **Firebase** | Backend sin servidor, sincronización real-time y notificaciones integradas. |
| **GitHub Actions** | Automatización de builds multiplataforma. |
| **Vercel/Firebase Hosting** | Despliegue web inmediato con CDN global. |

---

## 🚀 Resultado final

- Aplicación móvil **Loop4U** publicada en:
  - **Google Play Store** (Android App Bundle, firmado).  
  - **Apple App Store** (a través de Xcode + TestFlight).  
- **Versión web** funcional como PWA (instalable desde navegador).  
- **Código abierto o privado** alojado en GitHub con CI/CD.  
- **Experiencia unificada:** una sola base de código, múltiples plataformas, sin perder rendimiento ni diseño.

---

## 📄 Licencia y mantenimiento

- Código bajo licencia MIT (opcional).  
- Mantenimiento semestral de dependencias y APIs.  
- Posibilidad de versión premium o suscripción B2B para técnicos o empresas.

---

**Loop4U**  
> *“Recuerda todo, sin pensar en nada.”*  
© 2025 — Proyecto de desarrollo completo con Angular + Capacitor + Firebase.
```

## pROXIMAS IDEAS

- Validar entradas de color y mostrar una paleta predefinida para evitar errores tipográficos.
- Acciones rápidas en Dashboard (marcar como completado, pausar).
- AL DARLE A UN DÍA EN EL CALENDARIO TIENE QUE HACER UN SUTIL SCROLL  HACIA DEBAJO PARA PODER VER LOS RECORDATORIOS DE ESE DÍA Y SI NO HAY NINGUNO PERMITIRTE CREARLO
- - QUE  AL SELECCIONAR PRIORIDAD EN EL FORM DE CREAR O MODIFICAR SE VEA EL SEMÁFORO DE COLOR QUE SE VE EN LA CARD
- ¿Quieres que también cierre al pulsar Escape y que navegue por teclado (arriba/abajo/Enter)? Puedo añadir accesibilidad de teclado.
- - - Acciones rápidas en LA EDICION DE UN RECORDATORIO O TAREA LA OPCION DE PAUSAR pausar) POR DEFECTO INDEFINIDA Y CON POSIBILIDAD DE SELECCIONAR UN PERIODO DE TIEMPO EN FORMATO, 1 DÍA, , SEMANA, 1 MES, O AS. (esTO ESTÁ IMPLEMENTRADO LA MITAD

- Cambia el nombre del botonm de inicio abajo a dashboard
- añadir imágenes  de todos los tamaños en assets



---
- e usemos también el color de la categoría para un sutil fondo de las tarjetas (p. ej., bg-<color>/5) o una “pill” detrás del icono, o lo dejamos solo como banda lateral por ahora????????????