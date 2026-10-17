from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

model_path = "../models/guion-model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)

generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

prompt = "[estilo: comico]\n[TÍTULO] Un hombre caminando por la ciudad\n"
result = generator(prompt, max_length=200, temperature=0.7, top_k=50, top_p=0.9, do_sample=True)

print(result[0]["generated_text"])