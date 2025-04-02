export interface User {
  id: string;
  username: string;
  email: string;
  company: Company;
}

export interface Company {
  name: string;
  orgNumber: string;
  vatNumber?: string;
  address: Address;
  contact: Contact;
  bankgiro?: string;
  plusgiro?: string;
  iban?: string;
  swish?: string;
  accountNumber?: string;
  clearingNumber?: string;
  bankName?: string;
  swift?: string; // BIC/SWIFT code
  taxRate: number;
  logo?: string;
}

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  orgNumber?: string;
  vatNumber?: string;
  reference?: string;
  address: Address;
  contact: Contact;
  userId: string;
}

export interface InvoiceItem {
  id: string;
  articleNumber?: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  taxRate: number;
  discount?: number;
  account?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'late' | 'cancelled';
export type InvoiceType = 'invoice' | 'credit';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  type: InvoiceType;
  reference?: string;
  customerReference?: string;
  notes?: string;
  paymentTerms: string;
  currency: string;
  language: 'sv' | 'en';
  totalNet: number;
  totalTax: number;
  totalGross: number;
  isCredit: boolean;
}
