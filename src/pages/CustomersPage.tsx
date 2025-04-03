import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Search } from 'lucide-react';
import CustomerCard from '@/components/customers/CustomerCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CustomersPage: React.FC = () => {
  const { customers, deleteCustomer } = useData();
  const [search, setSearch] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    (customer.contact.email && customer.contact.email.toLowerCase().includes(search.toLowerCase()))
  );
  
  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete);
      setCustomerToDelete(null);
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-invoice-700" />
          <h1 className="text-2xl font-bold tracking-tight">Kunder</h1>
        </div>
        <Button asChild className="bg-invoice-700 hover:bg-invoice-800">
          <Link to="/app/customers/new">
            <Plus className="h-4 w-4 mr-2" />
            Lägg till ny kund
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Sök kunder..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Inga kunder hittades</h3>
          <p className="text-gray-500 mt-1">
            {search
              ? 'Prova att ändra din sökning'
              : 'Börja genom att lägga till din första kund'}
          </p>
          {!search && (
            <Button asChild className="mt-4 bg-invoice-700 hover:bg-invoice-800">
              <Link to="/app/customers/new">
                <Plus className="h-4 w-4 mr-2" />
                Lägg till ny kund
              </Link>
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna åtgärd kan inte ångras. Detta kommer permanent ta bort kunden och all relaterad information från systemet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomersPage;
