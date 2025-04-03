import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Customer, Invoice, InvoiceItem, Address, Contact } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DataContextType {
  customers: Customer[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  generateInvoiceNumber: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchInvoices();
    }
  }, [user]);

  const transformCustomer = (data: any): Customer => ({
    id: data.id,
    name: data.name,
    orgNumber: data.org_number,
    vatNumber: data.vat_number,
    address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address,
    contact: typeof data.contact === 'string' ? JSON.parse(data.contact) : data.contact,
    reference: data.reference,
    userId: data.user_id
  });

  const transformInvoice = (data: any): Invoice => ({
    id: data.id,
    invoiceNumber: data.invoice_number,
    customer: transformCustomer(data.customer),
    date: data.date,
    dueDate: data.due_date,
    items: data.items as InvoiceItem[],
    status: data.status as 'draft' | 'sent' | 'paid' | 'late' | 'cancelled',
    type: data.type as 'invoice' | 'credit',
    reference: data.reference,
    customerReference: data.customer_reference,
    notes: data.notes,
    paymentTerms: data.payment_terms,
    currency: data.currency,
    language: data.language as 'sv' | 'en',
    totalNet: data.total_net,
    totalTax: data.total_tax,
    totalGross: data.total_gross,
    isCredit: data.is_credit
  });

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      if (data) {
        const transformedCustomers = data.map(transformCustomer);
        setCustomers(transformedCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Fel vid hämtning av kunder",
        description: "Kunde inte ladda dina kunder. Försök igen senare.",
        variant: "destructive"
      });
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      if (data) {
        const transformedInvoices = data.map(transformInvoice);
        setInvoices(transformedInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Fel vid hämtning av fakturor",
        description: "Kunde inte ladda dina fakturor. Försök igen senare.",
        variant: "destructive"
      });
    }
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoiceNumber,
          customer_id: invoiceData.customer.id,
          date: invoiceData.date,
          due_date: invoiceData.dueDate,
          items: invoiceData.items as any,
          status: invoiceData.status,
          type: invoiceData.type,
          reference: invoiceData.reference,
          customer_reference: invoiceData.customerReference,
          notes: invoiceData.notes,
          payment_terms: invoiceData.paymentTerms,
          currency: invoiceData.currency,
          language: invoiceData.language,
          total_net: invoiceData.totalNet,
          total_tax: invoiceData.totalTax,
          total_gross: invoiceData.totalGross,
          is_credit: invoiceData.isCredit,
          user_id: user.id
        })
        .select(`
          *,
          customer:customers(*)
        `)
        .single();

      if (error) throw error;

      const newInvoice = transformInvoice(data);
      setInvoices([...invoices, newInvoice]);
      toast({
        title: "Faktura skapad",
        description: `Faktura #${newInvoice.invoiceNumber} har skapats`,
      });
      return newInvoice;
    } catch (error) {
      console.error('Error adding invoice:', error);
      toast({
        title: "Fel vid skapande av faktura",
        description: "Kunde inte skapa fakturan. Försök igen senare.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInvoice = async (updatedInvoice: Invoice) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('invoices')
        .update({
          invoice_number: updatedInvoice.invoiceNumber,
          customer_id: updatedInvoice.customer.id,
          date: updatedInvoice.date,
          due_date: updatedInvoice.dueDate,
          items: updatedInvoice.items as any,
          status: updatedInvoice.status,
          type: updatedInvoice.type,
          reference: updatedInvoice.reference,
          customer_reference: updatedInvoice.customerReference,
          notes: updatedInvoice.notes,
          payment_terms: updatedInvoice.paymentTerms,
          currency: updatedInvoice.currency,
          language: updatedInvoice.language,
          total_net: updatedInvoice.totalNet,
          total_tax: updatedInvoice.totalTax,
          total_gross: updatedInvoice.totalGross,
          is_credit: updatedInvoice.isCredit
        })
        .eq('id', updatedInvoice.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setInvoices(invoices.map(invoice => 
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      ));
      toast({
        title: "Faktura uppdaterad",
        description: `Faktura #${updatedInvoice.invoiceNumber} har uppdaterats`,
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Fel vid uppdatering av faktura",
        description: "Kunde inte uppdatera fakturan. Försök igen senare.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const invoice = invoices.find(i => i.id === id);
      if (!invoice) throw new Error('Invoice not found');

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setInvoices(invoices.filter(invoice => invoice.id !== id));
      toast({
        title: "Faktura borttagen",
        description: `Faktura #${invoice.invoiceNumber} har tagits bort`,
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Fel vid borttagning av faktura",
        description: "Kunde inte ta bort fakturan. Försök igen senare.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const lastInvoice = invoices
      .filter(invoice => invoice.invoiceNumber.startsWith(year.toString()))
      .sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber))[0];

    if (!lastInvoice) {
      return `${year}0001`;
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4));
    return `${year}${String(lastNumber + 1).padStart(4, '0')}`;
  };

  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          org_number: customerData.orgNumber,
          vat_number: customerData.vatNumber,
          address: JSON.stringify(customerData.address),
          contact: JSON.stringify(customerData.contact),
          reference: customerData.reference,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newCustomer = transformCustomer(data);
      setCustomers([...customers, newCustomer]);
      toast({
        title: "Kund tillagd",
        description: `${newCustomer.name} har lagts till i kundregistret`,
      });
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Fel vid skapande av kund",
        description: "Kunde inte skapa kunden. Försök igen senare.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCustomer = async (updatedCustomer: Customer): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('customers')
        .update({
          name: updatedCustomer.name,
          org_number: updatedCustomer.orgNumber,
          vat_number: updatedCustomer.vatNumber,
          address: JSON.stringify(updatedCustomer.address),
          contact: JSON.stringify(updatedCustomer.contact),
          reference: updatedCustomer.reference
        })
        .eq('id', updatedCustomer.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomers(customers.map(customer => 
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      ));
      toast({
        title: "Kund uppdaterad",
        description: `${updatedCustomer.name} har uppdaterats`,
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Fel vid uppdatering av kund",
        description: "Kunde inte uppdatera kunden. Försök igen senare.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated');

      const customer = customers.find(c => c.id === id);
      if (!customer) throw new Error('Customer not found');

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomers(customers.filter(customer => customer.id !== id));
      toast({
        title: "Kund borttagen",
        description: `${customer.name} har tagits bort från kundregistret`,
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Fel vid borttagning av kund",
        description: "Kunde inte ta bort kunden. Försök igen senare.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      customers,
      invoices,
      invoiceItems,
      setInvoices,
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
