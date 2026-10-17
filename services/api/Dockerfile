# Imagen base de Node.js para el backend
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para la instalación inicial
COPY package.json package-lock.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código fuente
COPY . .

# Expone el puerto que usa el backend
EXPOSE 5000

# Comando para iniciar el servidor del backend
CMD ["node", "server.js"]