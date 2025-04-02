
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Customer, InvoiceItem, Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InvoiceFormProps {
  existingInvoice?: Invoice;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ existingInvoice }) => {
  const { customers, addInvoice, updateInvoice, generateInvoiceNumber } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(existingInvoice?.customer || null);
  const [items, setItems] = useState<Partial<InvoiceItem>[]>(existingInvoice?.items || [{ id: `item-${Date.now()}`, quantity: 1, taxRate: user?.company.taxRate || 25 }]);
  const [invoiceNumber, setInvoiceNumber] = useState(existingInvoice?.invoiceNumber || generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(existingInvoice?.date || format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(existingInvoice?.dueDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState(existingInvoice?.notes || '');
  const [paymentTerms, setPaymentTerms] = useState(existingInvoice?.paymentTerms || '30 dagar');
  const [currency, setCurrency] = useState(existingInvoice?.currency || 'SEK');
  const [reference, setReference] = useState(existingInvoice?.reference || '');
  
  const [totalNet, setTotalNet] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [totalGross, setTotalGross] = useState(0);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const calculateTotals = () => {
    let net = 0;
    let tax = 0;

    items.forEach(item => {
      if (item.quantity && item.price) {
        const lineTotal = item.quantity * item.price;
        net += lineTotal;
        tax += lineTotal * ((item.taxRate || 0) / 100);
      }
    });

    setTotalNet(net);
    setTotalTax(tax);
    setTotalGross(net + tax);
  };

  const addItem = () => {
    setItems([...items, { id: `item-${Date.now()}`, quantity: 1, taxRate: user?.company.taxRate || 25 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast({
        title: "Fel",
        description: "Du måste välja en kund",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Fel",
        description: "Du måste lägga till minst en artikel",
        variant: "destructive"
      });
      return;
    }

    // Kontrollera att alla artiklar har nödvändig information
    const invalidItems = items.filter(item => 
      !item.description || 
      !item.quantity || 
      !item.price || 
      !item.unit);

    if (invalidItems.length > 0) {
      toast({
        title: "Fel",
        description: "En eller flera artiklar saknar nödvändig information",
        variant: "destructive"
      });
      return;
    }

    const invoiceData: Omit<Invoice, 'id'> = {
      invoiceNumber,
      customer: selectedCustomer,
      date: invoiceDate,
      dueDate,
      items: items as InvoiceItem[],
      status: 'draft',
      type: 'invoice',
      reference,
      customerReference: selectedCustomer.reference,
      notes,
      paymentTerms,
      currency,
      language: 'sv',
      totalNet,
      totalTax,
      totalGross,
      isCredit: false
    };

    if (existingInvoice) {
      updateInvoice({
        ...invoiceData,
        id: existingInvoice.id
      });
    } else {
      addInvoice(invoiceData);
    }

    navigate('/invoices');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="invoice-section">
          <h3 className="text-md font-semibold mb-4">Företagsuppgifter</h3>
          {user?.company && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{user.company.name}</p>
              <p className="text-sm">Org.nr: {user.company.orgNumber}</p>
              <p className="text-sm">Moms.nr: {user.company.vatNumber}</p>
              <p className="text-sm">{user.company.address.street}</p>
              <p className="text-sm">{user.company.address.postalCode} {user.company.address.city}</p>
              <p className="text-sm">Tel: {user.company.contact.phone}</p>
              <p className="text-sm">E-post: {user.company.contact.email}</p>
            </div>
          )}
        </div>
        
        <div className="invoice-section">
          <h3 className="text-md font-semibold mb-4">Fakturauppgifter</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="invoiceNumber" className="invoice-label">Fakturanummer</Label>
              <Input 
                id="invoiceNumber" 
                value={invoiceNumber} 
                onChange={(e) => setInvoiceNumber(e.target.value)} 
                className="invoice-field"
                required 
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate" className="invoice-label">Fakturadatum</Label>
              <Input 
                id="invoiceDate" 
                type="date" 
                value={invoiceDate} 
                onChange={(e) => setInvoiceDate(e.target.value)} 
                className="invoice-field"
                required 
              />
            </div>
            <div>
              <Label htmlFor="dueDate" className="invoice-label">Förfallodatum</Label>
              <Input 
                id="dueDate" 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className="invoice-field"
                required 
              />
            </div>
            <div>
              <Label htmlFor="paymentTerms" className="invoice-label">Betalningsvillkor</Label>
              <Input 
                id="paymentTerms" 
                value={paymentTerms} 
                onChange={(e) => setPaymentTerms(e.target.value)} 
                className="invoice-field"
                required 
              />
            </div>
            <div>
              <Label htmlFor="reference" className="invoice-label">Er referens</Label>
              <Input 
                id="reference" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)} 
                className="invoice-field" 
              />
            </div>
          </div>
        </div>

        <div className="invoice-section">
          <h3 className="text-md font-semibold mb-4">Kunduppgifter</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="customer" className="invoice-label">Välj kund</Label>
              <Select 
                onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  setSelectedCustomer(customer || null);
                }}
                value={selectedCustomer?.id}
              >
                <SelectTrigger id="customer" className="invoice-field">
                  <SelectValue placeholder="Välj kund" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCustomer && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">{selectedCustomer.name}</p>
                {selectedCustomer.orgNumber && (
                  <p className="text-sm">Org.nr: {selectedCustomer.orgNumber}</p>
                )}
                <p className="text-sm">{selectedCustomer.address.street}</p>
                <p className="text-sm">{selectedCustomer.address.postalCode} {selectedCustomer.address.city}</p>
                {selectedCustomer.reference && (
                  <p className="text-sm">Referens: {selectedCustomer.reference}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="invoice-section">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-semibold">Artiklar</h3>
          <Button type="button" onClick={addItem} size="sm" className="bg-invoice-700 hover:bg-invoice-800">
            <Plus className="h-4 w-4 mr-1" />
            Lägg till artikel
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full invoice-table">
            <thead>
              <tr>
                <th>Artikelnr</th>
                <th>Beskrivning</th>
                <th>Antal</th>
                <th>Enhet</th>
                <th>Pris</th>
                <th>
                  <div className="flex items-center">
                    Moms %
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Momssats i procent</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </th>
                <th>Summa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <Input 
                      value={item.articleNumber || ''} 
                      onChange={(e) => updateItem(index, 'articleNumber', e.target.value)} 
                      className="invoice-field" 
                    />
                  </td>
                  <td>
                    <Input 
                      value={item.description || ''} 
                      onChange={(e) => updateItem(index, 'description', e.target.value)} 
                      className="invoice-field" 
                      required 
                    />
                  </td>
                  <td className="w-20">
                    <Input 
                      type="number" 
                      min="0" 
                      step="1" 
                      value={item.quantity || ''} 
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} 
                      className="invoice-field" 
                      required 
                    />
                  </td>
                  <td className="w-20">
                    <Input 
                      value={item.unit || ''} 
                      onChange={(e) => updateItem(index, 'unit', e.target.value)} 
                      className="invoice-field" 
                      required 
                      placeholder="st"
                    />
                  </td>
                  <td className="w-28">
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={item.price || ''} 
                      onChange={(e) => updateItem(index, 'price', Number(e.target.value))} 
                      className="invoice-field" 
                      required 
                    />
                  </td>
                  <td className="w-20">
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={item.taxRate || ''} 
                      onChange={(e) => updateItem(index, 'taxRate', Number(e.target.value))} 
                      className="invoice-field" 
                      required 
                    />
                  </td>
                  <td className="w-28 text-right font-medium">
                    {(item.quantity && item.price) 
                      ? `${(item.quantity * item.price).toFixed(2)} ${currency}`
                      : '-'
                    }
                  </td>
                  <td>
                    <Button 
                      type="button" 
                      onClick={() => removeItem(index)} 
                      variant="ghost" 
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Netto:</span>
              <span>{totalNet.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span>Moms:</span>
              <span>{totalTax.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Summa att betala:</span>
              <span>{totalGross.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="invoice-section">
        <h3 className="text-md font-semibold mb-4">Meddelande på fakturan</h3>
        <Textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          className="invoice-field" 
          rows={3} 
          placeholder="T.ex. tack för ditt köp..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>Avbryt</Button>
        <Button type="submit" className="bg-invoice-700 hover:bg-invoice-800">
          {existingInvoice ? 'Uppdatera faktura' : 'Skapa faktura'}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
