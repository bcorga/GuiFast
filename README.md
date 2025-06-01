# GuiFast
Proyecto de tesis UPC - Creación de una plataforma que genera guiones cortos, mediante el uso e implementación de IA. 

🧠 Resumen Técnico de la Plataforma Web de Generación de Guiones
🔧 1. Propósito General
La plataforma permite a los usuarios registrarse, generar guiones personalizados con IA, editarlos, guardarlos, descargarlos en varios formatos (PDF, DOC, TXT) y marcarlos como favoritos. Además, permite la gestión del perfil de usuario y roles dinámicos desde una interfaz tipo dashboard.
________________________________________
🏗️ 2. Arquitectura General
El sistema sigue una arquitectura modular de microservicios, desplegada con Docker y orquestada con docker-compose. Se compone de tres servicios principales:
•	Frontend (Next.js + React)
•	Backend API (Node.js + Express + Sequelize)
•	Servicio IA (Python + Transformers)
•	Base de datos: PostgreSQL
________________________________________
🌐 3. Frontend (Next.js con React y TailwindCSS)
•	Desarrollado con Next.js (React SSR) para tener renderizado rápido del lado del servidor.
•	Estilizado con Tailwind CSS.
•	Componentes reutilizables como Sidebar, GuionList, ScriptEditor, ProfileSettings.
•	Manejo del estado con useState y useEffect.
•	Manejo de autenticación mediante JWT (almacenado en localStorage).
•	Descarga de guiones en formatos: .pdf (jspdf), .txt (Blob), .doc (Blob).
•	Página dashboard con 4 vistas dinámicas:
o	Mis Guiones
o	Mis Favoritos
o	Nuevo Guion
o	Mi Perfil (edición de nombre/avatar)
________________________________________
🚀 4. Backend (Node.js con Express + Sequelize)
•	API RESTful en Express escuchando en localhost:5000.
•	Conexión con PostgreSQL mediante Sequelize ORM.
•	Funcionalidades implementadas:
o	Registro e inicio de sesión de usuarios con validación de email y contraseña hasheada (bcrypt).
o	Modelo de roles dinámicos con tabla roles, asociados a usuarios.
o	Endpoints para CRUD de guiones:
	Crear / Actualizar / Eliminar
	Marcar / Desmarcar como favorito
	Obtener por usuario y por favoritos
o	Endpoints para actualizar el perfil (username, avatar).
•	Arquitectura desacoplada: controladores (authController.js, etc.) y rutas (scripts.js, auth.js) separadas.
________________________________________
🤖 5. Microservicio de IA (Python + Transformers + Flask)
•	Servidor Flask expuesto en localhost:8000.
•	Modelo base: distilgpt2 de Hugging Face, entrenado con fine-tuning en guiones estructurados en español (formato .jsonl).
•	Usa transformers.pipeline con text-generation para generar el texto.
•	Recibe parámetros prompt, tone, estilo y devuelve un guion estructurado.
•	Tokenización y generación controlada con max_length, truncamiento y padding.
________________________________________
🧱 6. Base de Datos (PostgreSQL 15)
•	Contenedor postgres definido en docker-compose.
•	Esquema:
o	users: username, email, password_hash, avatar, roleId
o	roles: nombre de roles dinámicos (Admin, Usuario, etc.)
o	scripts: título, contenido, estilo, esFavorito, userId (relación con users)
•	Integridad garantizada con claves foráneas y validaciones Sequelize.
________________________________________
🐳 7. Orquestación y Docker
•	docker-compose.yml levanta todos los servicios:
o	frontend (puerto 3000)
o	backend (puerto 5000)
o	model (puerto 8000)
o	database (puerto 5432)
•	Contenedores con volumenes persistentes (e.g., postgres_data).
________________________________________
🔐 8. Seguridad y Sesiones
•	Contraseñas hasheadas con bcrypt.
•	JWT opcional para sesiones persistentes (almacenado en localStorage).
•	Restricción de accesos a funciones según estado de login.
•	Protección de rutas backend con validaciones.
________________________________________
⚙️ 9. Funcionalidades Adicionales
•	Panel de usuario personalizado (/dashboard) con sidebar dinámico.
•	Filtrado por estilo de guión.
•	Vista rápida de guiones con previsualización.
•	Componentes para edición y guardado de guiones sobre el mismo ID (PUT).
•	Favoritos persistentes en DB.



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


