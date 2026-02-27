# Communication App UI

Vite + React UI for a real-time communication/chat application.

## Tech Stack

- React
- Vite
- React Router
- Axios
- SignalR (`@microsoft/signalr`)

## Backend API

- Swagger: https://appcommunication.musasoftservices.com/swagger/index.html
- REST Base URL (used by the UI): https://appcommunication.musasoftservices.com/api
- SignalR Hub URL (used by the UI): https://appcommunication.musasoftservices.com/hubs/chat

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

## Project Structure

```text
CommunicationAppUI/
  public/
    vite.svg
  src/
    assets/
    components/
      ChatWindow.jsx
      ConnectionStatus.jsx
      MessageInput.jsx
      ProtectedRoute.jsx
      UserList.jsx
    pages/
      Chat.jsx
      Login.jsx
      Register.jsx
    services/
      api.js
      authService.js
      chatService.js
      userService.js
    App.jsx
    App.css
    main.jsx
    index.css
  index.html
  vite.config.js
  package.json
```

### Install

```bash
npm install
```

### Run (Development)

```bash
npm run dev
```

Vite will print the local dev URL in the terminal (typically `http://localhost:5173`).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration (API URLs)

This project currently uses hardcoded backend URLs:

- REST API base URL: `src/services/api.js` (`API_BASE_URL`)
- SignalR hub URL: `src/services/chatService.js` (`.withUrl(...)`)

If you need to point the UI to a different environment (dev/staging/prod), update those values accordingly.

## App Routes

- `/login` - Login
- `/register` - Register
- `/chat` - Chat (protected)
