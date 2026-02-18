function Card({ children, style = {} }) {
  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        padding: '1rem',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export default Card;
