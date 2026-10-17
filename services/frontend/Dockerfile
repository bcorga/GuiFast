# Imagen base de Node.js para el frontend
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para la instalación inicial
COPY package.json ./
# Copiar configuración de Jest
COPY jest.config.cjs ./
COPY jest.setup.js ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código fuente
COPY . .

# Desactiva el chequeo ESLint si no lo usas aún
ENV NEXT_DISABLE_ESLINT=true

# 🚀 CONSTRUYE LA APLICACIÓN PARA PRODUCCIÓN (Activo para Railway)
RUN npm run build

# Expone el puerto que usa Next.js
EXPOSE 3000

# 🚀 COMANDO PARA INICIAR EL SERVIDOR EN PRODUCCIÓN (Activo para Railway)
CMD ["npm", "run", "start"]
