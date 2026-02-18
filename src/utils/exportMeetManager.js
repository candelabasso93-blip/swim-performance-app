function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function buildMeetManagerCsv(times, usersByEmail, filters = {}) {
  const { swimmerEmail, style, distance, onlyQualified, fromDate, toDate } = filters;

  const filtered = times.filter((entry) => {
    if (swimmerEmail && entry.swimmerEmail !== swimmerEmail) return false;
    if (style && entry.style !== style) return false;
    if (distance && entry.distance !== distance) return false;
    if (onlyQualified && !entry.achievedReference) return false;

    const entryDate = new Date(entry.tournamentDate || Date.now()).getTime();
    if (fromDate && entryDate < new Date(fromDate).getTime()) return false;
    if (toDate && entryDate > new Date(toDate).getTime()) return false;

    return true;
  });

  const header = [
    'SwimmerEmail',
    'Gender',
    'Category',
    'Style',
    'Distance',
    'Event',
    'SeedTime',
    'TimeInMs',
    'TournamentDate',
    'AchievedReference',
  ];

  const rows = filtered.map((entry) => {
    const user = usersByEmail[entry.swimmerEmail] || {};
    return [
      entry.swimmerEmail,
      user.gender || '',
      user.category || '',
      entry.style,
      entry.distance,
      `${entry.style} ${entry.distance}m`,
      entry.time,
      entry.timeInMs,
      entry.tournamentDate || '',
      entry.achievedReference ? 'YES' : 'NO',
    ];
  });

  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

export function downloadCsvFile(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
