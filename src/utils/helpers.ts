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


export const cleanPayload = <T extends Record<string, any>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (value === '') return [key, undefined];
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return [key, cleanPayload(value)];
      }
      if (Array.isArray(value)) {
        return [
          key,
          value.map((item) =>
            typeof item === 'object' ? cleanPayload(item) : item,
          ),
        ];
      }
      return [key, value];
    }),
  ) as T;
};