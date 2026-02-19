import { useMemo, useState } from 'react';
import Card from '../components/Card';
import CaimanesLogo from '../components/CaimanesLogo';
import FiftyRankingTab from '../components/FiftyRankingTab';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SectionTitle from '../components/SectionTitle';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { buildMeetManagerCsv, downloadCsvFile } from '../utils/exportMeetManager';


const labels = {
  en: {
    panelTitle: 'Internal Coaching Panel',
    dashboard: 'Coach Dashboard',
    panelTab: 'Panel',
    logout: 'Logout',
  },
  es: {
    panelTitle: 'Panel interno del entrenador',
    dashboard: 'Panel de coach',
    panelTab: 'Panel',
    logout: 'Cerrar sesión',
  },
};

function CoachDashboard({
  currentUser,
  users,
  times,
  messages,
  sendMessage,
  getPredictionsForSwimmer,
  attendanceRecords,
  addAttendance,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('panel');
  const { language } = useLanguage();
  const t = labels[language] || labels.en;
  const swimmers = useMemo(() => users.filter((user) => user.role === 'swimmer'), [users]);
  const usersByEmail = useMemo(
    () => users.reduce((acc, user) => ({ ...acc, [user.email]: user }), {}),
    [users],
  );
  const qualifiedTimes = useMemo(() => times.filter((entry) => entry.achievedReference), [times]);
  const [selectedSwimmer, setSelectedSwimmer] = useState('');
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState('');

  const [attendanceForm, setAttendanceForm] = useState({
    swimmerEmail: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'present',
    note: '',
  });
  const [attendanceFeedback, setAttendanceFeedback] = useState('');

  const [exportFilters, setExportFilters] = useState({
    swimmerEmail: '',
    style: '',
    distance: '',
    onlyQualified: false,
    fromDate: '',
    toDate: '',
  });
  const [exportFeedback, setExportFeedback] = useState('');

  const rankingByEvent = useMemo(() => {
    const grouped = qualifiedTimes.reduce((acc, time) => {
      const key = `${time.style}-${time.distance}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(time);
      return acc;
    }, {});

    Object.keys(grouped).forEach((key) => {
      grouped[key] = grouped[key].sort((a, b) => a.timeInMs - b.timeInMs);
    });

    return grouped;
  }, [qualifiedTimes]);

  const groupedMessages = useMemo(() => {
    const coachMessages = messages.filter((message) => message.from === 'coach');
    return swimmers.map((swimmer) => ({
      swimmerEmail: swimmer.email,
      messages: coachMessages
        .filter((message) => message.to === swimmer.email)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    }));
  }, [messages, swimmers]);

  const selectedSwimmerPredictions = useMemo(() => {
    if (!selectedSwimmer) return [];
    return getPredictionsForSwimmer(selectedSwimmer);
  }, [selectedSwimmer, getPredictionsForSwimmer, times]);

  const recentAttendance = useMemo(() => attendanceRecords.slice(0, 12), [attendanceRecords]);

  const exportPreviewCount = useMemo(() => {
    return times.filter((entry) => {
      if (exportFilters.swimmerEmail && entry.swimmerEmail !== exportFilters.swimmerEmail) return false;
      if (exportFilters.style && entry.style !== exportFilters.style) return false;
      if (exportFilters.distance && entry.distance !== exportFilters.distance) return false;
      if (exportFilters.onlyQualified && !entry.achievedReference) return false;

      const entryDate = new Date(entry.tournamentDate || Date.now()).getTime();
      if (exportFilters.fromDate && entryDate < new Date(exportFilters.fromDate).getTime()) return false;
      if (exportFilters.toDate && entryDate > new Date(exportFilters.toDate).getTime()) return false;

      return true;
    }).length;
  }, [times, exportFilters]);

  const handleSendMessage = () => {
    const result = sendMessage(selectedSwimmer, text);
    if (!result.success) {
      setFeedback(result.message);
      return;
    }

    setFeedback('Message sent successfully.');
    setText('');
  };

  const handleAttendance = () => {
    const result = addAttendance(attendanceForm, currentUser);
    if (!result.success) {
      setAttendanceFeedback(result.message);
      return;
    }

    setAttendanceFeedback('Attendance saved.');
    setAttendanceForm((prev) => ({ ...prev, note: '' }));
  };

  const handleExport = () => {
    const csvContent = buildMeetManagerCsv(times, usersByEmail, exportFilters);
    const rowsCount = Math.max(csvContent.split('\n').length - 1, 0);

    if (rowsCount === 0) {
      setExportFeedback('No hay tiempos para exportar con esos filtros.');
      return;
    }

    const dateTag = new Date().toISOString().slice(0, 10);
    downloadCsvFile(`meetmanager_export_${dateTag}.csv`, csvContent);
    setExportFeedback(`Exportado correctamente (${rowsCount} filas).`);
  };

  return (
    <section style={{ display: 'grid', gap: '0.9rem' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <CaimanesLogo size={76} />
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{t.panelTitle}</p>
              <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem' }}>{t.dashboard}</h2>
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
            {t.panelTab}
          </SecondaryButton>
          <SecondaryButton
            onClick={() => setActiveTab('ranking50')}
            style={activeTab === 'ranking50' ? { borderColor: '#1d4ed8', color: '#1d4ed8', backgroundColor: '#eff6ff' } : {}}
          >
            Ranking 50m
          </SecondaryButton>
          <SecondaryButton
            onClick={() => setActiveTab('attendance')}
            style={activeTab === 'attendance' ? { borderColor: '#1d4ed8', color: '#1d4ed8', backgroundColor: '#eff6ff' } : {}}
          >
            Asistencia
          </SecondaryButton>
          <SecondaryButton
            onClick={() => setActiveTab('export')}
            style={activeTab === 'export' ? { borderColor: '#1d4ed8', color: '#1d4ed8', backgroundColor: '#eff6ff' } : {}}
          >
            Exportar
          </SecondaryButton>
        </div>
      </Card>

      {activeTab === 'ranking50' ? (
        <FiftyRankingTab times={times} users={users} mode="coach" currentUserEmail={null} />
      ) : activeTab === 'attendance' ? (
        <>
          <Card>
            <SectionTitle title="Registrar asistencia" subtitle="Control diario de entrenamiento" />
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              <label htmlFor="att-swimmer" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                Nadador
                <select
                  id="att-swimmer"
                  value={attendanceForm.swimmerEmail}
                  onChange={(event) => setAttendanceForm((prev) => ({ ...prev, swimmerEmail: event.target.value }))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                >
                  <option value="">Seleccionar...</option>
                  {swimmers.map((swimmer) => (
                    <option key={swimmer.email} value={swimmer.email}>
                      {swimmer.email}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="att-date" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                Fecha
                <input
                  id="att-date"
                  type="date"
                  value={attendanceForm.date}
                  onChange={(event) => setAttendanceForm((prev) => ({ ...prev, date: event.target.value }))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                />
              </label>

              <label htmlFor="att-status" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                Estado
                <select
                  id="att-status"
                  value={attendanceForm.status}
                  onChange={(event) => setAttendanceForm((prev) => ({ ...prev, status: event.target.value }))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                >
                  <option value="present">Presente</option>
                  <option value="late">Tardanza</option>
                  <option value="absent">Ausente</option>
                </select>
              </label>

              <label htmlFor="att-note" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                Nota
                <textarea
                  id="att-note"
                  rows={3}
                  value={attendanceForm.note}
                  onChange={(event) => setAttendanceForm((prev) => ({ ...prev, note: event.target.value }))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                />
              </label>

              <PrimaryButton onClick={handleAttendance}>Guardar asistencia</PrimaryButton>
              {attendanceFeedback && <p style={{ margin: 0, fontSize: '0.84rem', color: '#0369a1' }}>{attendanceFeedback}</p>}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Últimos registros" />
            {recentAttendance.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>Sin registros aún.</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.4rem' }}>
                {recentAttendance.map((entry) => (
                  <li key={entry.id} style={{ fontSize: '0.85rem' }}>
                    <strong>{entry.swimmerEmail}</strong> · {new Date(entry.date).toLocaleDateString()} · {entry.status}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : activeTab === 'export' ? (
        <>
          <Card>
            <SectionTitle title="Exportar tiempos" subtitle="CSV compatible para carga y trabajo en Meet Manager" />
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              <label htmlFor="exp-swimmer" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                Nadador (opcional)
                <select
                  id="exp-swimmer"
                  value={exportFilters.swimmerEmail}
                  onChange={(event) => setExportFilters((prev) => ({ ...prev, swimmerEmail: event.target.value }))}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                >
                  <option value="">Todos</option>
                  {swimmers.map((swimmer) => (
                    <option key={swimmer.email} value={swimmer.email}>
                      {swimmer.email}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                <label htmlFor="exp-style" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                  Estilo
                  <select
                    id="exp-style"
                    value={exportFilters.style}
                    onChange={(event) => setExportFilters((prev) => ({ ...prev, style: event.target.value }))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                  >
                    <option value="">Todos</option>
                    <option value="LIBRE">LIBRE</option>
                    <option value="ESPALDA">ESPALDA</option>
                    <option value="PECHO">PECHO</option>
                    <option value="MARIPOSA">MARIPOSA</option>
                  </select>
                </label>

                <label htmlFor="exp-distance" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                  Distancia
                  <select
                    id="exp-distance"
                    value={exportFilters.distance}
                    onChange={(event) => setExportFilters((prev) => ({ ...prev, distance: event.target.value }))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                  >
                    <option value="">Todas</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                <label htmlFor="exp-from" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                  Desde
                  <input
                    id="exp-from"
                    type="date"
                    value={exportFilters.fromDate}
                    onChange={(event) => setExportFilters((prev) => ({ ...prev, fromDate: event.target.value }))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                  />
                </label>

                <label htmlFor="exp-to" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
                  Hasta
                  <input
                    id="exp-to"
                    type="date"
                    value={exportFilters.toDate}
                    onChange={(event) => setExportFilters((prev) => ({ ...prev, toDate: event.target.value }))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                  />
                </label>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={exportFilters.onlyQualified}
                  onChange={(event) => setExportFilters((prev) => ({ ...prev, onlyQualified: event.target.checked }))}
                />
                Solo marcas con referencia alcanzada
              </label>

              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                Filas a exportar: <strong>{exportPreviewCount}</strong>
              </p>

              <PrimaryButton onClick={handleExport}>Descargar CSV</PrimaryButton>
              {exportFeedback && <p style={{ margin: 0, fontSize: '0.84rem', color: '#0369a1' }}>{exportFeedback}</p>}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Campos exportados" subtitle="Compatibles para trabajo en hojas y carga Meet Manager" />
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155' }}>
              SwimmerEmail, Gender, Category, Style, Distance, Event, SeedTime, TimeInMs, TournamentDate, AchievedReference
            </p>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <SectionTitle title="Predicciones de rendimiento" subtitle="Selecciona un nadador" />
            <label htmlFor="prediction-swimmer" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
              Nadador
              <select
                id="prediction-swimmer"
                value={selectedSwimmer}
                onChange={(event) => setSelectedSwimmer(event.target.value)}
                style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
              >
                <option value="">Seleccionar...</option>
                {swimmers.map((swimmer) => (
                  <option key={swimmer.email} value={swimmer.email}>
                    {swimmer.email}
                  </option>
                ))}
              </select>
            </label>
            {selectedSwimmer && (
              <div style={{ marginTop: '0.6rem' }}>
                {selectedSwimmerPredictions.length === 0 ? (
                  <p style={{ margin: 0, color: '#64748b' }}>Aún sin datos suficientes para predecir.</p>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.35rem' }}>
                    {selectedSwimmerPredictions.map((prediction) => (
                      <li key={prediction.eventKey} style={{ fontSize: '0.86rem' }}>
                        <strong>
                          {prediction.style} {prediction.distance}m
                        </strong>{' '}
                        → {prediction.predictedTime}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle title="Send Message to Swimmer" subtitle="Share direct performance feedback" />
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <label htmlFor="swimmer-select" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                Swimmer
                <select
                  id="swimmer-select"
                  value={selectedSwimmer}
                  onChange={(event) => setSelectedSwimmer(event.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                >
                  <option value="">Select swimmer...</option>
                  {swimmers.map((swimmer) => (
                    <option key={swimmer.email} value={swimmer.email}>
                      {swimmer.email}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="coach-message" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                Message
                <textarea
                  id="coach-message"
                  rows={4}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Keep your stroke steady in the second 50m."
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem', resize: 'vertical' }}
                />
              </label>

              <PrimaryButton onClick={handleSendMessage}>Send</PrimaryButton>
              {feedback && <p style={{ margin: 0, color: '#0369a1', fontSize: '0.85rem' }}>{feedback}</p>}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Recent Messages by Swimmer" />
            {groupedMessages.every((group) => group.messages.length === 0) ? (
              <p style={{ margin: 0, color: '#64748b' }}>No messages sent yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {groupedMessages.map((group) => (
                  <article
                    key={group.swimmerEmail}
                    style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '0.7rem' }}
                  >
                    <p style={{ margin: 0, fontWeight: 600 }}>{group.swimmerEmail}</p>
                    {group.messages.length === 0 ? (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>No messages</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0.4rem 0 0', display: 'grid', gap: '0.35rem' }}>
                        {group.messages.map((message) => (
                          <li key={message.id} style={{ fontSize: '0.85rem' }}>
                            <span>{message.text}</span>
                            <span style={{ color: '#64748b', marginLeft: '0.35rem', fontSize: '0.75rem' }}>
                              ({new Date(message.date).toLocaleDateString()})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle title="Qualified Times" />
            {qualifiedTimes.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>No swimmers have achieved the reference yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.45rem' }}>
                {qualifiedTimes.map((entry, index) => (
                  <li
                    key={`${entry.swimmerEmail}-${entry.style}-${entry.distance}-${index}`}
                    style={{ fontSize: '0.9rem' }}
                  >
                    <strong>{entry.swimmerEmail}</strong> • {entry.style} {entry.distance}m • {entry.time} •{' '}
                    {new Date(entry.tournamentDate || Date.now()).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle title="Ranking by Event" />
            {Object.keys(rankingByEvent).length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>No ranking data available.</p>
            ) : (
              Object.entries(rankingByEvent).map(([eventKey, eventTimes]) => (
                <article key={eventKey} style={{ marginBottom: '0.8rem' }}>
                  <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem' }}>{eventKey.replace('-', ' ')}</h4>
                  <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {eventTimes.map((entry, index) => (
                      <li key={`${eventKey}-${entry.swimmerEmail}-${entry.timeInMs}-${index}`} style={{ marginBottom: '0.25rem' }}>
                        #{index + 1} {entry.swimmerEmail} - {entry.time}
                      </li>
                    ))}
                  </ol>
                </article>
              ))
            )}
          </Card>
        </>
      )}
    </section>
  );
}

export default CoachDashboard;
