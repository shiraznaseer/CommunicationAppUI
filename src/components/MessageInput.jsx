import { useState } from 'react';

/**
 * MessageInput component for typing and sending messages.
 * Handles Enter key for quick sending.
 */
export default function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? 'Select a user to start chatting' : 'Type a message...'}
        disabled={disabled}
        style={styles.input}
      />
      <button onClick={handleSend} disabled={disabled || !message.trim()} style={styles.button}>
        Send
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    padding: '16px 20px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px 28px',
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
