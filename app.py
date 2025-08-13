from flask import Flask, request, jsonify, render_template, send_from_directory
from dotenv import load_dotenv
import os
from openai import OpenAI
import json

app = Flask(__name__)

# Initialize OpenAI client
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load environment variables from .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load knowledge base
with open('bakery_knowledge_base_fi.json', 'r', encoding='utf-8') as f:
    knowledge_base = json.load(f)

# Adding a comment for the git commit
def kb_to_text(kb):
    text = f"<p><strong>Aukioloajat:</strong> {kb['aukioloajat']}</p>"
    text += f"<p><strong>Osoite:</strong> {kb['osoite']}</p>"
    text += f"<p><strong>Yhteystiedot:</strong> puhelin {kb['yhteystiedot']['puhelin']}, sähköposti {kb['yhteystiedot']['sähköposti']}</p>"
    
    text += "<p><strong>Menu:</strong></p><ul>"
    for item in kb['menu']:
        text += f"<li><strong>{item['nimi']}</strong> - {item['hinta']}<br>"
        text += f"<span class='allergens'>Allergeenit: {', '.join(item['allergeenit'])}</span><br>"
        text += f"<span class='ingredients'>Ainekset: {', '.join(item['ainekset'])}</span></li>"
    text += "</ul>"
    
    text += f"<p><strong>Erikoistilaukset:</strong> {kb['erikoistilaukset']}</p>"
    text += f"<p><strong>Kausitarjous:</strong> {kb['kausitarjous']}</p>"
    text += f"<p><strong>Maksutavat:</strong> {', '.join(kb['maksutavat'])}</p>"
    text += f"<p><strong>Lisätietoja:</strong> {kb['lisätietoja']}</p>"
    
    return text


# Serve the frontend
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Chat endpoint
@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({"error": "Missing 'message'"}), 400

        system_prompt = (
            "Sinä olet Rakas Koti Leipomon chatbot. Vastaa aina ystävällisesti ja ammattimaisesti. "
            "Käytä alla olevaa tietopohjaa vastauksissasi:\n\n" + kb_to_text(knowledge_base)
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        # Create a chat completion with the new API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7
        )

        
        # Old (causes error)
        # answer = response.choices[0].message['content']

        # New (correct)
        answer = response.choices[0].message.content
        return jsonify({"reply": answer})

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
