from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from flask_cors import CORS  # Importa CORS

app = Flask(__name__)

# Permite solicitudes de cualquier origen (o de localhost:3000 específicamente)
CORS(app, origins=["http://localhost:3000"])

# Ruta local al modelo entrenado
MODEL_PATH = "guion-model"  # o "../modelos/guion-model" si lo tienes fuera del servicio

# Carga el modelo de generación de texto
#generator = pipeline("text-generation", model="gpt2")
#generator = pipeline("text-generation", model="bcorga/guion-spanish-gpt2-finetuned")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
model = AutoModelForCausalLM.from_pretrained(MODEL_PATH)
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)


# Limpieza post-generación para evitar repeticiones largas
def limpiar_repeticiones(texto):
    lineas = texto.split("\n")
    unicas = []
    for linea in lineas:
        if len(unicas) == 0 or linea.strip() != unicas[-1].strip():
            unicas.append(linea.strip())
    return "\n".join(unicas[:20])  # Máximo 20 líneas

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    prompt = data.get("prompt", "")
    tone = data.get("tone", "neutral")
    estilo = data.get("estilo", "general")  # Valor por defecto si no se envía

    # Construir prompt adaptado al estilo y tono
    estructura_prompt = f"[estilo: {estilo}]\n[TITULO] {prompt}\n[PERSONAJE] "

    if estilo == "comico":
        estructura_prompt += "Personaje:"
    elif estilo == "publicitario":
        estructura_prompt += "Locutor:"
    elif estilo == "narrativo":
        estructura_prompt += "Narrador:"
    elif estilo == "educativo":
        estructura_prompt += "Profesor:"
    else:
        estructura_prompt += ""

    try:
        result = generator(
            estructura_prompt,
            max_length=200,
            num_return_sequences=1,
            do_sample=True,
            temperature=0.7,
            top_k=50,
            top_p=0.9,
            repetition_penalty=1.2
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
    app.run(host="0.0.0.0", port=8000)