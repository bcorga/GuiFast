# Imagen base de Node.js para el frontend
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para la instalación inicial
COPY package.json package-lock.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código fuente
COPY . .

# Desactiva el chequeo ESLint si no lo usas aún
ENV NEXT_DISABLE_ESLINT=true

# Construye la aplicación para producción
RUN npm run build

# Expone el puerto que usa Next.js
EXPOSE 3000

# Comando para iniciar el servidor de desarrollo
CMD ["npm", "run", "dev"]