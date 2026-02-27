/**
 * ConnectionStatus component displays the current SignalR connection state.
 * Shows different colors and messages based on connection status.
 */
export default function ConnectionStatus({ status }) {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { text: 'Connected', color: '#4caf50' };
      case 'connecting':
        return { text: 'Connecting...', color: '#ff9800' };
      case 'reconnecting':
        return { text: 'Reconnecting...', color: '#ff9800' };
      case 'disconnected':
        return { text: 'Disconnected', color: '#f44336' };
      case 'error':
        return { text: 'Connection Error', color: '#f44336' };
      default:
        return { text: 'Unknown', color: '#999' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={styles.container}>
      <div style={{ ...styles.indicator, backgroundColor: statusInfo.color }} />
      <span style={styles.text}>{statusInfo.text}</span>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  text: {
    fontSize: '12px',
    fontWeight: '500',
  },
};
