export const CLIENT_STATUS_VALUES = [
  "PROSPECT",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export type ClientStatus = (typeof CLIENT_STATUS_VALUES)[number];

export interface Client {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string;
  phone: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}
