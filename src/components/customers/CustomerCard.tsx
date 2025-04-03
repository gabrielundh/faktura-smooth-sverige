import React from 'react';
import { Link } from 'react-router-dom';
import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Edit, Mail, Phone, Trash2, MapPin, Building, FileText } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface CustomerCardProps {
  customer: Customer;
  onDelete: (id: string) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onDelete }) => {
  const { invoices } = useData();
  const customerInvoices = invoices.filter(invoice => invoice.customer.id === customer.id);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{customer.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Öppna meny</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/app/customers/edit/${customer.id}`} className="cursor-pointer flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Redigera kund
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/app/invoices/new?customer=${customer.id}`} className="cursor-pointer flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Skapa faktura
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer flex items-center"
                onClick={() => onDelete(customer.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Ta bort
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {customer.contact && (
          <div className="space-y-1">
            {customer.contact.email && (
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <a href={`mailto:${customer.contact.email}`} className="text-blue-600 hover:underline">
                  {customer.contact.email}
                </a>
              </div>
            )}
            {customer.contact.phone && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <a href={`tel:${customer.contact.phone}`} className="text-blue-600 hover:underline">
                  {customer.contact.phone}
                </a>
              </div>
            )}
          </div>
        )}
        
        {customer.address && (
          <div className="flex items-start text-sm">
            <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
            <div>
              {customer.address.street && <div>{customer.address.street}</div>}
              {(customer.address.postalCode || customer.address.city) && (
                <div>
                  {customer.address.postalCode} {customer.address.city}
                </div>
              )}
              {customer.address.country && <div>{customer.address.country}</div>}
            </div>
          </div>
        )}
        
        {customer.orgNumber && (
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 mr-2 text-gray-500" />
            <span>Org.nr: {customer.orgNumber}</span>
          </div>
        )}
        
        {customerInvoices.length > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-gray-500" />
              <span>{customerInvoices.length} faktura(or)</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0 gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/app/customers/edit/${customer.id}`}>
            <Edit className="h-4 w-4 mr-1" />
            Redigera
          </Link>
        </Button>
        <Button 
          asChild 
          size="sm" 
          className="flex-1 bg-invoice-700 hover:bg-invoice-800"
        >
          <Link to={`/app/invoices/new?customer=${customer.id}`}>
            <FileText className="h-4 w-4 mr-1" />
            Skapa faktura
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomerCard;
