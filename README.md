# United Languages

Sistema de reservación de clases de idiomas con PWA para alumnos/maestros y panel web de administración.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| App (alumnos/maestros) | React + Vite + Tailwind CSS (PWA) |
| Panel admin | React + Vite + Tailwind CSS |
| Auth | JWT en localStorage |

---

## Requisitos previos

- Node.js 18+
- PostgreSQL corriendo localmente
- npm 9+

---

## Instalación

```bash
# 1. Instalar dependencias de los tres proyectos
cd backend && npm install
cd ../app    && npm install --legacy-peer-deps
cd ../admin  && npm install
```

---

## Base de datos

```bash
# Crea la BD, corre el schema y el seed de horarios
cd backend
npm run db:migrate
```

Crea la base `united_languages` con las tablas `users`, `horarios`, `reservaciones` y `maestro_horarios`, y carga los 40 horarios de la semana.

### Variables de entorno (`backend/.env`)

```env
DATABASE_URL=postgresql://localhost:5432/united_languages
JWT_SECRET=your_secret_key_here
PORT=3001
```

---

## Levantar el proyecto

Abre tres terminales:

```bash
# Terminal 1 — Backend (puerto 3001)
cd backend
node src/index.js

# Terminal 2 — App alumnos/maestros (puerto 5173)
cd app
npx vite --host 0.0.0.0 --port 5173

# Terminal 3 — Panel admin (puerto 5174)
cd admin
npx vite --host 0.0.0.0 --port 5174
```

| Servicio | URL |
|---|---|
| App (alumnos/maestros) | http://localhost:5173 |
| Panel admin | http://localhost:5174 |
| Backend API | http://localhost:3001 |

---

## Usuarios de prueba

| Rol | Número | Contraseña |
|---|---|---|
| Alumno | `A001` | `test123` |
| Maestro | `M001` | `maestro123` |
| Admin | `ADMIN01` | `admin123` |

> Los usuarios de prueba se crean con `npm run db:migrate` — están incluidos en el seed.
> Para crearlo manualmente, ver la sección de scripts de seed más abajo.

---

## Funcionalidades

### App — Alumno (`http://localhost:5173`)

- **Login** con número de alumno y contraseña; sesión persistida en localStorage
- **Reservar**: muestra los horarios disponibles del día siguiente con cupo real (máx. 8 por hora)
- **Mis clases**: lista de reservaciones próximas e historial
- **Perfil**: datos completos y cerrar sesión
- Límite de 6 horas por semana (lunes–domingo), con barra de progreso visual
- PWA instalable en móvil: `standalone`, `theme_color: #C0161A`

### App — Maestro (`http://localhost:5173`)

- Mismo login; el sistema detecta el rol y muestra la vista de maestro
- **Clases de hoy**: horarios asignados con lista expandible de alumnos inscritos (nombre, número, nivel)

### Panel Admin (`http://localhost:5174`)

- **Dashboard**: reservaciones del día, total alumnos y maestros
- **Alumnos**: tabla completa + formulario inline para dar de alta nuevos alumnos
- **Maestros**: tabla + formulario de alta
- **Reservaciones**: selector de fecha, horarios del día con barra de ocupación y tabla de alumnos

---

## API — Resumen de endpoints

```
POST /api/auth/login                     Login (todos los roles)
GET  /api/usuarios/perfil                Perfil del usuario autenticado

GET  /api/reservaciones/disponibilidad?fecha=YYYY-MM-DD   Cupo por horario
POST /api/reservaciones                  Crear reservación (solo alumno)
GET  /api/reservaciones/mis-clases       Mis reservaciones
GET  /api/reservaciones/horas-semana     Contador semanal

GET  /api/maestro/clases-hoy             Horarios + alumnos del día (maestro)

GET  /api/admin/dashboard                Estadísticas generales
GET  /api/admin/alumnos                  Lista de alumnos
POST /api/admin/alumnos                  Crear alumno
GET  /api/admin/maestros                 Lista de maestros
POST /api/admin/maestros                 Crear maestro
GET  /api/admin/reservaciones?fecha=     Reservaciones por fecha
```

---

## Reglas de negocio

1. Los alumnos solo pueden reservar para el día siguiente (no el mismo día)
2. Máximo **8 alumnos** por horario — validado en el backend
3. Máximo **6 horas por semana** (lunes 00:00 → domingo 23:59)
4. Si el límite semanal está agotado, el botón Reservar queda bloqueado
5. El rol se detecta al hacer login y redirige a la vista correspondiente
6. Un alumno no puede acceder a rutas de maestro o admin (y viceversa)

---

## Estructura del proyecto

```
united-languages/
  backend/
    src/
      controllers/      authController, reservacionesController,
                        maestroController, adminController
      middleware/        auth.js (JWT + requireRol)
      routes/            auth, reservaciones, usuarios, maestro, admin
      db/                client.js, schema.sql, seed.sql, migrate.js
    .env
    package.json

  app/                  PWA alumnos / maestros
    src/
      api/              client.js
      hooks/            useAuth.jsx
      components/       BottomNav, BottomNavMaestro
      pages/            Login, Reservar, MisClases, Perfil
      pages/maestro/    ClasesHoy
    public/icons/       icon-192.svg, icon-512.svg, icon-maskable.svg

  admin/                Panel web administración
    src/
      api/              client.js
      hooks/            useAuth.jsx
      components/       Sidebar, Layout
      pages/            Login, Dashboard, Alumnos, Maestros, Reservaciones
```

---

## Colores

| Token | Valor |
|---|---|
| Rojo principal | `#C0161A` |
| Blanco | `#FFFFFF` |
| Fondo | `#F8F8F8` |
