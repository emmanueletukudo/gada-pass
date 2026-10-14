import { Role } from '@/lib/auth';

export const getUserRole = (role: Role) => {
  switch (role) {
    case 'ADMIN':
      return 'Platform command';
    case 'ATTENDEE':
      return 'Attendee space';
    case 'GATE_AGENT':
      return 'Gate control';
    case 'ORGANIZER':
      return 'Organizer studio';
    default:
      return "Invalid Role";
  }
};
