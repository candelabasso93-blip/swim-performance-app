import { useState } from 'react';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SectionTitle from '../components/SectionTitle';

function Login({ loginUser, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = loginUser(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setError('');
    if (result.user.role === 'swimmer') {
      onNavigate('swimmerDashboard');
      return;
    }
    onNavigate('coachDashboard');
  };

  return (
    <section style={{ display: 'grid', gap: '0.9rem' }}>
      <Card>
        <SectionTitle title="Login" subtitle="Access your swim performance dashboard" />
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.65rem' }}>
          <label htmlFor="login-email" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
            Email
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem' }}
            />
          </label>

          <label htmlFor="login-password" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
            Password
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem' }}
            />
          </label>

          <PrimaryButton type="submit">Access Dashboard</PrimaryButton>
        </form>
        {error && <p style={{ margin: '0.7rem 0 0', color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p>}
      </Card>

      <SecondaryButton onClick={() => onNavigate('home')}>Back</SecondaryButton>
    </section>
  );
}

export default Login;
