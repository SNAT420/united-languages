CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE nivel_enum AS ENUM ('inicial', 'intermedio', 'avanzado');
CREATE TYPE rol_enum AS ENUM ('alumno', 'maestro', 'admin');
CREATE TYPE dia_enum AS ENUM ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado');

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(100) NOT NULL,
  correo          VARCHAR(100) UNIQUE NOT NULL,
  numero_alumno   VARCHAR(20) UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  nivel           nivel_enum,
  rol             rol_enum NOT NULL,
  activo          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS horarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana  dia_enum NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS reservaciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  horario_id  UUID NOT NULL REFERENCES horarios(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (alumno_id, fecha, horario_id)
);

CREATE TABLE IF NOT EXISTS maestro_horarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  horario_id  UUID NOT NULL REFERENCES horarios(id) ON DELETE CASCADE,
  nivel       nivel_enum
);
