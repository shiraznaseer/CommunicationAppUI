import * as signalR from '@microsoft/signalr';

/**
 * SignalR chat service for real-time messaging.
 * 
 * FEATURES:
 * - Automatic reconnection on disconnect
 * - JWT authentication via query string
 * - Event-based message handling
 * - Offline message queue (messages sent while disconnected)
 * 
 * DESIGN DECISIONS:
 * - Connection state managed internally
 * - Callbacks registered for incoming messages
 * - Automatic retry on connection failure
 */

class ChatService {
  constructor() {
    this.connection = null;
    this.messageCallbacks = [];
    this.messageSentCallbacks = [];
    this.conversationHistoryCallbacks = [];
    this.connectionStateCallbacks = [];
    this.userRegisteredCallbacks = [];
    this.messageQueue = []; // Store messages while offline
  }

  /**
   * Initialize SignalR connection with JWT token.
   */
  async connect(token) {
    if (this.connection) {
      await this.disconnect();
    }

    // Build connection with JWT in query string (required for WebSocket auth)
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://appcommunication.musasoftservices.com/hubs/chat', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 30s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Register event handlers
    this.connection.on('ReceiveMessage', (message) => {
      this.messageCallbacks.forEach((callback) => callback(message));
    });

    this.connection.on('MessageSent', (message) => {
      this.messageSentCallbacks.forEach((callback) => callback(message));
    });

    this.connection.on('ConversationHistory', (messages) => {
      this.conversationHistoryCallbacks.forEach((callback) => callback(messages));
    });

    this.connection.on('UserRegistered', (user) => {
      this.userRegisteredCallbacks.forEach((callback) => callback(user));
    });

    this.connection.on('Error', (error) => {
      console.error('SignalR Error:', error);
    });

    // Connection state handlers
    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.notifyConnectionState('reconnecting');
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.notifyConnectionState('connected');
      // Send queued messages after reconnection
      this.flushMessageQueue();
    });

    this.connection.onclose(() => {
      console.log('SignalR connection closed');
      this.notifyConnectionState('disconnected');
    });

    try {
      await this.connection.start();
      console.log('SignalR connected');
      this.notifyConnectionState('connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
      this.notifyConnectionState('error');
      throw error;
    }
  }

  /**
   * Disconnect from SignalR hub.
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  /**
   * Send message to another user.
   * If offline, queue the message for later delivery.
   */
  async sendMessage(receiverId, content) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      // Queue message if not connected
      this.messageQueue.push({ receiverId, content });
      console.log('Message queued (offline):', { receiverId, content });
      return;
    }

    try {
      await this.connection.invoke('SendMessage', receiverId, content);
    } catch (error) {
      // If send fails, queue for retry
      this.messageQueue.push({ receiverId, content });
      console.error('Failed to send message, queued for retry:', error);
    }
  }

  /**
   * Request conversation history with another user.
   */
  async getConversation(otherUserId) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn('Cannot get conversation: not connected');
      return;
    }

    try {
      await this.connection.invoke('GetConversation', otherUserId);
    } catch (error) {
      console.error('Failed to get conversation:', error);
    }
  }

  /**
   * Send all queued messages (called after reconnection).
   */
  async flushMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`Sending ${this.messageQueue.length} queued messages...`);
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const { receiverId, content } of queue) {
      await this.sendMessage(receiverId, content);
    }
  }

  /**
   * Register callback for incoming messages.
   */
  onMessageReceived(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((c) => c !== callback);
    };
  }

  /**
   * Register callback for sent message confirmation.
   */
  onMessageSent(callback) {
    this.messageSentCallbacks.push(callback);
    return () => {
      this.messageSentCallbacks = this.messageSentCallbacks.filter((c) => c !== callback);
    };
  }

  /**
   * Register callback for conversation history.
   */
  onConversationHistory(callback) {
    this.conversationHistoryCallbacks.push(callback);
    return () => {
      this.conversationHistoryCallbacks = this.conversationHistoryCallbacks.filter((c) => c !== callback);
    };
  }

  /**
   * Register callback for connection state changes.
   */
  onConnectionStateChanged(callback) {
    this.connectionStateCallbacks.push(callback);
    return () => {
      this.connectionStateCallbacks = this.connectionStateCallbacks.filter((c) => c !== callback);
    };
  }

  /**
   * Register callback for user registration events.
   * Used to update the user list without polling.
   */
  onUserRegistered(callback) {
    this.userRegisteredCallbacks.push(callback);
    return () => {
      this.userRegisteredCallbacks = this.userRegisteredCallbacks.filter((c) => c !== callback);
    };
  }

  /**
   * Notify all connection state callbacks.
   */
  notifyConnectionState(state) {
    this.connectionStateCallbacks.forEach((callback) => callback(state));
  }

  /**
   * Get current connection state.
   */
  getConnectionState() {
    if (!this.connection) return 'disconnected';
    
    switch (this.connection.state) {
      case signalR.HubConnectionState.Connected:
        return 'connected';
      case signalR.HubConnectionState.Connecting:
        return 'connecting';
      case signalR.HubConnectionState.Reconnecting:
        return 'reconnecting';
      case signalR.HubConnectionState.Disconnected:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
