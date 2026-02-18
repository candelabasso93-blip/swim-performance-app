function SecondaryButton({ children, style = {}, ...props }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        width: '100%',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontWeight: 600,
        padding: '0.65rem 1rem',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;
