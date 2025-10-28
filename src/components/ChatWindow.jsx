// src/components/ChatWindow.jsx (Complete Code for Voice Integration)
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ChatWindow.module.css';
import MessageBubble from './MessageBubble'; // Assuming you use this
let selectedVoice = null;
const initialMessages = [
  { id: 1, sender: 'Bot', text: 'Hello! I am a Sentiment Analysis Chatbot. Type a message or click the microphone button to speak.', sentiment: null },
];

// --- Web Speech API Setup ---
// Check for browser compatibility
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = false; // Stop after a single phrase
    recognition.interimResults = false; // Only get final results
    recognition.lang = 'en-US'; // Set language
}
// ------------------------------

const ChatWindow = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // New state for voice
  const messagesEndRef = useRef(null);
  
  // NOTE: The backend URL must include the path /api/chat
  const API_URL = 'https://sentiment-analysis-chatbot-back-end-210161969755.asia-south1.run.app/api/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
        // Function to set the desired voice after they are loaded
        const setDesiredVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            
            // 💡 Customization Step: Change the voice name here
            // Common example names: 'Google UK English Female', 'Microsoft Zira - English (United States)'
            // Use window.speechSynthesis.getVoices() in your browser console to see options
            const desiredVoiceName = 'Google US English'; // You can change this name

            selectedVoice = voices.find(voice => 
                voice.name.includes(desiredVoiceName)
            ) || voices[0]; // Fallback to the first available voice
            
            if (selectedVoice) {
                console.log(`TTS Voice set to: ${selectedVoice.name}`);
            }
        };

        // Voices might not load immediately, so wait for the voiceschanged event
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = setDesiredVoice;
            setDesiredVoice(); // Try to set immediately in case they are already loaded
        }
    }, []);

    // Function to speak the bot's response (TTS)
    const speakResponse = useCallback((text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any current speech
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set the voice we selected in the useEffect hook
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            utterance.rate = 1.1; // Slightly faster for a bot feel
            utterance.pitch = 1.0; 

            window.speechSynthesis.speak(utterance);
        }
    }, []);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    const tempId = Date.now();
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
             // If response is not 200-299, throw error to catch block
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // 2. Update User Message with real Sentiment and Emoji
        setMessages(prev => 
            prev.map(msg => 
                msg.id === tempId 
                    ? { 
                        ...msg, 
                        sentiment: data.sentiment.toUpperCase(), 
                        sentimentEmoji: data.sentiment_emoji 
                      } 
                    : msg
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
        
        // Speak the response aloud (TTS)
        speakResponse(data.chatbot_response); 

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
            text: `API call failed. Details: ${error.message}. Check Cloud Run logs.`,
            sentiment: null
        };
        setMessages(prev => [...prev, errorBotResponse]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
        alert("Speech Recognition is not supported by your browser.");
        return;
    }

    if (isListening) {
        recognition.stop();
        setIsListening(false);
        return;
    }

    // Clear any previous input and start listening
    setInput(''); 
    setIsListening(true);
    recognition.start();

    // Event handler for when speech is recognized
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInput(spokenText);
      recognition.stop();
      setIsListening(false);

      // Programmatically submit the form once voice input is done
      // Use the logic directly here since we need the event object for preventDefault
      handleSendMessage({
          preventDefault: () => {}, 
          currentTarget: { name: 'submit' } 
      });
    };

    // Event handler for when listening stops naturally or due to error
    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        alert(`Voice Error: ${event.error}`);
    };
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        Sentiment Analysis Chatbot 🤖
      </header>
      
      <div className={styles.chatHistory}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputForm} onSubmit={handleSendMessage}>
        {/* New Microphone Button */}
        <button 
          type="button" 
          onClick={handleVoiceInput} 
          className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
          title={isListening ? "Stop Listening" : "Start Voice Input"}
          disabled={isLoading}
        >
          {isListening ? '🛑' : '🎙️'}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening... speak now" : "Type your message or use mic..."}
          className={styles.chatInput}
          disabled={isListening || isLoading}
        />

        <button
          type="submit" 
          className={styles.sendButton} 
          disabled={!input.trim() || isLoading || isListening}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;