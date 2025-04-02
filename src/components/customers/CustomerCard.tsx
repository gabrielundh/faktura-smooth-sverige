
import React from 'react';
import { Customer } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Building, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CustomerCardProps {
  customer: Customer;
  onDelete: (id: string) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onDelete }) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Building className="h-8 w-8 mr-3 text-invoice-600" />
            <div>
              <h3 className="font-semibold text-md">{customer.name}</h3>
              {customer.orgNumber && (
                <p className="text-sm text-gray-600">Org.nr: {customer.orgNumber}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <div>
              <p className="text-sm">{customer.address.street}</p>
              <p className="text-sm">{customer.address.postalCode} {customer.address.city}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-sm">{customer.contact.email}</p>
          </div>
          
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-sm">{customer.contact.phone}</p>
          </div>
          
          {customer.reference && (
            <p className="text-sm mt-2">
              <span className="font-medium">Referens:</span> {customer.reference}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 bg-gray-50 border-t flex justify-end space-x-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/edit/${customer.id}`)}>
          <Edit className="h-4 w-4 mr-1" />
          Redigera
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => onDelete(customer.id)}>
          <Trash2 className="h-4 w-4 mr-1" />
          Ta bort
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomerCard;
