/**
 * Format a date to relative time string (e.g., "20 mins ago", "1 hr ago", "1 day ago")
 * @param date - Date string or Date object
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const postDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(postDate.getTime())) {
    return "recently";
  }

  const diffMs = now.getTime() - postDate.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  if (diffSec < 60) {
    return diffSec <= 1 ? "just now" : `${diffSec} secs ago`;
  }
  if (diffMin < 60) {
    return diffMin === 1 ? "1 min ago" : `${diffMin} mins ago`;
  }
  if (diffHr < 24) {
    return diffHr === 1 ? "1 hr ago" : `${diffHr} hrs ago`;
  }
  if (diffDay < 7) {
    return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  }
  if (diffWeek < 4) {
    return diffWeek === 1 ? "1 week ago" : `${diffWeek} weeks ago`;
  }
  if (diffMonth < 12) {
    return diffMonth === 1 ? "1 month ago" : `${diffMonth} months ago`;
  }
  if (diffYear < 1) {
    return "1 year ago";
  }
  return diffYear === 1 ? "1 year ago" : `${diffYear} years ago`;
}

