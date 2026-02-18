import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

function Home({ onNavigate, currentUser }) {
  return (
    <section style={{ display: 'grid', gap: '0.9rem' }}>
      <Card>
        <h1 style={{ margin: 0, fontSize: '1.35rem' }}>Swim Club Performance App</h1>
        <p style={{ margin: '0.45rem 0 0', color: '#64748b' }}>
          Track performance, references, and rankings from one mobile-friendly dashboard.
        </p>
      </Card>

      <Card>
        <div style={{ display: 'grid', gap: '0.65rem' }}>
          <PrimaryButton onClick={() => onNavigate('register')}>Register</PrimaryButton>
          <SecondaryButton onClick={() => onNavigate('login')}>Login</SecondaryButton>
        </div>
        {currentUser && (
          <p style={{ margin: '0.75rem 0 0', color: '#334155', fontSize: '0.9rem' }}>
            Logged in as <strong>{currentUser.email}</strong> ({currentUser.role}).
          </p>
        )}
      </Card>
    </section>
  );
}

export default Home;
