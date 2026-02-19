import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AttendanceContext = createContext(null);
const ATTENDANCE_KEY = 'attendanceRecords';

function readStorage(fallback) {
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AttendanceProvider({ children }) {
  const [records, setRecords] = useState(() => readStorage([]));

  useEffect(() => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  }, [records]);

  const addAttendance = ({ swimmerEmail, date, status, note }, currentUser) => {
    if (!currentUser || currentUser.role !== 'coach') {
      return { success: false, message: 'Only coaches can mark attendance.' };
    }
    if (!swimmerEmail || !date || !status) {
      return { success: false, message: 'Swimmer, date and status are required.' };
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      swimmerEmail,
      date,
      status,
      note: note?.trim() || '',
      markedBy: currentUser.email,
      createdAt: new Date().toISOString(),
    };

    setRecords((prev) => [entry, ...prev]);
    return { success: true };
  };

  const getSwimmerAttendanceSummary = (swimmerEmail) => {
    const items = records.filter((item) => item.swimmerEmail === swimmerEmail);
    const present = items.filter((item) => item.status === 'present').length;
    const late = items.filter((item) => item.status === 'late').length;
    const absent = items.filter((item) => item.status === 'absent').length;
    const total = items.length;
    const attendanceRate = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;

    return { total, present, late, absent, attendanceRate };
  };

  const value = useMemo(
    () => ({ records, addAttendance, getSwimmerAttendanceSummary }),
    [records],
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
}

export default AttendanceContext;
