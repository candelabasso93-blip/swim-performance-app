function CaimanesLogo({ size = 86 }) {
  return (
    <div
      style={{
        width: size,
        minWidth: size,
        height: size,
        borderRadius: '18px',
        background: 'linear-gradient(145deg, #ffffff, #f1f5f9)',
        border: '1px solid #e2e8f0',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
      }}
      aria-label="Logo Caimanes"
      title="Caimanes"
    >
      <svg viewBox="0 0 120 120" width={size - 14} height={size - 14} role="img" aria-label="Escudo Caimanes">
        <defs>
          <linearGradient id="leftWing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="rightWing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        <path d="M12 20 L56 12 L28 108 Q10 76 12 20 Z" fill="url(#leftWing)" />
        <path d="M108 24 L62 18 L90 108 Q110 82 108 24 Z" fill="url(#rightWing)" />

        <text x="60" y="48" textAnchor="middle" fontSize="14" fontWeight="800" fill="#ea580c" letterSpacing="1">
          CAIMANES
        </text>
        <text x="60" y="85" textAnchor="middle" fontSize="36">
          🐊
        </text>
      </svg>
    </div>
  );
}

export default CaimanesLogo;
