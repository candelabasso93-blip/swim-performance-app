import { useState } from 'react';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SectionTitle from '../components/SectionTitle';

const categories = ['INFANTIL', 'MAYORES'];
const genders = ['VARONES', 'MUJERES'];

function Register({ registerUser, onNavigate }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'swimmer',
    gender: genders[0],
    category: categories[0],
  });
  const [feedback, setFeedback] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = registerUser(form);

    if (result.success) {
      setFeedback('Registration successful. You can now login.');
      setForm({
        email: '',
        password: '',
        role: 'swimmer',
        gender: genders[0],
        category: categories[0],
      });
      return;
    }

    setFeedback(result.message);
  };

  return (
    <section style={{ display: 'grid', gap: '0.9rem' }}>
      <Card>
        <SectionTitle title="Create Account" subtitle="Register swimmer or coach profile" />
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.65rem' }}>
          <label htmlFor="email" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
            Email
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem' }}
            />
          </label>

          <label htmlFor="password" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
            Password
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.6rem' }}
            />
          </label>

          <label htmlFor="role" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
            Role
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
            >
              <option value="swimmer">Swimmer</option>
              <option value="coach">Coach</option>
            </select>
          </label>

          {form.role === 'swimmer' && (
            <>
              <label htmlFor="gender" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                Gender
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                >
                  {genders.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="category" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                Category
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem' }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          <PrimaryButton type="submit">Create Account</PrimaryButton>
        </form>

        {feedback && <p style={{ margin: '0.7rem 0 0', color: '#0369a1', fontSize: '0.85rem' }}>{feedback}</p>}
      </Card>

      <SecondaryButton onClick={() => onNavigate('home')}>Back</SecondaryButton>
    </section>
  );
}

export default Register;
