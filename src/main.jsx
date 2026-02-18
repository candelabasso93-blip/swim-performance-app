import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AttendanceProvider } from './context/AttendanceContext';
import { TimeProvider } from './context/TimeContext';
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <TimeProvider>
        <AttendanceProvider>
          <App />
        </AttendanceProvider>
      </TimeProvider>
    </UserProvider>
  </React.StrictMode>,
);
