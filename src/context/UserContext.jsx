import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const UserContext = createContext(null);

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setUsers(readStorage(USERS_KEY, []));
    setCurrentUser(readStorage(CURRENT_USER_KEY, null));
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      return;
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  }, [currentUser]);

  const registerUser = (userData) => {
    const exists = users.some((user) => user.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email already registered.' };
    }

    const user = {
      email: userData.email,
      password: userData.password,
      role: userData.role,
      gender: userData.role === 'swimmer' ? userData.gender : null,
      category: userData.role === 'swimmer' ? userData.category : null,
    };

    setUsers((prev) => [...prev, user]);
    return { success: true, message: 'User created successfully.' };
  };

  const loginUser = (email, password) => {
    const foundUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
    );

    if (!foundUser) {
      return { success: false, message: 'Invalid credentials.' };
    }

    setCurrentUser(foundUser);
    return { success: true, user: foundUser };
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({ users, currentUser, registerUser, loginUser, logoutUser }),
    [users, currentUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

export default UserContext;
