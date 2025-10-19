import { Contact } from '@/types';
import * as Contacts from 'expo-contacts';

export class ContactService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  }

  static async getContacts(): Promise<Contact[]> {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        console.warn('Contacts permission not granted');
        return [];
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });

      if (data.length === 0) {
        console.log('No contacts found');
        return [];
      }

      // Transform the contacts to match our Contact interface
      const transformedContacts: Contact[] = data
        .filter(contact => contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map((contact, index) => {
          // Use the first phone number available
          const phoneNumber = contact.phoneNumbers?.[0]?.number || '';
          
          // Use the first email available
          const email = contact.emails?.[0]?.email;

          return {
            id: contact.id || `contact-${index}`,
            name: contact.name,
            phoneNumber: phoneNumber,
            email: email,
          };
        })
        .filter(contact => contact.phoneNumber.trim() !== ''); // Filter out contacts without phone numbers

      return transformedContacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  static async searchContacts(query: string): Promise<Contact[]> {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        console.warn('Contacts permission not granted');
        return [];
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
        name: query,
      });

      // Transform the contacts to match our Contact interface
      const transformedContacts: Contact[] = data
        .filter(contact => contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map((contact, index) => {
          const phoneNumber = contact.phoneNumbers?.[0]?.number || '';
          const email = contact.emails?.[0]?.email;

          return {
            id: contact.id || `contact-${index}`,
            name: contact.name,
            phoneNumber: phoneNumber,
            email: email,
          };
        })
        .filter(contact => contact.phoneNumber.trim() !== '');

      return transformedContacts;
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }
}
