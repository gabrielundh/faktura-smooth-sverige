
import React from 'react';
import CustomerForm from '@/components/customers/CustomerForm';
import { Users } from 'lucide-react';

const CreateCustomerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Users className="h-5 w-5 mr-2 text-invoice-700" />
        <h1 className="text-2xl font-bold tracking-tight">Lägg till ny kund</h1>
      </div>
      
      <CustomerForm />
    </div>
  );
};

export default CreateCustomerPage;
