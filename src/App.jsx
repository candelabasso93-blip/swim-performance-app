import { useEffect, useState } from 'react';
import { useAttendance } from './context/AttendanceContext';
import { useUser } from './context/UserContext';
import { useTime } from './context/TimeContext';
import CoachDashboard from './pages/CoachDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SwimmerDashboard from './pages/SwimmerDashboard';

function App() {
  const { users, currentUser, registerUser, loginUser, logoutUser } = useUser();
  const { times, addTime, removeTime, messages, sendMessage, alerts, getPredictionsForSwimmer } = useTime();
  const { records: attendanceRecords, addAttendance, getSwimmerAttendanceSummary } = useAttendance();
  const [page, setPage] = useState('home');

  useEffect(() => {
    if (!currentUser) {
      if (page === 'swimmerDashboard' || page === 'coachDashboard') {
        setPage('home');
      }
      return;
    }

    if (currentUser.role === 'swimmer' && page !== 'swimmerDashboard') {
      setPage('swimmerDashboard');
      return;
    }

    if (currentUser.role === 'coach' && page !== 'coachDashboard') {
      setPage('coachDashboard');
    }
  }, [currentUser, page]);

  const handleLogout = () => {
    logoutUser();
    setPage('home');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem 0.75rem',
        background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {page === 'home' && <Home onNavigate={setPage} currentUser={currentUser} />}
        {page === 'register' && <Register registerUser={registerUser} onNavigate={setPage} />}
        {page === 'login' && <Login loginUser={loginUser} onNavigate={setPage} />}
        {page === 'swimmerDashboard' && currentUser?.role === 'swimmer' && (
          <SwimmerDashboard
            currentUser={currentUser}
            users={users}
            times={times}
            addTime={addTime}
            removeTime={removeTime}
            messages={messages}
            alerts={alerts}
            attendanceRecords={attendanceRecords}
            getSwimmerAttendanceSummary={getSwimmerAttendanceSummary}
            onLogout={handleLogout}
          />
        )}
        {page === 'coachDashboard' && currentUser?.role === 'coach' && (
          <CoachDashboard
            currentUser={currentUser}
            users={users}
            times={times}
            messages={messages}
            sendMessage={sendMessage}
            getPredictionsForSwimmer={getPredictionsForSwimmer}
            attendanceRecords={attendanceRecords}
            addAttendance={addAttendance}
            onLogout={handleLogout}
          />
        )}
      </div>
    </main>
  );
}

export default App;
