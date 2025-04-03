import React from 'react';
import { Invoice, Customer } from '@/types';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Edit, Download, Printer, Trash2 } from 'lucide-react';

interface InvoiceListItemProps {
  invoice: Invoice;
  customer?: Customer;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'sent':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'paid':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
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
    default:
      return status;
  }
};

const InvoiceListItem: React.FC<InvoiceListItemProps> = ({ invoice, customer }) => {
  return (
    <div className="border-b hover:bg-gray-50">
      <div className="grid grid-cols-12 gap-4 p-4 items-center">
        <div className="col-span-5 sm:col-span-3">
          <Link to={`/app/invoices/${invoice.id}`} className="font-medium hover:text-invoice-700 hover:underline">
            #{invoice.invoiceNumber}
          </Link>
          <p className="text-sm text-gray-500">{format(parseISO(invoice.date), 'yyyy-MM-dd')}</p>
        </div>
        
        <div className="hidden sm:block col-span-2">
          <p className="text-sm">{format(parseISO(invoice.dueDate), 'yyyy-MM-dd')}</p>
        </div>
        
        <div className="col-span-4 sm:col-span-2">
          <p className="text-sm font-medium truncate">{invoice.customer.name}</p>
        </div>
        
        <div className="hidden sm:block col-span-2 text-right">
          <p className="text-sm font-medium">{invoice.totalGross.toFixed(2)} {invoice.currency}</p>
        </div>
        
        <div className="col-span-3 sm:col-span-2 text-right">
          <Badge className={`text-xs ${getStatusColor(invoice.status)}`}>
            {getStatusText(invoice.status)}
          </Badge>
        </div>
        
        <div className="col-span-0 sm:col-span-1 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/app/invoices/${invoice.id}`} className="cursor-pointer flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Visa
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/app/invoices/edit/${invoice.id}`} className="cursor-pointer flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Redigera
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Ladda ner PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <Printer className="mr-2 h-4 w-4" />
                Skriv ut
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Ta bort
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default InvoiceListItem; 