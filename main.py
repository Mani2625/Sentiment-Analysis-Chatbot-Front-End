# main.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import pipeline
import pickle
from sklearn.linear_model import LogisticRegression # Placeholder import for local model

app = Flask(__name__)
CORS(app) # Keep CORS enabled for frontend communication

# --- Model Initialization ---

# 1. Hugging Face Pre-trained Model (for general sentiment classification)
# Using a common and lightweight sentiment model
try:
    hf_sentiment_pipeline = pipeline(
        "sentiment-analysis", 
        model="distilbert-base-uncased-finetuned-sst-2"
    )
    print("Hugging Face model loaded successfully.")
except Exception as e:
    print(f"Error loading Hugging Face model: {e}")
    hf_sentiment_pipeline = None

# 2. Local Fine-tuned Model (Simulated)
# In a real project, you would train and save this. Here we just load a dummy file.
try:
    with open('local_model.pkl', 'rb') as f:
        # Load your actual fine-tuned model here
        # local_model = pickle.load(f) 
        # For demonstration, we'll just set a flag
        local_model_ready = True 
    print("Local fine-tuned model file simulated successfully.")
except FileNotFoundError:
    local_model_ready = False
    print("WARNING: 'local_model.pkl' not found. Using Hugging Face model exclusively.")


# --- Sentiment Analysis and Response Generation ---

def analyze_sentiment(text):
    """
    Analyzes sentiment using the Hugging Face model (and potentially a local model).
    Returns (compound_label, response_emoji).
    """
    if hf_sentiment_pipeline is None:
        return "Neutral", "❓", "Model Error: HF pipeline failed to load."

    # Run analysis with Hugging Face model
    result = hf_sentiment_pipeline(text)[0]
    hf_label = result['label']
    hf_score = result['score']
    
    # 💡 Advanced Logic: Combine results (Simulation)
    # In a real scenario, you'd feed the text to the local model and ensemble the predictions.
    
    final_label = hf_label # Default to HF result

    if local_model_ready:
        # Placeholder for complex ensemble logic:
        # If HF is very certain (score > 0.98) and Local model agrees, boost confidence.
        # If HF is uncertain (score < 0.6) and Local model has a clear prediction, use local.
        pass # Actual logic would go here
    
    
    # Map label to emoji and acknowledgment
    if final_label == "POSITIVE" and hf_score > 0.9:
        emoji = "😊"
        acknowledgment = f"I acknowledge your input and it seems quite positive! "
    elif final_label == "POSITIVE":
        emoji = "🙂"
        acknowledgment = f"That's noted. I sense a generally positive tone. "
    elif final_label == "NEGATIVE" and hf_score > 0.9:
        emoji = "😭"
        acknowledgment = f"I apologize. Your message is strongly negative. "
    elif final_label == "NEGATIVE":
        emoji = "🙁"
        acknowledgment = f"I've noted the negative sentiment in your message. "
    else: # Default/Ambiguous/Neutral
        emoji = "😐"
        acknowledgment = f"Understood. Your message appears neutral. "
    
    
    chatbot_response = (
        f"{acknowledgment} ({emoji} Confidence: {hf_score:.2f}). "
        f"How can I continue to assist you?"
    )

    return final_label, emoji, chatbot_response
AIzaSyDFw11sdgNWwBRX2luLiXEJbNtQgfVk5Bo

# --- Flask API Endpoint ---

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """ Handles the chat message request. """
    data = request.get_json(silent=True)
    
    if not data or 'message' not in data:
        return jsonify({'error': 'Invalid request. Missing "message" key.'}), 400
        
    user_message = data['message']

    # Analyze Sentiment
    sentiment_label, sentiment_emoji, bot_response = analyze_sentiment(user_message)

    # Return Final JSON Response
    return jsonify({
        'user_message': user_message,
        'sentiment': sentiment_label,
        'sentiment_emoji': sentiment_emoji, # New field for emoji
        'chatbot_response': bot_response
    })

# Run the server locally
if __name__ == '__main__':
    print("Starting dual-model Flask server on http://127.0.0.1:5000/api/chat")
    app.run(debug=True, port=5000)