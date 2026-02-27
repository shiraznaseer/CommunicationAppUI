import { useEffect, useRef } from 'react';

/**
 * ChatWindow component displays the conversation with selected user.
 * Auto-scrolls to bottom when new messages arrive.
 */
export default function ChatWindow({ selectedUser, messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div style={styles.emptyState}>
        <h3>Welcome to Communicator</h3>
        <p>Select a user from the list to start chatting</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatar}>{selectedUser.username.charAt(0).toUpperCase()}</div>
        <div>
          <h3 style={styles.username}>{selectedUser.username}</h3>
          <p style={styles.status}>Online</p>
        </div>
      </div>
      
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <p style={styles.noMessages}>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => {
            const isSent = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: isSent ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(isSent ? styles.sentMessage : styles.receivedMessage),
                  }}
                >
                  <p style={styles.messageContent}>{message.content}</p>
                  <span style={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    minHeight: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
  },
  avatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#2196f3',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: '12px',
    fontSize: '18px',
  },
  username: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  status: {
    margin: 0,
    fontSize: '13px',
    color: '#4caf50',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '12px',
  },
  messageBubble: {
    maxWidth: '60%',
    padding: '10px 14px',
    borderRadius: '12px',
    wordWrap: 'break-word',
  },
  sentMessage: {
    backgroundColor: '#2196f3',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  receivedMessage: {
    backgroundColor: '#fff',
    color: '#000',
    border: '1px solid #e0e0e0',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  timestamp: {
    fontSize: '11px',
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
  },
  noMessages: {
    textAlign: 'center',
    color: '#999',
    marginTop: '20px',
  },
};
