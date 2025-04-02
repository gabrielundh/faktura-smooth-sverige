
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice } from '@/types';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Search, Trash2 } from 'lucide-react';
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

const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
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
        const transformedInvoices: Invoice[] = data.map(item => ({
          id: item.id,
          invoiceNumber: item.invoice_number,
          customer: item.customer,
          date: item.date,
          dueDate: item.due_date,
          items: item.items || [],
          status: item.status,
          type: item.type,
          reference: item.reference,
          customerReference: item.customer_reference,
          notes: item.notes,
          paymentTerms: item.payment_terms,
          currency: item.currency,
          language: item.language,
          totalNet: item.total_net,
          totalTax: item.total_tax,
          totalGross: item.total_gross,
          isCredit: item.is_credit
        }));
        
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
  
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(search.toLowerCase());
      
    if (filter === 'all') return matchesSearch;
    return matchesSearch && invoice.status === filter;
  });
  
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
        setInvoices(invoices.filter(invoice => invoice.id !== invoiceToDelete));
        
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
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
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
          <Link to="/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            Skapa ny faktura
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Sök fakturor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrera status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="draft">Utkast</SelectItem>
              <SelectItem value="sent">Skickad</SelectItem>
              <SelectItem value="paid">Betald</SelectItem>
              <SelectItem value="late">Försenad</SelectItem>
              <SelectItem value="cancelled">Makulerad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-gray-200 border-t-invoice-700 animate-spin mb-4"></div>
          <h3 className="text-lg font-medium text-gray-700">Laddar fakturor...</h3>
        </div>
      ) : filteredInvoices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onDelete={handleDeleteClick}
              onPrint={handlePrint}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">Inga fakturor hittades</h3>
          <p className="text-gray-500 mt-1">
            {search || filter !== 'all' 
              ? 'Prova att ändra din sökning eller filter' 
              : 'Börja genom att skapa din första faktura'}
          </p>
          {!search && filter === 'all' && (
            <Button asChild className="mt-4 bg-invoice-700 hover:bg-invoice-800">
              <Link to="/invoices/new">
                <Plus className="h-4 w-4 mr-2" />
                Skapa ny faktura
              </Link>
            </Button>
          )}
        </div>
      )}

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
