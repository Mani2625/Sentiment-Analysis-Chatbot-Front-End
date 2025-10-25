// src/components/MessageBubble.jsx
import React from 'react';
import styles from './MessageBubble.module.css'; // Import CSS Modules

const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'Bot';
  const { text, sentiment, sender } = message;

  // 1. Determine the main container class (for alignment)
  const containerClass = isBot ? styles.botContainer : styles.userContainer;
  
  // 2. Determine the bubble style based on sender
  let bubbleClass = isBot ? styles.botMessage : styles.userMessage;

  // 3. Add sentiment color class for user messages
  if (!isBot && sentiment) {
    if (sentiment === 'Positive') {
      bubbleClass += ` ${styles.positive}`;
    } else if (sentiment === 'Negative') {
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
            Sentiment: {sentiment}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;