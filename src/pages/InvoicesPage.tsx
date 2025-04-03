import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Search, Trash2, Filter, SortDesc, SortAsc } from 'lucide-react';
import InvoiceCard from '@/components/invoices/InvoiceCard';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import InvoicePDF from '@/components/invoices/InvoicePDF';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import InvoiceListItem from '@/components/invoices/InvoiceListItem';

type SortField = 'date' | 'dueDate' | 'totalGross' | 'status';
type SortDirection = 'asc' | 'desc';

const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { invoices, customers, setInvoices } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus[]>([]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [pdfInvoice, setPdfInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);
  
  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('user_id', user?.id || '');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the data to match our Invoice type
        const transformedInvoices: Invoice[] = data.map(item => {
          // Transform customer data
          const customerData = item.customer || {};
          const transformedCustomer = {
            id: customerData.id || '',
            name: customerData.name || '',
            orgNumber: customerData.org_number || '',
            vatNumber: customerData.vat_number || '',
            address: typeof customerData.address === 'string' 
              ? JSON.parse(customerData.address) 
              : customerData.address || { street: '', postalCode: '', city: '', country: '' },
            contact: typeof customerData.contact === 'string' 
              ? JSON.parse(customerData.contact) 
              : customerData.contact || { email: '', phone: '' },
            reference: customerData.reference || '',
            userId: customerData.user_id || ''
          };
          
          // Transform invoice items
          const parsedItems: InvoiceItem[] = Array.isArray(item.items) 
            ? item.items.map((itm: any) => ({
                id: itm.id || `item-${Date.now()}`,
                description: itm.description || '',
                quantity: Number(itm.quantity) || 0,
                unit: itm.unit || 'st',
                price: Number(itm.price) || 0,
                taxRate: Number(itm.taxRate) || 0,
                articleNumber: itm.articleNumber || ''
              }))
            : [];
          
          return {
            id: item.id,
            invoiceNumber: item.invoice_number,
            customer: transformedCustomer,
            date: item.date,
            dueDate: item.due_date,
            items: parsedItems,
            status: (item.status || 'draft') as InvoiceStatus,
            type: (item.type || 'invoice') as 'invoice' | 'credit',
            reference: item.reference,
            customerReference: item.customer_reference,
            notes: item.notes,
            paymentTerms: item.payment_terms,
            currency: item.currency,
            language: item.language as 'sv' | 'en',
            totalNet: item.total_net,
            totalTax: item.total_tax,
            totalGross: item.total_gross,
            isCredit: item.is_credit
          };
        });
        
        setInvoices(transformedInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Fel vid hämtning av fakturor",
        description: "Kunde inte ladda dina fakturor. Försök igen senare.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter invoices based on search term and status filter
  const filteredInvoices = invoices.filter(invoice => {
    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes(invoice.status)) {
      return false;
    }
    
    // Search filter
    const customer = customers.find(c => c.id === invoice.customer.id);
    const searchTerms = search.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchTerms) ||
      (customer && customer.name.toLowerCase().includes(searchTerms)) ||
      format(parseISO(invoice.date), 'yyyy-MM-dd').includes(searchTerms) ||
      format(parseISO(invoice.dueDate), 'yyyy-MM-dd').includes(searchTerms) ||
      invoice.totalGross.toString().includes(searchTerms)
    );
  });
  
  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortField === 'date' || sortField === 'dueDate') {
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    } else if (sortField === 'totalGross') {
      return sortDirection === 'asc' 
        ? a.totalGross - b.totalGross 
        : b.totalGross - a.totalGross;
    } else if (sortField === 'status') {
      const statusOrder: Record<InvoiceStatus, number> = { 
        'paid': 0, 
        'sent': 1, 
        'draft': 2, 
        'late': 3, 
        'cancelled': 4 
      };
      const statusA = statusOrder[a.status] || 5;
      const statusB = statusOrder[b.status] || 5;
      return sortDirection === 'asc' 
        ? statusA - statusB 
        : statusB - statusA;
    }
    
    return 0;
  });
  
  const toggleStatusFilter = (status: InvoiceStatus) => {
    setStatusFilter(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  const clearFilters = () => {
    setStatusFilter([]);
    setSearch('');
  };
  
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <SortAsc className="h-4 w-4 ml-1" />
    ) : (
      <SortDesc className="h-4 w-4 ml-1" />
    );
  };
  
  const handleDeleteConfirm = async () => {
    if (invoiceToDelete) {
      try {
        const { error } = await supabase
          .from('invoices')
          .delete()
          .eq('id', invoiceToDelete);
        
        if (error) {
          throw error;
        }
        
        // Remove from local state
        const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceToDelete);
        setInvoices(updatedInvoices);
        
        toast({
          title: "Faktura borttagen",
          description: "Fakturan har tagits bort",
        });
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast({
          title: "Fel vid borttagning",
          description: "Kunde inte ta bort fakturan. Försök igen senare.",
          variant: "destructive"
        });
      } finally {
        setInvoiceToDelete(null);
      }
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id);
  };
  
  const handlePrint = (invoice: Invoice) => {
    setPdfInvoice(invoice);
    setTimeout(() => {
      window.print();
      setPdfInvoice(null);
    }, 100);
  };
  
  const handleDownload = async (invoice: Invoice) => {
    setPdfInvoice(invoice);
    
    setTimeout(async () => {
      try {
        const element = document.getElementById('invoice-pdf');
        if (!element) return;
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Define page dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Render to canvas with high resolution
        const canvas = await html2canvas(element, {
          scale: 4, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        // Get canvas dimensions
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Scale to fit A4 page width while maintaining aspect ratio
        const scaleFactor = pageWidth / canvasWidth;
        const scaledHeight = canvasHeight * scaleFactor;
        
        // Add each page (if content overflows A4 height)
        let heightLeft = scaledHeight;
        let position = 0;
        let page = 1;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, scaledHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if content overflows
        while (heightLeft > 0) {
          position = -pageHeight * page;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pageWidth, scaledHeight);
          heightLeft -= pageHeight;
          page++;
        }
        
        pdf.save(`faktura-${invoice.invoiceNumber}.pdf`);
        setPdfInvoice(null);
      } catch (error) {
        console.error('Error generating PDF:', error);
        setPdfInvoice(null);
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-invoice-700" />
          <h1 className="text-2xl font-bold tracking-tight">Fakturor</h1>
        </div>
        <Button asChild className="bg-invoice-700 hover:bg-invoice-800">
          <Link to="/app/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            Skapa ny faktura
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Sök fakturor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {statusFilter.length > 0 && (
                <Badge className="ml-2 bg-invoice-700">{statusFilter.length}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <div className="font-medium mb-2">Status</div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status-draft"
                    checked={statusFilter.includes('draft')}
                    onChange={() => toggleStatusFilter('draft')}
                    className="mr-2"
                  />
                  <label htmlFor="status-draft" className="text-sm cursor-pointer">Utkast</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status-sent"
                    checked={statusFilter.includes('sent')}
                    onChange={() => toggleStatusFilter('sent')}
                    className="mr-2"
                  />
                  <label htmlFor="status-sent" className="text-sm cursor-pointer">Skickad</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status-paid"
                    checked={statusFilter.includes('paid')}
                    onChange={() => toggleStatusFilter('paid')}
                    className="mr-2"
                  />
                  <label htmlFor="status-paid" className="text-sm cursor-pointer">Betald</label>
                </div>
              </div>
              
              {(statusFilter.length > 0 || search) && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-xs h-8"
                  onClick={clearFilters}
                >
                  Rensa filter
                </Button>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-white overflow-hidden rounded-md border">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-invoice-700 animate-spin mb-4"></div>
            <h3 className="text-lg font-medium text-gray-700">Laddar fakturor...</h3>
          </div>
        ) : sortedInvoices.length > 0 ? (
          <div>
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-500">
              <div className="col-span-5 sm:col-span-3 flex items-center cursor-pointer" onClick={() => toggleSort('date')}>
                <span>Faktura</span>
                <SortIcon field="date" />
              </div>
              <div className="hidden sm:flex col-span-2 items-center cursor-pointer" onClick={() => toggleSort('dueDate')}>
                <span>Förfallodatum</span>
                <SortIcon field="dueDate" />
              </div>
              <div className="col-span-4 sm:col-span-2">Kund</div>
              <div className="hidden sm:flex col-span-2 items-center justify-end cursor-pointer" onClick={() => toggleSort('totalGross')}>
                <span>Belopp</span>
                <SortIcon field="totalGross" />
              </div>
              <div className="col-span-3 sm:col-span-2 flex items-center justify-end cursor-pointer" onClick={() => toggleSort('status')}>
                <span>Status</span>
                <SortIcon field="status" />
              </div>
              <div className="hidden sm:block col-span-1"></div>
            </div>
            
            <div>
              {sortedInvoices.map(invoice => (
                <InvoiceListItem 
                  key={invoice.id} 
                  invoice={invoice} 
                  customer={customers.find(c => c.id === invoice.customer.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">Inga fakturor hittades</h3>
            <p className="text-gray-500 mt-1 mb-4">
              {search || statusFilter.length > 0
                ? 'Prova att ändra dina sökkriterier eller filter'
                : 'Kom igång med att skapa din första faktura'}
            </p>
            
            {!(search || statusFilter.length > 0) && (
              <Button asChild className="bg-invoice-700 hover:bg-invoice-800">
                <Link to="/app/invoices/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Skapa faktura
                </Link>
              </Button>
            )}
            
            {(search || statusFilter.length > 0) && (
              <Button variant="outline" onClick={clearFilters}>
                Rensa filter
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna åtgärd kan inte ångras. Detta kommer permanent ta bort fakturan från systemet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {pdfInvoice && (
        <div id="invoice-pdf" className="hidden print:block">
          <InvoicePDF invoice={pdfInvoice} />
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
