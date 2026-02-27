/**
 * UserList component displays all available users for chat.
 * Highlights the currently selected user.
 */
export default function UserList({ users, selectedUser, onSelectUser }) {
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Users</h2>
      <div style={styles.userList}>
        {users.length === 0 ? (
          <p style={styles.emptyMessage}>No other users available</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              style={{
                ...styles.userItem,
                ...(selectedUser?.id === user.id ? styles.selectedUser : {}),
              }}
            >
              <div style={styles.avatar}>{user.username.charAt(0).toUpperCase()}</div>
              <span style={styles.username}>{user.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '280px',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: '20px',
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
  },
  userList: {
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
    padding: '10px',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    transition: 'background-color 0.2s',
    border: '1px solid #e0e0e0',
  },
  selectedUser: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2196f3',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: '12px',
  },
  username: {
    fontSize: '15px',
    fontWeight: '500',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    marginTop: '20px',
  },
};
