import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import sys

# Intentar cargar .env de forma segura sin romper el inicio en Railway
try:
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    load_dotenv(dotenv_path)
except Exception:
    print("⚠️ No se pudo cargar el archivo .env local (Normal en producción)")

app = Flask(__name__)

# Permite que tu frontend acceda al backend tanto en localhost como en producción
CORS(app, resources={r"/*": {"origins": "*"}})

# 1. DEFINICIÓN DEL MODO DE GENERACIÓN
GENERATOR_MODE = os.environ.get("GENERATOR_MODE", "OPENAI") 

# Variables globales para el modo LOCAL
tokenizer = None
model = None
GENERATOR = None

# 2. INICIALIZACIÓN CONDICIONAL OPTIMIZADA
if GENERATOR_MODE == 'LOCAL':
    print("🤖 Iniciando en modo LOCAL: Cargando modelo fine-tuneado...")
    # OPTIMIZACIÓN: Solo importamos librerías pesadas si realmente se va a usar el modo LOCAL
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    MODEL_PATH = "guion-model"
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
        model = AutoModelForCausalLM.from_pretrained(MODEL_PATH)
        GENERATOR = pipeline("text-generation", model=model, tokenizer=tokenizer)
    except Exception as e:
        print(f"❌ ERROR: No se pudo cargar el modelo local: {e}. Cambiando a modo OPENAI.")
        GENERATOR_MODE = 'OPENAI'
        
if GENERATOR_MODE == 'OPENAI':
    print("☁️ Iniciando en modo OPENAI: Cliente de API inicializado.")
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("⚠️ ALERTA CRÍTICA: OPENAI_API_KEY no encontrada en las variables de entorno.")
    OPENAI_CLIENT = OpenAI(api_key=api_key)

# Función para limpiar repeticiones (se mantiene)
def limpiar_repeticiones(texto):
    lineas = texto.split("\n")
    unicas = []
    for linea in lineas:
        if len(unicas) == 0 or linea.strip() != unicas[-1].strip():
            unicas.append(linea.strip())
    return "\n".join(unicas[:20])

# --- LÓGICA DE GENERACIÓN ---

def generate_local(estructura_prompt):
    """Llama a tu modelo fine-tuned de Hugging Face."""
    result = GENERATOR(
        estructura_prompt,
        max_length=250,
        do_sample=True,
        temperature=0.85, 
        top_k=50,
        top_p=0.95,
        repetition_penalty=5.0,
        num_return_sequences=1
    )
    return result[0]["generated_text"]

def generate_openai(prompt, tono, estilo):
    """Llama a la API de OpenAI."""
    system_prompt = f"Eres un creador de guiones profesional latinoamericano. Tu tarea es escribir un extracto de guion coherente y bien estructurado (con descripciones y diálogos). Estilo: {estilo}, Tono: {tono}."
    user_prompt = f"Tema/Título: {prompt}"

    response = OPENAI_CLIENT.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=800,
        temperature=0.7,
    )
    # CORRECCIÓN DEFINITIVA: Acceso correcto al índice [0] de las elecciones
    return response.choices[0].message.content


# Endpoint principal
@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    prompt = data.get("prompt", "").strip()
    tono = data.get("tone", "neutral")
    estilo = data.get("estilo", "general")

    if len(prompt) < 5:
        return jsonify({"error": "Prompt demasiado corto"}), 400

    estructura_prompt_header = f"[estilo: {estilo}][tono: {tono}]\n[TÍTULO] {prompt}\n"
    
    try:
        if GENERATOR_MODE == 'LOCAL':
            texto_generado = generate_local(estructura_prompt_header)
        elif GENERATOR_MODE == 'OPENAI':
            texto_generado = generate_openai(prompt, tono, estilo)

        guion_limpio = limpiar_repeticiones(texto_generado)

        return jsonify({
            "generated_text": estructura_prompt_header + "\n" + guion_limpio
        })

    except Exception as e:
        error_type = "Local Model Error" if GENERATOR_MODE == 'LOCAL' else "OpenAI API Error"
        return jsonify({
            "error": f"Error de generación ({error_type}): {str(e)}",
            "mode": GENERATOR_MODE,
            "prompt_usado": estructura_prompt_header
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
