
import React from 'react';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import { FileText } from 'lucide-react';

const CreateInvoicePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <FileText className="h-5 w-5 mr-2 text-invoice-700" />
        <h1 className="text-2xl font-bold tracking-tight">Skapa ny faktura</h1>
      </div>
      
      <InvoiceForm />
    </div>
  );
};

export default CreateInvoicePage;
