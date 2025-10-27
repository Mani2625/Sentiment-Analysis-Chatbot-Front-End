// src/components/ChatWindow.jsx
import { useEffect, useRef, useState } from 'react';
import styles from './ChatWindow.module.css'; // Import CSS Modules
import MessageBubble from './MessageBubble';

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
    const API_URL = 'http://127.0.0.1:8080/api/chat'; 
    
    const tempId = Date.now();
    const newMessage = { id: tempId, sender: 'User', text: userMessage, sentiment: 'Analyzing...' };
    
    // 1. Add User Message and start loading
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
        
        // 2. Update User Message with real Sentiment
        setMessages(prev => 
            prev.map(msg => 
                msg.id === tempId ? { ...msg, sentiment: data.sentiment } : msg
            )
        );

        // 3. Add Bot Response
        const botResponse = { 
            id: Date.now() + 1, 
            sender: 'Bot', 
            text: data.chatbot_response, 
            sentiment: null 
        };
        setMessages(prev => [...prev, botResponse]);

    } catch (error) {
        console.error("Chatbot API Error:", error);
        // Handle error by updating the 'Analyzing...' message
        setMessages(prev => 
            prev.map(msg => 
                msg.id === tempId ? { ...msg, sentiment: 'Error!' } : msg
            )
        );
        const errorBotResponse = {
            id: Date.now() + 1,
            sender: 'Bot',
            text: 'Connection failed. Please ensure the Python API server is running locally.',
            sentiment: null
        };
        setMessages(prev => [...prev, errorBotResponse]);
    } finally {
        setIsLoading(false); // Stop loading regardless of success/fail
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