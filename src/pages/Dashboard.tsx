import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { CreditCard, DollarSign, FileText, Users, Calendar, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, session } = useAuth();
  const { invoices, customers } = useData();
  const navigate = useNavigate();

  // Ensure user is authenticated
  useEffect(() => {
    if (!isAuthenticated && !session) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login');
    }
  }, [isAuthenticated, session, navigate]);

  // Show loading state if user data is not yet available
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-invoice-700 mb-4" />
        <p className="text-lg text-gray-600">Laddar användardata...</p>
      </div>
    );
  }

  // Calculate dashboard metrics
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.totalGross, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex space-x-3">
          <Button asChild className="bg-invoice-700 hover:bg-invoice-800">
            <Link to="/app/invoices/new">Skapa ny faktura</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/customers/new">Lägg till kund</Link>
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
            <CardTitle className="text-sm font-medium">Betalda</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">Avslutade fakturor</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Aktiva kundrelationer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Senaste fakturorna</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((invoice) => {
                    const customerName = customers.find(c => c.id === invoice.customer.id)?.name || 'Okänd kund';
                    return (
                      <div key={invoice.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-9 w-9 p-2 mr-2 bg-invoice-50 text-invoice-700 rounded-md" />
                          <div>
                            <Link
                              to={`/app/invoices/${invoice.id}`}
                              className="font-medium hover:underline"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                            <p className="text-sm text-muted-foreground">{customerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{invoice.totalGross.toLocaleString()} kr</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(invoice.date), { 
                              addSuffix: true,
                              locale: sv
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                <div className="mt-4 pt-4 border-t">
                  <Button asChild variant="ghost" size="sm" className="text-invoice-700 hover:text-invoice-800">
                    <Link to="/app/invoices">
                      Visa alla fakturor
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-muted-foreground">Inga fakturor skapade än</p>
                <Button asChild className="mt-4 bg-invoice-700 hover:bg-invoice-800">
                  <Link to="/app/invoices/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Skapa första fakturan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Senaste kunderna</CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length > 0 ? (
              <div className="space-y-4">
                {customers
                  .slice(0, 5)
                  .map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-9 w-9 p-2 mr-2 bg-invoice-50 text-invoice-700 rounded-md" />
                        <div>
                          <Link
                            to={`/app/customers/${customer.id}`}
                            className="font-medium hover:underline"
                          >
                            {customer.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {customer.contact?.email || customer.orgNumber || "Ingen kontaktinfo"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="mt-4 pt-4 border-t">
                  <Button asChild variant="ghost" size="sm" className="text-invoice-700 hover:text-invoice-800">
                    <Link to="/app/customers">
                      Visa alla kunder
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-muted-foreground">Inga kunder tillagda än</p>
                <Button asChild className="mt-4 bg-invoice-700 hover:bg-invoice-800">
                  <Link to="/app/customers/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Lägg till första kunden
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Välkommen till FakturaSmooth</h2>
        <p className="mb-4">
          Du är inloggad som {user?.company?.name || user?.email}. Detta är ett enkelt faktureringssystem som hjälper dig 
          att skapa professionella fakturor som uppfyller svenska lagar och regler.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-invoice-700 hover:bg-invoice-800">
            <Link to="/app/invoices/new">Skapa ny faktura</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/customers/new">Lägg till kund</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/settings">Inställningar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
