import { useMemo, useState } from 'react';
import Badge from '../components/Badge';
import Card from '../components/Card';
import CaimanesLogo from '../components/CaimanesLogo';
import FiftyRankingTab from '../components/FiftyRankingTab';
import PerformanceChart from '../components/PerformanceChart';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SectionTitle from '../components/SectionTitle';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

const styles = ['LIBRE', 'ESPALDA', 'PECHO', 'MARIPOSA'];
const distances = ['50', '100', '200'];


const labels = {
  en: {
    profile: 'Swimmer Profile',
    logout: 'Logout',
    myPanel: 'My panel',
    feedbackSaved: 'Time saved successfully.',
  },
  es: {
    profile: 'Perfil del nadador',
    logout: 'Cerrar sesión',
    myPanel: 'Mi panel',
    feedbackSaved: 'Marca guardada correctamente.',
  },
};

function SwimmerDashboard({
  currentUser,
  users,
  times,
  addTime,
  removeTime,
  messages,
  alerts,
  attendanceRecords,
  getSwimmerAttendanceSummary,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('panel');
  const [form, setForm] = useState({
    style: styles[0],
    distance: distances[0],
    time: '',
    tournamentDate: new Date().toISOString().slice(0, 10),
  });
  const [feedback, setFeedback] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { language } = useLanguage();
  const t = labels[language] || labels.en;

  const swimmerTimes = useMemo(
    () =>
      times
        .map((entry, index) => ({ ...entry, index }))
        .filter((entry) => entry.swimmerEmail === currentUser.email),
    [times, currentUser.email],
  );

  const swimmerMessages = useMemo(
    () => messages.filter((message) => message.to === currentUser.email),
    [messages, currentUser.email],
  );

  const swimmerAlerts = useMemo(
    () => alerts.filter((alert) => alert.swimmerEmail === currentUser.email).slice(0, 4),
    [alerts, currentUser.email],
  );

  const attendanceSummary = useMemo(
    () => getSwimmerAttendanceSummary(currentUser.email),
    [getSwimmerAttendanceSummary, currentUser.email, attendanceRecords],
  );

  const latestMessage = useMemo(() => {
    if (!swimmerMessages.length) return null;
    return [...swimmerMessages].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [swimmerMessages]);

  const bestEvent = useMemo(() => {
    if (!swimmerTimes.length) return null;
    return swimmerTimes.reduce((best, item) => (item.timeInMs < best.timeInMs ? item : best), swimmerTimes[0]);
  }, [swimmerTimes]);

  const stats = useMemo(
    () => ({
      totalSwims: swimmerTimes.length,
      achievedReferences: swimmerTimes.filter((entry) => entry.achievedReference).length,
    }),
    [swimmerTimes],
  );

  const chartsByEvent = useMemo(() => {
    const grouped = swimmerTimes.reduce((acc, entry) => {
      const key = `${entry.style}-${entry.distance}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([key, entries]) => ({ key, entries }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [swimmerTimes]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = addTime(form, currentUser);
    if (!result.success) {
      setFeedback(result.message);
      return;
    }

    setFeedback(t.feedbackSaved);
    setForm((prev) => ({ ...prev, time: '' }));
  };

  return (
    <section style={{ display: 'grid', gap: '0.9rem' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <CaimanesLogo size={76} />
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{t.profile}</p>
              <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', wordBreak: 'break-word' }}>{currentUser.email}</h2>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            <LanguageToggle />
            <SecondaryButton onClick={onLogout} style={{ width: 'auto', padding: '0.55rem 0.9rem' }}>
              {t.logout}
            </SecondaryButton>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <SecondaryButton
            onClick={() => setActiveTab('panel')}
            style={activeTab === 'panel' ? { borderColor: '#1d4ed8', color: '#1d4ed8', backgroundColor: '#eff6ff' } : {}}
          >
            {t.myPanel}
          </SecondaryButton>
          <SecondaryButton
            onClick={() => setActiveTab('ranking50')}
            style={activeTab === 'ranking50' ? { borderColor: '#1d4ed8', color: '#1d4ed8', backgroundColor: '#eff6ff' } : {}}
          >
            Ranking 50m
          </SecondaryButton>
        </div>
      </Card>

      {activeTab === 'ranking50' ? (
        <FiftyRankingTab times={times} users={users} mode="swimmer" currentUserEmail={currentUser.email} />
      ) : (
        <>
          <Card style={{ backgroundColor: '#ecfeff', border: '1px solid #a5f3fc' }}>
            <SectionTitle title="Coach Feedback" subtitle="Latest guidance from your coach" />
            {latestMessage ? (
              <>
                <p style={{ margin: 0, color: '#0f172a' }}>{latestMessage.text}</p>
                <p style={{ margin: '0.45rem 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                  {new Date(latestMessage.date).toLocaleString()}
                </p>
              </>
            ) : (
              <p style={{ margin: 0, color: '#64748b' }}>No messages yet.</p>
            )}
            {swimmerMessages.length > 1 && (
              <SecondaryButton
                onClick={() => setShowHistory((prev) => !prev)}
                style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}
              >
                {showHistory ? 'Hide history' : 'Show history'}
              </SecondaryButton>
            )}
            {showHistory && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0', display: 'grid', gap: '0.5rem' }}>
                {[...swimmerMessages]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((message) => (
                    <li key={message.id} style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '0.6rem' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{message.text}</p>
                      <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.72rem' }}>
                        {new Date(message.date).toLocaleString()}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </Card>

          <Card style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
            <SectionTitle title="Alertas automáticas" subtitle="Mejoras detectadas en tus tiempos" />
            {swimmerAlerts.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>Aún no hay alertas de mejora. ¡Sigue registrando marcas!</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
                {swimmerAlerts.map((alert) => (
                  <li key={alert.id} style={{ fontSize: '0.85rem' }}>
                    ✅ {alert.text}
                  </li>
                ))}
              </ul>
            )}
          </Card>


          <Card>
            <SectionTitle title="Asistencia" subtitle="Resumen de entrenamientos" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
              <p style={{ margin: 0, fontSize: '0.86rem' }}>Presentes: <strong>{attendanceSummary.present}</strong></p>
              <p style={{ margin: 0, fontSize: '0.86rem' }}>Tardanzas: <strong>{attendanceSummary.late}</strong></p>
              <p style={{ margin: 0, fontSize: '0.86rem' }}>Ausencias: <strong>{attendanceSummary.absent}</strong></p>
              <p style={{ margin: 0, fontSize: '0.86rem' }}>Índice: <strong>{attendanceSummary.attendanceRate}%</strong></p>
            </div>
          </Card>

          <Card style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white' }}>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.82rem' }}>Top Event</p>
            {bestEvent ? (
              <>
                <h3 style={{ margin: '0.25rem 0 0.3rem', fontSize: '1.05rem' }}>
                  {bestEvent.style} {bestEvent.distance}m
                </h3>
                <p style={{ margin: 0, fontSize: '1.85rem', fontWeight: 700 }}>{bestEvent.time}</p>
              </>
            ) : (
              <p style={{ margin: '0.25rem 0 0', fontSize: '1rem' }}>Add your first swim to see your top event.</p>
            )}
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Card>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Total swims</p>
              <p style={{ margin: '0.3rem 0 0', fontSize: '1.35rem', fontWeight: 700 }}>{stats.totalSwims}</p>
            </Card>
            <Card>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Achieved references</p>
              <p style={{ margin: '0.3rem 0 0', fontSize: '1.35rem', fontWeight: 700 }}>{stats.achievedReferences}</p>
            </Card>
          </div>

          <Card>
            <SectionTitle title="Add Swim Time" subtitle="Use format mm:ss.xx" />
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.6rem' }}>
              <label htmlFor="style" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                Style
                <select
                  id="style"
                  value={form.style}
                  onChange={(event) => setForm((prev) => ({ ...prev, style: event.target.value }))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                >
                  {styles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="distance" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                Distance
                <select
                  id="distance"
                  value={form.distance}
                  onChange={(event) => setForm((prev) => ({ ...prev, distance: event.target.value }))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                >
                  {distances.map((distance) => (
                    <option key={distance} value={distance}>
                      {distance}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="time" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                Time
                <input
                  id="time"
                  type="text"
                  placeholder="01:12.45"
                  value={form.time}
                  onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                  required
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem' }}
                />
              </label>

              <label htmlFor="tournamentDate" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                Tournament date
                <input
                  id="tournamentDate"
                  type="date"
                  value={form.tournamentDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, tournamentDate: event.target.value }))}
                  required
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem' }}
                />
              </label>

              <PrimaryButton type="submit">Save Swim</PrimaryButton>
            </form>
            {feedback && <p style={{ margin: '0.65rem 0 0', color: '#0369a1', fontSize: '0.85rem' }}>{feedback}</p>}
          </Card>

          <Card>
            <SectionTitle title="Performance by Event" subtitle="Y: Time • X: Tournament dates" />
            {chartsByEvent.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>No chart data yet. Add swims to generate event charts.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {chartsByEvent.map((eventGroup) => (
                  <PerformanceChart
                    key={eventGroup.key}
                    title={eventGroup.key.replace('-', ' ')}
                    data={eventGroup.entries}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle title="Logbook" subtitle="Your recorded events" />
            {swimmerTimes.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>No swims recorded yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.55rem' }}>
                {swimmerTimes.map((entry) => (
                  <li
                    key={`${entry.swimmerEmail}-${entry.index}-${entry.style}-${entry.distance}-${entry.time}`}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '0.7rem',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          {entry.style} {entry.distance}m
                        </p>
                        <p style={{ margin: '0.15rem 0 0', color: '#334155', fontSize: '0.9rem' }}>{entry.time}</p>
                        <p style={{ margin: '0.15rem 0 0', color: '#64748b', fontSize: '0.78rem' }}>
                          {new Date(entry.tournamentDate || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTime(entry.index)}
                        style={{
                          border: 'none',
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                        aria-label="Delete time"
                      >
                        ×
                      </button>
                    </div>
                    {entry.achievedReference && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <Badge>Reference Achieved</Badge>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </section>
  );
}

export default SwimmerDashboard;
