# Imagen base de Python para el modelo de IA
FROM python:3.9

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios para instalar dependencias
COPY requirements.txt ./

# Instala las dependencias especificadas en requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el código fuente
COPY . .

# Expone el puerto que usa el modelo de IA
EXPOSE 8000

# Comando para iniciar el servidor de Flask/FastAPI
CMD ["python", "app.py"]