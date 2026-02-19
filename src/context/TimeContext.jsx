import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import referenceTimes from '../utils/referenceTimes';

const TimeContext = createContext(null);
const TIMES_KEY = 'swimmerTimes';
const MESSAGES_KEY = 'messages';
const ALERTS_KEY = 'improvementAlerts';


function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ensureRecordIds(records, prefix) {
  if (!Array.isArray(records)) return [];
  return records.map((record) => (record?.id ? record : { ...record, id: generateId(prefix) }));
}

function parseTimeToMs(timeValue) {
  const match = timeValue.trim().match(/^(\d+):(\d{2})(?:\.(\d{1,2}))?$/);
  if (!match) return null;

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const centiseconds = Number((match[3] ?? '0').padEnd(2, '0'));

  if (Number.isNaN(minutes) || Number.isNaN(seconds) || Number.isNaN(centiseconds) || seconds > 59) {
    return null;
  }

  return minutes * 60_000 + seconds * 1_000 + centiseconds * 10;
}

function formatMsToTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  const centiseconds = Math.floor((ms % 1000) / 10)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}.${centiseconds}`;
}

function readStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function calculateLinearPrediction(entries) {
  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => new Date(a.tournamentDate) - new Date(b.tournamentDate));
  const y = sorted.map((item) => item.timeInMs);
  const x = sorted.map((_, index) => index + 1);

  const n = x.length;
  const sumX = x.reduce((acc, value) => acc + value, 0);
  const sumY = y.reduce((acc, value) => acc + value, 0);
  const sumXY = x.reduce((acc, value, index) => acc + value * y[index], 0);
  const sumXX = x.reduce((acc, value) => acc + value * value, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const nextX = n + 1;
  const predictedTimeMs = Math.max(1, Math.round(intercept + slope * nextX));

  return {
    predictedTimeMs,
    predictedTime: formatMsToTime(predictedTimeMs),
    trend: slope < 0 ? 'improving' : slope > 0 ? 'slower' : 'stable',
  };
}

export function TimeProvider({ children }) {
  const [times, setTimes] = useState(() => ensureRecordIds(readStoredJson(TIMES_KEY, []), 'time'));
  const [messages, setMessages] = useState(() => ensureRecordIds(readStoredJson(MESSAGES_KEY, []), 'message'));
  const [alerts, setAlerts] = useState(() => ensureRecordIds(readStoredJson(ALERTS_KEY, []), 'alert'));

  useEffect(() => {
    localStorage.setItem(TIMES_KEY, JSON.stringify(times));
  }, [times]);
  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const addTime = ({ style, distance, time, tournamentDate }, currentUser) => {
    if (!currentUser || currentUser.role !== 'swimmer') {
      return { success: false, message: 'Only swimmers can add times.' };
    }

    const timeInMs = parseTimeToMs(time);
    if (timeInMs === null) {
      return { success: false, message: 'Invalid format. Use mm:ss.xx' };
    }

    const key = `${style}-${distance}-${currentUser.category}-${currentUser.gender}`;
    const reference = referenceTimes[key];
    const achievedReference = typeof reference === 'number' ? timeInMs <= reference : false;

    const entry = {
      id: generateId('time'),
      style,
      distance,
      time,
      timeInMs,
      tournamentDate: tournamentDate || new Date().toISOString().slice(0, 10),
      swimmerEmail: currentUser.email,
      achievedReference,
    };

    const previousBest = times.reduce((best, item) => {
      const isSameEvent =
        item.swimmerEmail === currentUser.email && item.style === style && item.distance === distance;

      if (!isSameEvent) return best;
      if (!best || item.timeInMs < best.timeInMs) return item;
      return best;
    }, null);

    if (previousBest && timeInMs < previousBest.timeInMs) {
      const improvementMs = previousBest.timeInMs - timeInMs;
      const alert = {
        id: generateId('alert'),
        swimmerEmail: currentUser.email,
        type: 'improvement',
        event: `${style} ${distance}m`,
        text: `¡Mejora detectada en ${style} ${distance}m! Bajaste ${formatMsToTime(improvementMs)}.`,
        improvementMs,
        date: new Date().toISOString(),
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 60));
    }

    setTimes((prev) => [...prev, entry]);
    return { success: true };
  };

  const removeTime = (timeId) => {
    if (!timeId) return;
    setTimes((prev) => prev.filter((entry) => entry.id !== timeId));
  };

  const sendMessage = (to, text) => {
    const normalizedText = text.trim();
    if (!to || !normalizedText) {
      return { success: false, message: 'Swimmer and message are required.' };
    }

    const message = {
      id: generateId('message'),
      from: 'coach',
      to,
      text: normalizedText,
      date: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    return { success: true };
  };

  const getPredictionsForSwimmer = (swimmerEmail) => {
    const swimmerEntries = times.filter((item) => item.swimmerEmail === swimmerEmail);
    const grouped = swimmerEntries.reduce((acc, item) => {
      const key = `${item.style}-${item.distance}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([eventKey, entries]) => {
        const prediction = calculateLinearPrediction(entries);
        if (!prediction) return null;

        const [style, distance] = eventKey.split('-');
        return {
          eventKey,
          style,
          distance,
          ...prediction,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.style.localeCompare(b.style) || Number(a.distance) - Number(b.distance));
  };

  const value = useMemo(
    () => ({
      times,
      addTime,
      removeTime,
      messages,
      sendMessage,
      alerts,
      getPredictionsForSwimmer,
    }),
    [times, messages, alerts],
  );

  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}

export function useTime() {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error('useTime must be used within TimeProvider');
  }
  return context;
}

export default TimeContext;
