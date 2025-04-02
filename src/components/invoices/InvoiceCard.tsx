
import React from 'react';
import { Invoice } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Printer, Download, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
  onPrint: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onDelete, onPrint, onDownload }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Utkast';
      case 'sent':
        return 'Skickad';
      case 'paid':
        return 'Betald';
      case 'late':
        return 'Försenad';
      case 'cancelled':
        return 'Makulerad';
      default:
        return status;
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 mr-3 text-invoice-600" />
            <div>
              <h3 className="font-semibold text-md">#{invoice.invoiceNumber}</h3>
              <p className="text-sm text-gray-600">{invoice.customer.name}</p>
            </div>
          </div>
          <Badge className={getStatusColor(invoice.status)}>
            {getStatusText(invoice.status)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-500">Fakturadatum</p>
            <p className="text-sm">{format(parseISO(invoice.date), 'yyyy-MM-dd')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Förfallodag</p>
            <p className="text-sm">{format(parseISO(invoice.dueDate), 'yyyy-MM-dd')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Antal artiklar</p>
            <p className="text-sm">{invoice.items.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Belopp</p>
            <p className="text-sm font-semibold">{invoice.totalGross.toFixed(2)} {invoice.currency}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 bg-gray-50 border-t flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${invoice.id}`)}>
          <Eye className="h-4 w-4 mr-1" />
          <span className="sr-only md:not-sr-only">Visa</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/edit/${invoice.id}`)}>
          <Edit className="h-4 w-4 mr-1" />
          <span className="sr-only md:not-sr-only">Redigera</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onPrint(invoice)}>
          <Printer className="h-4 w-4 mr-1" />
          <span className="sr-only md:not-sr-only">Skriv ut</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDownload(invoice)}>
          <Download className="h-4 w-4 mr-1" />
          <span className="sr-only md:not-sr-only">Ladda ner</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDelete(invoice.id)}>
          <Trash2 className="h-4 w-4 mr-1" />
          <span className="sr-only md:not-sr-only">Ta bort</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InvoiceCard;
