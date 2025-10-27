// src/components/ChatWindow.jsx (Revised handleSendMessage)
import { useEffect, useRef, useState } from 'react';
import styles from './ChatWindow.module.css'; // Import CSS Modules

const initialMessages = [
  { id: 1, sender: 'Bot', text: 'Hello! I am a Sentiment Analysis Chatbot. Type a message and I will analyze the emotion.', sentiment: null },
];

const ChatWindow = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
<<<<<<< HEAD
    // 💡 CRITICAL: Replace with your LIVE Cloud Run URL once deployed!
    const API_URL = "https://sentiment-backend-api-210161969755.us-central1.run.app";
=======
    const API_URL = 'https://sentiment-backend-api-210161969755.asia-south1.run.app'; 
>>>>>>> eea71e27fbbda76ccff9ba77ac55af5ec5b77dfe
    
    const tempId = Date.now();
    // 💡 NEW: Prepare message object to receive the emoji field
    const newMessage = { id: tempId, sender: 'User', text: userMessage, sentiment: 'Analyzing...', sentimentEmoji: '' }; 
    
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 2. Update User Message with real Sentiment and Emoji
        setMessages(prev => 
            prev.map(msg => 
                msg.id === tempId 
                    ? { 
                        ...msg, 
                        sentiment: data.sentiment.toUpperCase(), // Ensure consistency (POSITIVE, NEGATIVE)
                        sentimentEmoji: data.sentiment_emoji // Capture the emoji
                      } 
                    : msg
            )
        );

        // 3. Add Bot Response
        const botResponse = { 
            id: Date.now() + 1, 
            sender: 'Bot', 
            text: data.chatbot_response, // Captures the full LLM conversational reply
            sentiment: null 
        };
        setMessages(prev => [...prev, botResponse]);

    } catch (error) {
        console.error("Chatbot API Error:", error);
        // Fallback for errors
        setMessages(prev => 
            prev.map(msg => 
                msg.id === tempId ? { ...msg, sentiment: 'ERROR', sentimentEmoji: '❌' } : msg
            )
        );
        const errorBotResponse = {
            id: Date.now() + 1,
            sender: 'Bot',
            text: 'Connection failed. Please ensure the backend API is running and the URL is correct.',
            sentiment: null
        };
        setMessages(prev => [...prev, errorBotResponse]);
    } finally {
        setIsLoading(false);
    }
  };

  // ... rest of the ChatWindow component (return statement) ...
  return (
    <div className={styles.chatContainer}>
      {/* ... */}
    </div>
  );
};

export default ChatWindow;
