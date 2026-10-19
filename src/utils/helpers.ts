export function formatVirtualPlatform(platform?: string): string {
  if (!platform) return 'Virtual Stream';

  const platformMap: Record<string, string> = {
    ZOOM: 'Zoom',
    GOOGLE_MEET: 'Google Meet',
    YOUTUBE_LIVE: 'YouTube Live',
    TEAMS: 'Microsoft Teams',
    CUSTOM: 'Custom Webcast',
  };

  return platformMap[platform] || platform.replace(/_/g, ' ');
}

export interface FormatDateRangeOptions {
  startDate: string | Date;
  endDate?: string | Date;
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
};

export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', options);
}


export function formatDateRange(
  start: string | Date,
  end?: string | Date,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
): string {
  const formattedStart = formatDate(start, options);
  if (!end) return formattedStart;

  const formattedEnd = formatDate(end, options);
  if (formattedStart === formattedEnd) {
    return formattedStart;
  }

  return `From ${formattedStart} to ${formattedEnd}`;
}