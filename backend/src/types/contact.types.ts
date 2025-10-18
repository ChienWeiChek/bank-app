export interface Contact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactResponse {
  id: string;
  name: string;
  phoneNumber: string;
  email: string | null;
}

export interface CreateContactRequest {
  name: string;
  phoneNumber: string;
  email?: string;
}

export interface UpdateContactRequest {
  name?: string;
  phoneNumber?: string;
  email?: string;
}
