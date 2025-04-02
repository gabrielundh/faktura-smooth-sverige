
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import CustomerForm from '@/components/customers/CustomerForm';
import { Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customers } = useData();
  const navigate = useNavigate();
  
  const customer = customers.find(c => c.id === id);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="bg-amber-100 p-3 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Kund hittades inte</h2>
          <p className="text-gray-600 mb-6">
            Kunden du försöker redigera kan ha raderats eller existerar inte.
          </p>
          <Button 
            onClick={() => navigate('/customers')} 
            className="bg-invoice-700 hover:bg-invoice-800"
          >
            Tillbaka till kunder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Users className="h-5 w-5 mr-2 text-invoice-700" />
        <h1 className="text-2xl font-bold tracking-tight">Redigera kund - {customer.name}</h1>
      </div>
      
      <CustomerForm existingCustomer={customer} />
    </div>
  );
};

export default EditCustomerPage;
