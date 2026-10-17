from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments
from datasets import load_dataset

MODEL_NAME = "PlanTL-GOB-ES/gpt2-base-bne"  # Modelo base
OUTPUT_DIR = "../models/guion-model"        # Carpeta donde se guardará el modelo

# 1️⃣ Cargar dataset
dataset = load_dataset("json", data_files={"train": "../data/train.jsonl", "validation": "../data/valid.jsonl"})

# 2️⃣ Tokenizador
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=True)
tokenizer.pad_token = tokenizer.eos_token  # Necesario para GPT2

def tokenize(batch):
    return tokenizer(batch["text"], truncation=True, padding="max_length", max_length=256)

dataset_tokenized = dataset.map(tokenize, batched=True, remove_columns=["text"])

# 3️⃣ Modelo
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
model.resize_token_embeddings(len(tokenizer))

# 4️⃣ Parámetros de entrenamiento
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    overwrite_output_dir=True,
    evaluation_strategy="epoch",
    learning_rate=5e-5,
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,
    num_train_epochs=3,
    save_total_limit=2,
    logging_steps=100,
    weight_decay=0.01,
    warmup_steps=50,
    save_strategy="epoch",
    fp16=False,  # pon True si usas GPU con soporte FP16
)

# 5️⃣ Entrenamiento
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset_tokenized["train"],
    eval_dataset=dataset_tokenized["validation"],
)

trainer.train()

# 6️⃣ Guardar modelo y tokenizador
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)