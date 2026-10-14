import { z } from 'zod';

export const ticketTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tier name is required.'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
});

export const eventFormSchema = z
  .object({
    eventType: z.string().min(1, 'Please select an event type.'),
    coverImageUrl: z.string().min(1, 'Cover image is required.'),
    coverImageFiles: z.array(z.any()).optional(),
    title: z.string().min(2, 'Event title must be at least 2 characters.'),
    slug: z
      .string()
      .min(2, 'Custom URL slug must be at least 2 characters.')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must contain only lowercase letters, numbers, and hyphens.',
      ),
    coverFees: z.boolean().default(false),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters.'),
    categoryId: z.string().optional(),

    startDate: z
      .string()
      .min(1, 'Start date and time are required.')
      .refine(
        (val) => {
          if (!val) return false;
          const date = new Date(val);
          return date.getTime() > Date.now() - 60000;
        },
        { message: 'Start date cannot be in the past.' },
      ),
  
    isOnline: z.boolean().optional(),
    city: z.string().optional(),
    venue: z.string().optional(),
    meetingLink: z.string().optional(),
    virtualPlatform: z.string().optional(),
    meetingPasscode: z.string().optional(),
    endDate: z.string().min(1, 'End date and time are required.'),
    capacity: z.coerce.number().min(1, 'Event capacity must be at least 1.'),

    instagram: z.string().optional(),
    x: z.string().optional(),
    website: z.string().optional(),

    ticketTiers: z
      .array(ticketTierSchema)
      .min(1, 'At least one ticket tier is required.'),
    settlementAccountId: z.string().optional(),
    settlementAccount: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.eventType === 'ONLINE_EVENT') {
      if (!data.meetingLink || !data.meetingLink.startsWith('http')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'A valid meeting link URL (e.g. https://zoom.us/j/...) is required.',
          path: ['meetingLink'],
        });
      }
    } else {
      if (!data.city || data.city.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'City is required for in-person events.',
          path: ['city'],
        });
      }

      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate).getTime();
        const end = new Date(data.endDate).getTime();
        if (end <= start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date must be after the start date.',
            path: ['endDate'],
          });
        }
      }

      if (!data.venue || data.venue.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Venue location details are required.',
          path: ['venue'],
        });
      }
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const STEP_FIELDS: Record<number, (keyof EventFormValues)[]> = {
  1: ['eventType'],
  2: ['coverImageUrl', 'title', 'slug', 'coverFees', 'description'],
  3: [
    'city',
    'venue',
    'meetingLink',
    'virtualPlatform',
    'meetingPasscode',
    'startDate',
    'endDate',
    'capacity',
  ],
  4: ['ticketTiers'],
  5: ['settlementAccountId'],
  6: [],
};
