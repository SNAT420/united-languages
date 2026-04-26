# United Languages — Especificación técnica completa

## 1. Stack tecnológico
- Frontend (app): React + Vite (PWA)
- Panel admin: React + Vite (web)
- Backend: Node.js + Express
- Base de datos: PostgreSQL
- Autenticación: JWT (guardado en localStorage)
- Estilos: Tailwind CSS

## 2. Tipos de usuario

### Alumno (app móvil / PWA)
- Login con número de alumno + contraseña, sesión guardada en dispositivo
- Solo puede reservar para el día siguiente (no el mismo día)
- Máximo 8 alumnos por hora
- Máximo 6 horas por semana (reinicia cada lunes a las 00:00)
- Si agota sus 6 horas, no puede reservar más esa semana
- Si un horario está lleno (8/8), aparece como No disponible

### Maestro (app móvil / PWA)
- Mismo login que alumno, el sistema detecta su rol y muestra pantalla diferente
- Ve el día actual con sus horarios asignados y lista de alumnos por hora
- No gestiona horarios desde la app

### Administrador (panel web)
- Da de alta alumnos y maestros
- Ve reservaciones del día

## 3. Base de datos

### Tabla users
- id UUID primary key
- nombre VARCHAR(100)
- correo VARCHAR(100) unique
- numero_alumno VARCHAR(20) unique nullable
- password_hash VARCHAR(255)
- nivel ENUM inicial/intermedio/avanzado nullable
- rol ENUM alumno/maestro/admin
- activo BOOLEAN default true
- created_at TIMESTAMP

### Tabla horarios
- id UUID primary key
- dia_semana ENUM lunes/martes/miercoles/jueves/viernes/sabado
- hora_inicio TIME
- hora_fin TIME

### Tabla reservaciones
- id UUID primary key
- alumno_id UUID FK users
- horario_id UUID FK horarios
- fecha DATE
- created_at TIMESTAMP
- UNIQUE(alumno_id, fecha, horario_id)

### Tabla maestro_horarios
- id UUID primary key
- maestro_id UUID FK users
- horario_id UUID FK horarios

## 4. Horarios disponibles (seed)

Lunes a viernes mañana: 7-8, 8-9, 9-10
Lunes a viernes tarde: 16-17, 17-18, 18-19, 19-20
Sabado: 7-8, 8-9, 9-10, 10-11, 11-12
Domingo: sin clases

## 5. Endpoints API

POST /api/auth/login — body: numero_alumno, password — response: token, user con rol
GET /api/reservaciones/disponibilidad?fecha=YYYY-MM-DD
POST /api/reservaciones — body: horario_id, fecha
GET /api/reservaciones/mis-clases
GET /api/reservaciones/horas-semana
GET /api/usuarios/perfil
GET /api/maestro/clases-hoy
POST /api/admin/alumnos
POST /api/admin/maestros
GET /api/admin/reservaciones?fecha=YYYY-MM-DD
GET /api/admin/alumnos
GET /api/admin/maestros

## 6. Pantallas app alumno

1. Login: logo United Languages, campo numero_alumno, campo password, boton iniciar sesion
2. Inicio: nombre y numero alumno arriba, tarjeta con dia siguiente, indicador horas semana
3. Horarios: slots por hora con cupos, boton Reservar o badge No disponible
4. Mis reservaciones: clases activas e historial
5. Perfil: datos completos, boton cerrar sesion
- Bottom nav: Reservar / Mis clases / Perfil

## 7. Pantallas app maestro

1. Clases de hoy: fecha actual, horarios del dia, lista de alumnos por hora
2. Perfil
- Bottom nav: Hoy / Perfil

## 8. Panel admin

- Login
- Dashboard: reservaciones hoy, total alumnos, total maestros
- Alumnos: tabla + formulario alta (nombre, correo, nivel, numero_alumno, password)
- Maestros: tabla + formulario alta (nombre, correo, password)
- Reservaciones: selector fecha, horarios con alumnos inscritos

## 9. Diseño visual

- Colores: Rojo #C0161A y blanco #FFFFFF, fondo gris claro #F8F8F8
- Logo United Languages en pantalla de login
- Estilo limpio y minimalista

## 10. Reglas de negocio

1. Reservar siempre para fecha = hoy + 1 dia
2. Limite semanal: contar reservaciones lunes a domingo, bloquear si >= 6
3. Cupo maximo 8 por hora, validar en backend
4. JWT en localStorage, si hay token valido saltar login
5. El rol viene en el response del login, renderizar pantalla correspondiente

## 11. Estructura de carpetas

united-languages/
  backend/
    src/routes/ controllers/ middleware/ models/ db/
    .env
    package.json
  app/
    src/pages/ components/ hooks/ api/
    package.json
  admin/
    src/pages/ components/ api/
    package.json

## 12. Variables de entorno

DATABASE_URL=postgresql://localhost:5432/united_languages
JWT_SECRET=your_secret_key_here
PORT=3001

## 13. Orden de desarrollo

1. Setup del proyecto tres carpetas con dependencias
2. Base de datos: tablas y seed de horarios
3. Backend: auth y endpoints de alumno
4. App frontend: login, reservar, mis clases, perfil
5. Backend: endpoints de maestro
6. App frontend: vista maestro
7. Backend: endpoints de admin
8. Panel admin completo
9. PWA: manifest y service worker
10. Pruebas y ajustes
