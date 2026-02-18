function PrimaryButton({ children, style = {}, ...props }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        width: '100%',
        border: 'none',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        color: 'white',
        fontWeight: 600,
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
