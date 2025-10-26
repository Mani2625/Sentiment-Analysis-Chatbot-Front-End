// src/components/ChatWindow.jsx
import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import styles from './ChatWindow.module.css'; // Import CSS Modules

const initialMessages = [
  { id: 1, sender: 'Bot', text: 'Hello! I am a Sentiment Analysis Chatbot. Type a message and I will analyze the emotion.', sentiment: null },
];

const ChatWindow = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading/disabling button
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const API_URL = 'http://127.0.0.1:5000/api/chat'; 
    
    const tempId = Date.now();
    const newMessage = { id: tempId, sender: 'User', text: userMessage, sentiment: 'Analyzing...' };
    
    // 1. Add User Message and start loading
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // src/components/ChatWindow.jsx (Updated handleSendMessage function)

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const CLOUD_RUN_API_URL = "https://flask-gemini-backend-210161969755.us-central1.run.app/generate"; // <--- YOUR LIVE ENDPOINT!
    
    const tempId = Date.now();
    const newMessage = { id: tempId, sender: 'User', text: userMessage, sentiment: 'Analyzing...' };
    
    // 1. Add User Message and start loading
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
        // Send the message to your live Cloud Run API
        const response = await fetch(CLOUD_RUN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }), // Send user message
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 2. Update User Message with real Sentiment and Emoji
        setMessages(prev => 
            prev.map(msg => 
                msg.id === tempId 
                    ? { ...msg, 
                        // **NOTE:** Ensure these field names match your Python backend's JSON keys!
                        sentiment: data.sentiment,
                        sentimentEmoji: data.sentiment_emoji 
                      } 
                    : msg
            )
        );

        // 3. Add Bot Response
        const botResponse = { 
            id: Date.now() + 1, 
            sender: 'Bot', 
            text: data.chatbot_response, // Use the LLM's conversational response
            sentiment: null 
        };
        setMessages(prev => [...prev, botResponse]);

    } catch (error) {
        console.error("Cloud API Error:", error);
        // Display generic error to the user
        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'Bot',
            text: `Connection failed: Could not reach the live API. Check browser console.`,
            sentiment: 'ERROR'
        }]);
        // Update user message status to ERROR
        setMessages(prev => 
            prev.map(msg => 
                msg.id === tempId ? { ...msg, sentiment: 'ERROR' } : msg
            )
        );

    } finally {
        setIsLoading(false); 
    }
  };
  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        Sentiment Chatbot 💬
      </div>
      
      {/* Chat History Area */}
      <div className={styles.chatHistory}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Analyzing response..." : "Type your message here..."}
          className={styles.chatInput}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Wait...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
