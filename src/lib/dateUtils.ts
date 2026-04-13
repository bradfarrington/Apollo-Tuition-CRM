export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  
  const diffInMinutes = Math.round(diffInMs / (1000 * 60));
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 7));
  const diffInMonths = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 30));

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'long' });

  if (Math.abs(diffInMinutes) < 60) {
    if (diffInMinutes === 0) return 'Just now';
    return rtf.format(diffInMinutes, 'minute');
  }
  if (Math.abs(diffInHours) < 24) return rtf.format(diffInHours, 'hour');
  if (Math.abs(diffInDays) < 7) return rtf.format(diffInDays, 'day');
  if (Math.abs(diffInWeeks) < 4) return rtf.format(diffInWeeks, 'week');
  return rtf.format(diffInMonths, 'month');
}
