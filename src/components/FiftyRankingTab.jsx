import Card from './Card';
import SectionTitle from './SectionTitle';

const events50 = ['LIBRE', 'ESPALDA', 'PECHO', 'MARIPOSA'];

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

function swimmerDisplayName(email, usersByEmail) {
  const user = usersByEmail[email];
  if (user?.name) return user.name;
  const local = email.split('@')[0] || email;
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildEventRanking(times, style) {
  const eventTimes = times.filter((entry) => entry.distance === '50' && entry.style === style);

  const bestBySwimmer = eventTimes.reduce((acc, entry) => {
    const current = acc[entry.swimmerEmail];
    if (!current || entry.timeInMs < current.timeInMs) {
      acc[entry.swimmerEmail] = entry;
    }
    return acc;
  }, {});

  return Object.entries(bestBySwimmer)
    .map(([swimmerEmail, entry]) => ({ swimmerEmail, ...entry }))
    .sort((a, b) => a.timeInMs - b.timeInMs);
}

function FiftyRankingTab({ times, users = [], mode, currentUserEmail }) {
  const usersByEmail = users.reduce((acc, user) => {
    acc[user.email] = user;
    return acc;
  }, {});

  return (
    <Card>
      <SectionTitle title="Ranking interno 50m" subtitle="Un ranking por cada prueba de 50 metros" />
      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {events50.map((style) => {
          const ranking = buildEventRanking(times, style);

          return (
            <article key={style} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.7rem' }}>
              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>{style} 50m</h4>

              {ranking.length === 0 ? (
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem' }}>Sin marcas registradas aún.</p>
              ) : mode === 'coach' ? (
                <ol style={{ margin: 0, paddingLeft: '1.15rem' }}>
                  {ranking.map((entry, index) => (
                    <li key={`${style}-${entry.swimmerEmail}`} style={{ marginBottom: '0.22rem', fontSize: '0.86rem' }}>
                      <strong>{swimmerDisplayName(entry.swimmerEmail, usersByEmail)}</strong> — {entry.time}
                      <span style={{ color: '#64748b' }}> ({formatMsToTime(entry.timeInMs)})</span>
                    </li>
                  ))}
                </ol>
              ) : (
                (() => {
                  const myIndex = ranking.findIndex((entry) => entry.swimmerEmail === currentUserEmail);
                  if (myIndex === -1) {
                    return <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem' }}>No tienes marca en esta prueba.</p>;
                  }

                  return (
                    <div>
                      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>#{myIndex + 1}</p>
                      <p style={{ margin: '0.2rem 0 0', color: '#475569', fontSize: '0.86rem' }}>
                        Tu mejor marca: {ranking[myIndex].time}
                      </p>
                    </div>
                  );
                })()
              )}
            </article>
          );
        })}
      </div>
    </Card>
  );
}

export default FiftyRankingTab;
