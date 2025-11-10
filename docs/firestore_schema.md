# Esquema Firestore — Loop4U

Objetivo: definir las colecciones, campos, validaciones y patrones de consulta para que el frontend pueda desarrollarse con mínima fricción y sin cambios posteriores mayores.

## Rutas y colecciones

- `users/{uid}`
  - `reminders/{id}` — recordatorios del usuario
  - `categories/{id}` — categorías personalizadas del usuario
  - `settings` (doc) — preferencias del usuario (opcional en MVP)

Notas:
- Todo dato es “scoped” por usuario. No hay colecciones globales en MVP.
- Se usa `request.auth.uid` como `uid` y se replica en `ownerId` por validación y trazabilidad.

## Modelos de datos

### Reminder (`users/{uid}/reminders/{id}`)

Campos obligatorios y tipos:
- `title: string` (1–140)
- `timezone: string` (IANA, p. ej. "Europe/Madrid")
- `startDate: Timestamp` (UTC)
- `timeOfDay: string` (formato "HH:mm")
- `recurrence: { frequency: 'daily'|'weekly'|'monthly'|'yearly', interval: number >=1, byDay?: string[], byMonthDay?: number }`
- `leadTimes: Array<{ unit: 'minute'|'hour'|'day'|'week', value: number >=1 }>` (0–5 elementos)
- `status: 'active'|'paused'|'archived'`
- `priority: 'low'|'med'|'high'`
- `nextOccurrence: Timestamp` (UTC)
- `ownerId: string` (= `uid`)
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

Campos opcionales:
- `notes?: string` (0–2000)
- `categoryId?: string`
- `endDate?: Timestamp`
- `lastCompletedAt?: Timestamp`
- `history?: Array<{ action: 'completed'|'skipped'|'snoozed', at: Timestamp }>` (mantener últimas 50)

Restricciones recomendadas:
- `byDay` usa abreviaturas iCal: `['MO','TU','WE','TH','FR','SA','SU']`.
- Si `frequency==='monthly'`: usar `byMonthDay` (1–31) o `byDay` con regla “enésimo día” (manejado en cliente).
- `leadTimes` no duplicados; normalizar por `{unit,value}`.
- `title` y `notes` saneados de espacios extra y con límites de longitud.

### Category (`users/{uid}/categories/{id}`)
- `name: string` (1–60)
- `emoji: string` (ej. "🩺")
- `color: string` (token/paleta Tailwind, ej. "emerald-500")
- `sortOrder: number` (para ordenar en UI)
- `ownerId: string`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

### Settings (`users/{uid}/settings`)
- `timezone: string` (IANA)
- `locale: 'es-ES'|'en-US'|string`
- `notificationsEnabled: boolean`
- `defaultLeadTimes: Array<{unit:'minute'|'hour'|'day'|'week', value:number}>`

## Índices (composer necesarios)

Subcolecciones bajo `users/{uid}` necesitan índices compuestos para consultas combinadas:
- `reminders`: `status ASC, nextOccurrence ASC`
- `reminders`: `categoryId ASC, nextOccurrence ASC` (si se filtra por categoría)

## Reglas de seguridad (borrador)

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isUser(uid) { return request.auth != null && request.auth.uid == uid; }
    function isEnum(v, allowed) { return allowed.hasAny([v]); }

    match /users/{uid} {
      allow read: if isUser(uid);

      match /reminders/{id} {
        allow create: if isUser(uid) &&
          request.resource.data.ownerId == uid &&
          request.resource.data.createdAt == request.time &&
          request.resource.data.updatedAt == request.time &&
          request.resource.data.title.size() > 0 && request.resource.data.title.size() <= 140 &&
          isEnum(request.resource.data.status, ['active','paused','archived']) &&
          isEnum(request.resource.data.priority, ['low','med','high']);

        allow update: if isUser(uid) &&
          resource.data.ownerId == uid && request.resource.data.ownerId == uid &&
          request.resource.data.createdAt == resource.data.createdAt &&
          request.resource.data.updatedAt == request.time &&
          request.resource.data.title.size() > 0 && request.resource.data.title.size() <= 140;

        allow delete: if isUser(uid) && resource.data.ownerId == uid;

        allow get, list: if isUser(uid);
      }

      match /categories/{id} {
        allow create: if isUser(uid) &&
          request.resource.data.ownerId == uid &&
          request.resource.data.createdAt == request.time &&
          request.resource.data.updatedAt == request.time;
        allow update, delete, get, list: if isUser(uid) && resource.data.ownerId == uid;
      }

      match /settings { allow read, write: if isUser(uid); }
    }
  }
}
```

Notas:
- Las reglas verifican ownership y campos básicos. Añade validaciones extra (longitudes, enums, tamaños de arrays) según avance.
- En Firestore, las reglas no “asignan” campos; solo validan. El cliente debe enviar `createdAt/updatedAt` con `serverTimestamp()`.

## Contratos TypeScript (frontend)

```ts
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type LeadUnit = 'minute' | 'hour' | 'day' | 'week';

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval: number; // >=1
  byDay?: ('MO'|'TU'|'WE'|'TH'|'FR'|'SA'|'SU')[];
  byMonthDay?: number; // 1..31
}

export interface LeadTime { unit: LeadUnit; value: number; }

export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  categoryId?: string;
  timezone: string; // IANA
  startDate: string; // ISO o Timestamp serializado
  endDate?: string;
  timeOfDay: string; // "HH:mm"
  recurrence: Recurrence;
  leadTimes: LeadTime[];
  priority: 'low'|'med'|'high';
  status: 'active'|'paused'|'archived';
  lastCompletedAt?: string;
  nextOccurrence: string;
  history?: { action: 'completed'|'skipped'|'snoozed'; at: string; }[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sortOrder: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
```

Notas:
- En runtime, Firestore usa `Timestamp`; en el cliente se pueden mapear a ISO strings.
- `id` proviene del `doc.id` de Firestore.

## Patrones de consulta (frontend)

Próximos recordatorios (activos):
```ts
// path: users/${uid}/reminders
query(
  collection(firestore, `users/${uid}/reminders`),
  where('status','==','active'),
  where('nextOccurrence','>=', serverTimestamp()),
  orderBy('nextOccurrence','asc'),
  limit(50)
)
```

Atrasados (activos):
```ts
query(
  collection(firestore, `users/${uid}/reminders`),
  where('status','==','active'),
  where('nextOccurrence','<', serverTimestamp()),
  orderBy('nextOccurrence','asc'),
  limit(50)
)
```

Por categoría (activos, próximos):
```ts
query(
  collection(firestore, `users/${uid}/reminders`),
  where('status','==','active'),
  where('categoryId','==', categoryId),
  orderBy('nextOccurrence','asc'),
  limit(50)
)
```

## Reglas de negocio (cliente)

- Calcular y actualizar `nextOccurrence` en cada alta/edición/completado.
- Programar notificaciones locales de las próximas N ocurrencias; reprogramar en app resume/boot.
- Mantener `history` recortado (p. ej., últimas 50 entradas) para evitar documentos grandes.
- Usar `serverTimestamp()` para `createdAt/updatedAt` y validar en reglas.

## Consideraciones futuras

- Si `history` crece, migrar a subcolección `history/` por reminder.
- Si aparecen reglas complejas de recurrencia, considerar `RRULE` y validación adicional.
- Añadir índices por `priority` si se usa en filtros.
- Cloud Functions + Scheduler para backup de push notifications (enfoque híbrido).

