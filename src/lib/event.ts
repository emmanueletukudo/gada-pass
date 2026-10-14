// import { toast } from 'sonner';
// import { api } from './api';
// import { uploadFileToR2 } from './media';

// export interface CreateTicketTierInput {
//   name: string;
//   price: number;
//   quantity: number;
//   description?: string;
//   currency?: string;
//   salesStart?: string;
//   salesEnd?: string;
// }

// export interface CreateEventInput {
//   name: string;
//   description: string;
//   categoryId: string;
//   startsAt: string;
//   endsAt: string;
//   ticketTiers: CreateTicketTierInput[];

//   images?: File[];
//   banner?: string;
//   venue?: string;
//   city?: string;
//   isOnline?: boolean;
//   capacity?: number;
//   settlementAccountId?: string;

//   instagram?: string;
//   twitter?: string;
//   website?: string;
// }

// export const createEvent = async (values: CreateEventInput) => {
//   try {
//     if (values.images && values.images.length === 0) {
//       toast.error('Add at least one event image');
//       return;
//     }

//     const createdEvent = await api<{ id: string }>('/events', {
//       method: 'POST',
//       body: JSON.stringify({
//         name: values.name,
//         description: values.description,
//         categoryId: values.categoryId,
//         city: values.city,
//         venue: values.venue,
//         startsAt: new Date(values.startsAt).toISOString(),
//         endsAt: new Date(values.endsAt).toISOString(),
//         capacity: values.capacity,
//         isOnline: false,
//         images: [],
//         ticketTiers: values.ticketTiers.map((tier) => ({
//           name: tier.name,
//           price: tier.price,
//           currency: 'NGN',
//           quantity: tier.quantity,
//         })),
//       }),
//     });

//     if (values.images) {
//       const uploadedUrls = await Promise.all(
//         values.images.map((file) => uploadFileToR2(file)),
//       );

//       await api(`/events/${createdEvent.id}`, {
//         method: 'PATCH',
//         body: JSON.stringify({
//           banner: uploadedUrls[0],
//           images: uploadedUrls,
//         }),
//       });
//     }
//   } catch (error) {
//     toast.error(
//       error instanceof Error ? error.message : 'Could not create event',
//     );
//   }
// };

import { toast } from 'sonner';
import { api } from './api';
import { uploadFileToR2 } from './media';

export interface CreateTicketTierInput {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  currency?: string;
  salesStart?: string;
  salesEnd?: string;
}

export interface CreateEventInput {
  name: string;
  description: string;
  eventType: string;
  startsAt: string;
  endsAt: string;
  ticketTiers: CreateTicketTierInput[];

  categoryId?: string;
  images?: File[];
  banner?: string;
  venue?: string;
  city?: string;
  isOnline?: boolean;
  capacity?: number;
  settlementAccountId?: string;

  instagram?: string;
  x?: string;
  website?: string;

  slug?: string;
  coverFees?: boolean;
  meetingLink?: string;
  virtualPlatform?: string;
  meetingPasscode?: string;
}

export interface EventUpdateInput extends CreateEventInput {
  id?: string;
}

export interface CreateEventResponse extends CreateEventInput {
  id?: string;
}

export interface EventCategory {
  id: string;
  label: string;
  value: string;
  iconUrl: string;
}

export type SetlementAccount = {
  id?: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  bankCode?: string;
  isDefault?: boolean;
};

export type verifyBankAccountInput = {
  accountNumber: string;
  bankCode: string;
};

export type supportedBanksResponse = {
  bank: string;
  code: string;
};

export type verifyBankAccountReponse = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
};

// export const createEvent = async (input: CreateEventInput) => {
//   try {
//     let uploadedUrls: string[] = [];

//     if (input.images && input.images.length > 0) {
//       uploadedUrls = await Promise.all(
//         input.images.map((file) => uploadFileToR2(file)),
//       );
//     }

//     const createdEvent = await api<{ id: string }>('/events', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         name: input.name,
//         description: input.description,
//         city: input.city,
//         categoryId: input.categoryId,
//         venue: input.venue,
//         startsAt: new Date(input.startsAt).toISOString(),
//         endsAt: new Date(input.endsAt).toISOString(),
//         capacity: input.capacity,
//         isOnline: input.isOnline ?? false,
//         settlementAccountId: input.settlementAccountId || undefined,
//         instagram: input.instagram || undefined,
//         x: input.x || undefined,
//         website: input.website || undefined,
//         images: uploadedUrls,
//         banner: uploadedUrls[0] ?? input.banner,
//         ticketTiers: input.ticketTiers.map((tier) => ({
//           name: tier.name,
//           price: String(tier.price),
//           quantity: Number(tier.quantity),
//           currency: tier.currency ?? 'NGN',
//         })),
//       }),
//     });

//     return createdEvent;
//   } catch (error) {
//     const message = formatErrorMessage(error, 'Could not create event');
//     toast.error(message);
//     throw error;
//   }
// };

export const createEvent = async (input: CreateEventInput) => {
  try {
    let uploadedUrls: string[] = [];

    if (input.images && input.images.length > 0) {
      uploadedUrls = await Promise.all(
        input.images.map((file) => uploadFileToR2(file)),
      );
    }

    const createdEvent = await api<{ id: string }>('/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        eventType: input.eventType,
        slug: input.slug || undefined,
        coverFees: input.coverFees ?? false,
        categoryId: input.categoryId || undefined,
        city: input.city || undefined,
        venue: input.venue || undefined,
        startsAt: new Date(input.startsAt).toISOString(),
        endsAt: new Date(input.endsAt).toISOString(),
        capacity: Number(input.capacity ?? 100),
        isOnline: input.isOnline ?? false,
        meetingLink: input.meetingLink || undefined,
        virtualPlatform: input.virtualPlatform || undefined,
        meetingPasscode: input.meetingPasscode || undefined,
        settlementAccountId: input.settlementAccountId || undefined,
        instagram: input.instagram || undefined,
        x: input.x || undefined,
        website: input.website || undefined,
        images: uploadedUrls,
        banner: uploadedUrls[0] ?? input.banner,
        ticketTiers: input.ticketTiers.map((tier) => ({
          name: tier.name,
          price: String(tier.price),
          quantity: Number(tier.quantity),
          currency: tier.currency ?? 'NGN',
        })),
      }),
    });

    return createdEvent;
  } catch (error) {
    const message = formatErrorMessage(error, 'Could not create event');
    toast.error(message);
    throw error;
  }
};

export const updateEvent = async (eventId: string, input: EventUpdateInput) => {
  try {
         console.log('Submitting event update with values:', input);
    let imageUrls: string[] = [];

    if (input.images && input.images.length > 0) {
      imageUrls = await Promise.all(
        input.images.map((file) => uploadFileToR2(file)),
      );
    }
    const updatedEvent = await api<CreateEventResponse>(
      `/organizer/events/${eventId}/update`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          eventType: input.eventType,
          city: input.city,
          categoryId: input.categoryId,
          coverFees: input.coverFees ?? false,
          venue: input.venue,
          startsAt: new Date(input.startsAt).toISOString(),
          endsAt: new Date(input.endsAt).toISOString(),
          isOnline: input.isOnline ?? false,
          meetingLink: input.meetingLink || undefined,
          virtualPlatform: input.virtualPlatform || undefined,
          meetingPasscode: input.meetingPasscode || undefined,
          capacity: input.capacity,
          settlementAccountId: input.settlementAccountId || undefined,
          instagram: input.instagram || undefined,
          x: input.x || undefined,
          website: input.website || undefined,
          images: imageUrls,
          banner: imageUrls[0] ?? input.banner,
          ticketTiers: input.ticketTiers.map((tier) => ({
            id: tier.id,
            name: tier.name,
            price: String(tier.price),
            quantity: Number(tier.quantity),
            currency: tier.currency ?? 'NGN',
          })),
        }),
      },
    );

    return updatedEvent;
  } catch (error) {
    const message = formatErrorMessage(error, 'Could not update the event');
    toast.error(message);
  }
};

export const getEventCategories = async () => {
  try {
    const res = await api<EventCategory[]>('/event-categories', {
      method: 'GET',
    });

    return res;
  } catch (error) {
    const message = formatErrorMessage(error, 'Failed to fetch categories');
    toast.error(message);
    throw error;
  }
};

export const createSetlementAccounts = async (input: SetlementAccount) => {
  try {
    const res = await api<SetlementAccount>('/settlement-accounts', {
      method: 'POST',
      body: JSON.stringify({
        accountName: input.accountName,
        accountNumber: input.accountNumber,
        bankName: input.bankName,
        bankCode: input.bankCode,
        isDefault: input.isDefault,
      }),
    });

    return res;
  } catch (error) {
    const message = formatErrorMessage(
      error,
      'Failed to create settlement account',
    );
    toast.error(message);
    throw error;
  }
};

export const getSetlementAccounts = async () => {
  try {
    const res = await api<SetlementAccount[]>('/settlement-accounts', {
      method: 'GET',
    });

    return res;
  } catch (error) {
    const message = formatErrorMessage(
      error,
      'Failed to create settlement account',
    );
    toast.error(message);
    throw error;
  }
};

export const getSupportedBanks = async () => {
  try {
    const res = await api<supportedBanksResponse[]>(
      '/settlement-accounts/banks',
      {
        method: 'GET',
      },
    );
    return res;
  } catch (error) {
    const message = formatErrorMessage(
      error,
      'Failed to fetch supported banks',
    );
    toast.error(message);
    throw error;
  }
};

export const verifyBankAccount = async (input: verifyBankAccountInput) => {
  try {
    const res = await api<verifyBankAccountReponse>(
      `/settlement-accounts/verify?accountNumber=${input.accountNumber}&bankCode=${input.bankCode}`,
      {
        method: 'GET',
      },
    );
    return res;
  } catch (error) {
    const errorMsg = formatErrorMessage(error);
    toast.error(errorMsg);
    throw error;
  }
};

export const publishEvent = async (eventId: string) => {
  try {
    const publishedEvent = await api(`/events/${eventId}/publish`, {
      method: 'POST',
    });
    return publishedEvent;
  } catch (error) {
    const errMessage = formatErrorMessage(error);
    toast.error(errMessage);
    throw error;
  }
};

const formatErrorMessage = (error: any, message?: string) =>
  error instanceof Error ? error.message : message;
