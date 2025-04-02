
import { User, Customer, Invoice, InvoiceItem } from '../types';

export const mockUser: User = {
  id: '1',
  username: 'demo',
  password: 'password',
  company: {
    name: 'Mitt Företag AB',
    orgNumber: '559001-1234',
    vatNumber: 'SE559001123401',
    address: {
      street: 'Storgatan 1',
      postalCode: '123 45',
      city: 'Stockholm',
      country: 'Sverige'
    },
    contact: {
      name: 'Sven Svensson',
      email: 'info@mittforetag.se',
      phone: '08-123 45 67'
    },
    bankgiro: '123-4567',
    plusgiro: '12 34 56-7',
    taxRate: 25,
    logo: '/lovable-uploads/1291e103-276f-41a1-90d7-728a8f154e56.png'
  }
};

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Kund AB',
    orgNumber: '556789-1234',
    vatNumber: 'SE556789123401',
    reference: 'Maria Andersson',
    address: {
      street: 'Kundvägen 2',
      postalCode: '432 10',
      city: 'Göteborg',
      country: 'Sverige'
    },
    contact: {
      name: 'Maria Andersson',
      email: 'maria@kundab.se',
      phone: '031-123 45 67'
    }
  },
  {
    id: '2',
    name: 'Företag XYZ AB',
    orgNumber: '556123-7890',
    vatNumber: 'SE556123789001',
    reference: 'Anders Karlsson',
    address: {
      street: 'Industrigatan 5',
      postalCode: '211 20',
      city: 'Malmö',
      country: 'Sverige'
    },
    contact: {
      name: 'Anders Karlsson',
      email: 'anders@xyzab.se',
      phone: '040-123 45 67'
    }
  }
];

export const mockInvoiceItems: InvoiceItem[] = [
  {
    id: '1',
    articleNumber: 'A001',
    description: 'Konsulttjänst, timmar',
    quantity: 8,
    unit: 'tim',
    price: 1200,
    taxRate: 25,
    account: '3010'
  },
  {
    id: '2',
    articleNumber: 'A002',
    description: 'Programmering',
    quantity: 10,
    unit: 'tim',
    price: 950,
    taxRate: 25,
    account: '3011'
  },
  {
    id: '3',
    articleNumber: 'M001',
    description: 'Server hosting, månad',
    quantity: 1,
    unit: 'st',
    price: 2500,
    taxRate: 25,
    account: '3540'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: '2023-001',
    customer: mockCustomers[0],
    date: '2023-04-15',
    dueDate: '2023-05-15',
    items: [
      { ...mockInvoiceItems[0], id: '1' },
      { ...mockInvoiceItems[2], id: '2' }
    ],
    status: 'paid',
    type: 'invoice',
    reference: 'Projekt A',
    customerReference: 'Maria Andersson',
    notes: 'Tack för ditt förtroende!',
    paymentTerms: '30 dagar',
    currency: 'SEK',
    language: 'sv',
    totalNet: 9600 + 2500,
    totalTax: (9600 + 2500) * 0.25,
    totalGross: (9600 + 2500) * 1.25,
    isCredit: false
  },
  {
    id: '2',
    invoiceNumber: '2023-002',
    customer: mockCustomers[1],
    date: '2023-05-01',
    dueDate: '2023-05-31',
    items: [
      { ...mockInvoiceItems[1], id: '1' }
    ],
    status: 'sent',
    type: 'invoice',
    reference: 'Projekt B',
    customerReference: 'Anders Karlsson',
    notes: '',
    paymentTerms: '30 dagar',
    currency: 'SEK',
    language: 'sv',
    totalNet: 9500,
    totalTax: 9500 * 0.25,
    totalGross: 9500 * 1.25,
    isCredit: false
  }
];
