function Badge({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '999px',
        backgroundColor: '#dcfce7',
        color: '#166534',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
