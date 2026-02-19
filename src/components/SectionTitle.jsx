function SectionTitle({ title, subtitle }) {
  return (
    <header style={{ marginBottom: '0.75rem' }}>
      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>{title}</h3>
      {subtitle && <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>{subtitle}</p>}
    </header>
  );
}

export default SectionTitle;
