
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Customer, Invoice, InvoiceItem } from '../types';
import { mockCustomers, mockInvoices, mockInvoiceItems } from '../data/mockData';
import { useToast } from '@/hooks/use-toast';

interface DataContextType {
  customers: Customer[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  generateInvoiceNumber: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [invoiceItems] = useState<InvoiceItem[]>(mockInvoiceItems);
  const { toast } = useToast();

  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer = { 
      ...customerData, 
      id: `customer-${Date.now()}` 
    };
    setCustomers([...customers, newCustomer]);
    toast({
      title: "Kund tillagd",
      description: `${newCustomer.name} har lagts till i kundregistret`,
    });
    return newCustomer;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(customer => 
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    ));
    toast({
      title: "Kund uppdaterad",
      description: `${updatedCustomer.name} har uppdaterats`,
    });
  };

  const deleteCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      setCustomers(customers.filter(customer => customer.id !== id));
      toast({
        title: "Kund borttagen",
        description: `${customer.name} har tagits bort från kundregistret`,
      });
    }
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const lastInvoice = invoices.length > 0 
      ? invoices.sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber))[0]
      : null;
    
    const lastNumber = lastInvoice 
      ? parseInt(lastInvoice.invoiceNumber.split('-')[1], 10) 
      : 0;
    
    return `${year}-${(lastNumber + 1).toString().padStart(3, '0')}`;
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice = { 
      ...invoiceData, 
      id: `invoice-${Date.now()}` 
    };
    setInvoices([...invoices, newInvoice]);
    toast({
      title: "Faktura skapad",
      description: `Faktura #${newInvoice.invoiceNumber} har skapats`,
    });
    return newInvoice;
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    ));
    toast({
      title: "Faktura uppdaterad",
      description: `Faktura #${updatedInvoice.invoiceNumber} har uppdaterats`,
    });
  };

  const deleteInvoice = (id: string) => {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      toast({
        title: "Faktura borttagen",
        description: `Faktura #${invoice.invoiceNumber} har tagits bort`,
      });
    }
  };

  return (
    <DataContext.Provider value={{ 
      customers,
      invoices,
      invoiceItems,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      generateInvoiceNumber
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
