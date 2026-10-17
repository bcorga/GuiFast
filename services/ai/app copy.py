from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Ruta al modelo fine-tuneado con tu dataset de 200 ejemplos
MODEL_PATH = "guion-model"  # Ajusta si está en otra carpeta

# Cargar tokenizer y modelo
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
model = AutoModelForCausalLM.from_pretrained(MODEL_PATH)
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

# Función para limpiar repeticiones largas
def limpiar_repeticiones(texto):
    lineas = texto.split("\n")
    unicas = []
    for linea in lineas:
        if len(unicas) == 0 or linea.strip() != unicas[-1].strip():
            unicas.append(linea.strip())
    # Máximo 20 líneas
    return "\n".join(unicas[:20])

# Endpoint principal
@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    prompt = data.get("prompt", "").strip()
    tono = data.get("tone", "neutral")
    estilo = data.get("estilo", "general")

    if len(prompt) < 5:
        return jsonify({"error": "Prompt demasiado corto"}), 400

    # Construir prompt para el modelo
    estructura_prompt = f"[estilo: {estilo}][tono: {tono}]\n[TÍTULO] {prompt}\n"

    try:
        result = generator(
        estructura_prompt,
        max_length=180,
        do_sample=True,
        temperature=0.6,         # menos aleatorio
        top_k=40,
        top_p=0.85,
        repetition_penalty=1.5,  # evita ruido y repeticiones
        num_return_sequences=1
        )

        texto_generado = result[0]["generated_text"]
        guion_limpio = limpiar_repeticiones(texto_generado)

        return jsonify({
            "generated_text": guion_limpio
        })

    except Exception as e:
        return jsonify({
            "error": str(e),
            "prompt_usado": estructura_prompt
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)