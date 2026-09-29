const numberFormat = new Intl.NumberFormat('en-US');
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
const timeFormat = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' });

export const formatNumber = (value: number): string => numberFormat.format(Math.round(value));

export const formatDecimal = (value: number): string => value.toFixed(1);

export const formatPercent = (value: number | null): string =>
  value === null ? '–' : `${Math.round(value * 100)}%`;

export const formatDuration = (milliseconds: number | null): string => {
  if (milliseconds === null) return '–';

  const totalSeconds = Math.round(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  return `${seconds}s`;
};

export const formatDay = (time: number): string => dayFormat.format(time);

export const formatDateTime = (time: number): string => dateTimeFormat.format(time);

export const formatTime = (time: number): string => timeFormat.format(time);
