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

function PerformanceChart({ title, data }) {
  if (!data.length) {
    return null;
  }

  const width = 340;
  const height = 180;
  const padding = { top: 18, right: 14, bottom: 34, left: 46 };

  const normalizedData = data.map((item) => {
    const parsed = new Date(item.tournamentDate || item.date || Date.now());
    const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return { ...item, safeDate };
  });

  const sortedData = [...normalizedData].sort((a, b) => a.safeDate - b.safeDate);
  const minTime = Math.min(...sortedData.map((item) => item.timeInMs));
  const maxTime = Math.max(...sortedData.map((item) => item.timeInMs));
  const range = Math.max(maxTime - minTime, 1);

  const xForIndex = (index) => {
    if (sortedData.length === 1) return width / 2;
    return padding.left + (index * (width - padding.left - padding.right)) / (sortedData.length - 1);
  };

  const yForTime = (timeInMs) => {
    const normalized = (timeInMs - minTime) / range;
    return height - padding.bottom - normalized * (height - padding.top - padding.bottom);
  };

  const points = sortedData.map((item, index) => ({
    x: xForIndex(index),
    y: yForTime(item.timeInMs),
    label: item.safeDate.toLocaleDateString(),
    time: item.time,
  }));

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem', backgroundColor: '#fff' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{title}</h4>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="180" role="img" aria-label={`Gráfico ${title}`}>
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#94a3b8"
          strokeWidth="1"
        />

        {[0, 0.5, 1].map((ratio) => {
          const t = minTime + range * ratio;
          const y = yForTime(t);
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={6} y={y + 4} fontSize="10" fill="#475569">
                {formatMsToTime(Math.round(t))}
              </text>
            </g>
          );
        })}

        <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={polyline} />

        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={point.x} cy={point.y} r="3.5" fill="#1d4ed8" />
            <text x={point.x} y={height - 12} textAnchor="middle" fontSize="9" fill="#475569">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default PerformanceChart;
