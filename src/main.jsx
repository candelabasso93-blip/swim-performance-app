import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AttendanceProvider } from './context/AttendanceContext';
import { LanguageProvider } from './context/LanguageContext';
import { TimeProvider } from './context/TimeContext';
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <TimeProvider>
        <AttendanceProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </AttendanceProvider>
      </TimeProvider>
    </UserProvider>
  </React.StrictMode>,
);
