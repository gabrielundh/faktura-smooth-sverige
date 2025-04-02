
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, CreditCard, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { invoices, customers } = useData();

  // Beräkna statistik
  const totalInvoices = invoices.length;
  const totalCustomers = customers.length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'sent').length;
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((acc, invoice) => acc + invoice.totalGross, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex space-x-3">
          <Button asChild className="bg-invoice-700 hover:bg-invoice-800">
            <Link to="/invoices/new">Skapa ny faktura</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/customers/new">Lägg till kund</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totala intäkter</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} kr</div>
            <p className="text-xs text-muted-foreground">Från betalda fakturor</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fakturor</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">{pendingInvoices} väntande fakturor</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Aktiva kunder</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Betalningsgrad</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInvoices > 0 
                ? Math.round((invoices.filter(i => i.status === 'paid').length / totalInvoices) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Andel betalda fakturor</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Senaste fakturorna</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map(invoice => (
                    <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <h3 className="text-sm font-medium">#{invoice.invoiceNumber}</h3>
                        <p className="text-xs text-gray-500">{invoice.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{invoice.totalGross.toFixed(2)} kr</p>
                        <p className="text-xs text-gray-500">{invoice.date}</p>
                      </div>
                    </div>
                  ))}
                <div className="pt-2">
                  <Button asChild variant="link" className="p-0 text-invoice-700">
                    <Link to="/invoices">Visa alla fakturor</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Inga fakturor skapade ännu</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Senaste kunderna</CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length > 0 ? (
              <div className="space-y-2">
                {customers.slice(0, 5).map(customer => (
                  <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <h3 className="text-sm font-medium">{customer.name}</h3>
                      <p className="text-xs text-gray-500">{customer.contact.email}</p>
                    </div>
                    <p className="text-xs text-gray-500">{customer.address.city}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <Button asChild variant="link" className="p-0 text-invoice-700">
                    <Link to="/customers">Visa alla kunder</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Inga kunder tillagda ännu</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Välkommen till FakturaSmooth</h2>
        <p className="mb-4">
          Du är inloggad som {user?.company.name}. Detta är ett enkelt faktureringssystem som hjälper dig 
          att skapa professionella fakturor som uppfyller svenska lagar och regler.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-invoice-700 hover:bg-invoice-800">
            <Link to="/invoices/new">Skapa ny faktura</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/customers/new">Lägg till kund</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings">Inställningar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
