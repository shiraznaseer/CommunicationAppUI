import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import ConnectionStatus from '../components/ConnectionStatus';

/**
 * Main Chat page component.
 * 
 * FEATURES:
 * - Displays list of all users
 * - Shows conversation with selected user
 * - Real-time message delivery via SignalR
 * - Offline message handling (messages queued and sent on reconnect)
 * - Connection status indicator
 * 
 * DESIGN DECISIONS:
 * - Messages organized by conversation (sender/receiver pair)
 * - Auto-loads conversation history when user is selected
 * - SignalR connection established on mount
 * - Cleanup on unmount to prevent memory leaks
 */
export default function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Connect to SignalR on mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Register handlers BEFORE connecting so we don't miss messages
        // that may be sent immediately after connection (e.g., offline delivery).
        const unsubscribers = [];
        unsubscribers.push(chatService.onMessageReceived(handleMessageReceived));
        unsubscribers.push(chatService.onMessageSent(handleMessageSent));
        unsubscribers.push(chatService.onConversationHistory(handleConversationHistory));
        unsubscribers.push(chatService.onConnectionStateChanged(setConnectionStatus));
        unsubscribers.push(chatService.onUserRegistered(handleUserRegistered));

        await chatService.connect(currentUser.token);
        setConnectionStatus(chatService.getConnectionState());

        return () => {
          unsubscribers.forEach((u) => u && u());
        };
      } catch (error) {
        console.error('Failed to connect to chat:', error);
        setConnectionStatus('error');
      }
    };

    let cleanupHandlers = null;
    initializeChat().then((cleanup) => {
      cleanupHandlers = cleanup;
    });

    // Cleanup on unmount
    return () => {
      if (cleanupHandlers) cleanupHandlers();
      chatService.disconnect();
    };
  }, [currentUser.token]);

  const handleUserRegistered = (user) => {
    if (!user) return;
    if (user.id === currentUser.userId) return;

    setUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });
  };

  // Load conversation when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadConversation(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const userList = await userService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadConversation = async (userId) => {
    setMessages([]); // Clear current messages
    await chatService.getConversation(userId);
  };

  const handleMessageReceived = (message) => {
    const activeUser = selectedUserRef.current;

    // Only add to current conversation if it's relevant
    if (
      activeUser &&
      (message.senderId === activeUser.id || message.receiverId === activeUser.id)
    ) {
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleMessageSent = (message) => {
    const activeUser = selectedUserRef.current;

    // Add sent message to current conversation
    if (activeUser && message.receiverId === activeUser.id) {
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleConversationHistory = (conversationMessages) => {
    setMessages(conversationMessages);
  };

  const handleSendMessage = async (content) => {
    if (!selectedUser) return;
    
    await chatService.sendMessage(selectedUser.id, content);
  };

  const handleLogout = () => {
    chatService.disconnect();
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Communicator</h1>
        <div style={styles.userInfo}>
          <span style={styles.currentUsername}>{currentUser.username}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <ConnectionStatus status={connectionStatus} />

      <div style={styles.chatContainer}>
        <UserList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
        
        <div style={styles.chatArea}>
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            currentUserId={currentUser.userId}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!selectedUser}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#2196f3',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  currentUsername: {
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    minHeight: 0,
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
};
