
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import { FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices } = useData();
  const navigate = useNavigate();
  
  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="bg-amber-100 p-3 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Faktura hittades inte</h2>
          <p className="text-gray-600 mb-6">
            Fakturan du försöker redigera kan ha raderats eller existerar inte.
          </p>
          <Button 
            onClick={() => navigate('/invoices')} 
            className="bg-invoice-700 hover:bg-invoice-800"
          >
            Tillbaka till fakturor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <FileText className="h-5 w-5 mr-2 text-invoice-700" />
        <h1 className="text-2xl font-bold tracking-tight">Redigera faktura #{invoice.invoiceNumber}</h1>
      </div>
      
      <InvoiceForm existingInvoice={invoice} />
    </div>
  );
};

export default EditInvoicePage;
