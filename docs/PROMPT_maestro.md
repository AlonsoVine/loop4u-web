# 🧠 Prompt Maestro — Loop4U (Mobile-first + Publicación en Stores)

## 🎯 Objetivo

Construir **Loop4U**, un asistente de recordatorios recurrentes (salud, hogar, vehículo, facturas, seguros).  
Prioridad móvil (Android/iOS) con versión web secundaria.

**Entrega final**:  
- App publicada en **Play Store** y **App Store**  
- Web responsive funcional

---

## 📦 Alcance

- Crear / editar / eliminar recordatorios con **frecuencias personalizadas** y **avisos previos**
- Categorías (salud, hogar, vehículo, finanzas…) con **icono y color**
- **Notificaciones push y locales**
- Dashboard de eventos **próximos / atrasados** + vista de **calendario**
- **Modo oscuro / claro** y accesibilidad básica
- **Sync y login opcional** (Google / email)

---

## 🧱 Stack y Distribución

### Frontend
- Angular 18  
- Tailwind CSS (o Angular Material)

### Mobile
- Capacitor  
  Plugins: App, Local Notifications, Push/Firebase, Storage, Background Tasks (si procede)

### Backend / Base de Datos
- Firebase (Auth, Firestore)  
- Supabase + Node/Express (si se requiere lógica personalizada)

### CI/CD
- GitHub Actions  
  - Web: Vercel / Firebase Hosting  
  - Mobile: workflows de build Capacitor

---

## 🚀 Publicación

### Android
- AAB  
- Firma Play App Signing  
- Target SDK actual  
- Íconos adaptativos  
- Requisitos de privacidad

### iOS
- Xcode  
- Perfiles y certificados  
- App Store Connect  
- Requisitos de privacidad (ATT si aplica)

### Permisos
- Notificaciones  
- Calendario (opcional)  
- Background fetch (si se usa)

### Privacidad
- Política de privacidad  
- Pantalla de consentimiento (push / analytics)

---

## 🗺️ Roadmap (Breve)

### Fundaciones
- Repositorio  
- Angular + Tailwind  
- Arquitectura por features

### Dominio Core
- Modelo `Reminder`  
- CRUD  
- Reglas de validación  
- Categorías  
- i18n ES/EN

### Notificaciones
- Locales + Push (FCM / APNs)  
- Scheduling  
- Canales Android

### Persistencia
- Firestore / Supabase  
- Seguridad: rules / row-level

### UI/UX
- Dashboard  
- Calendario  
- Filtros  
- Accesibilidad  
- Dark mode

### Mobile Build
- Añadir iOS / Android con Capacitor  
- Íconos / splash  
- Testing en dispositivos

### Publicación
- Fichas de tienda  
- Políticas  
- Firmados  
- Beta interna / TestFlight  
- Release

### Extras
- Exportar a .ics / CSV  
- Sugerencias inteligentes  
- Widgets / Atajos

---

## 🤖 Lo que quiero del asistente

- Generar estructura inicial (Angular + Capacitor)  
- Scripts de build: `npm run android`, `npm run ios`, `npm run web`
- Crear componentes/pages base:  
  - `Dashboard`  
  - `ReminderList`  
  - `ReminderForm`  
  - `Settings`
- Implementar scheduling de notificaciones (local / push) con ejemplos
- Proveer archivos de configuración:  
  - Firebase  
  - `capacitor.config.ts`  
  - `app-store-privacy`
- Entregar checklists para publicación en Play Store y App Store
- Proponer mejoras de UX y rendimiento en cada iteración
