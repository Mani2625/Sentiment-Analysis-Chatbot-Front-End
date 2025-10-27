// src/components/MessageBubble.jsx (Revised)
import React from 'react';
import styles from './MessageBubble.module.css'; // Import CSS Modules

const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'Bot';
  // 💡 NEW: Destructure sentimentEmoji from the message object
  const { text, sentiment, sender, sentimentEmoji } = message; 

  // 1. Determine the main container class (for alignment)
  const containerClass = isBot ? styles.botContainer : styles.userContainer;
  
  // 2. Determine the bubble style based on sender
  let bubbleClass = isBot ? styles.botMessage : styles.userMessage;

  // 3. Add sentiment color class for user messages
  if (!isBot && sentiment) {
    if (sentiment === 'POSITIVE') { // Ensure POSITIVE is capitalized to match backend
      bubbleClass += ` ${styles.positive}`;
    } else if (sentiment === 'NEGATIVE') { // Ensure NEGATIVE is capitalized
      bubbleClass += ` ${styles.negative}`;
    } else if (sentiment === 'Analyzing...') {
        bubbleClass += ` ${styles.analyzing}`;
    }
  }

  return (
    <div className={`${styles.messageContainer} ${containerClass}`}>
      <div className={`${styles.messageBubble} ${bubbleClass}`}>
        <p className={styles.senderLabel}>
            {sender}
        </p>
        <p>{text}</p>
        
        {/* Display sentiment for user messages only */}
        {!isBot && sentiment && (
          <span className={styles.sentimentLabel}>
            {/* 💡 NEW: Render the emoji before the label */}
            {sentimentEmoji} Sentiment: {sentiment}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;