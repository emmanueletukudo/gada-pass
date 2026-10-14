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
