import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, User, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const LandingPage: React.FC = () => {
  const invoicePdfRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    companyName: string;
    invoiceNumber: string;
    customerNumber: string;
    date: string;
    paymentTerms: string;
    dueDate: string;
    yourReference: string;
    customerReference: string;
    customerName: string;
    customerAddress1: string;
    customerAddress2: string;
    productDescription: string;
    quantity: string;
    price: string;
    sellerName: string;
    sellerAddress1: string;
    sellerAddress2: string;
    sellerPhone: string;
    sellerEmail: string;
    sellerWebsite: string;
    sellerOrgNumber: string;
    sellerVatNumber: string;
    sellerBankgiro: string;
    sellerBankName: string;
    sellerClearingNumber: string;
    sellerAccountNumber: string;
  }>({
    companyName: '',
    invoiceNumber: '',
    customerNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentTerms: '',
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    yourReference: '',
    customerReference: '',
    customerName: '',
    customerAddress1: '',
    customerAddress2: '',
    productDescription: '',
    quantity: '',
    price: '',
    sellerName: '',
    sellerAddress1: '',
    sellerAddress2: '',
    sellerPhone: '',
    sellerEmail: '',
    sellerWebsite: '',
    sellerOrgNumber: '',
    sellerVatNumber: '',
    sellerBankgiro: '',
    sellerBankName: '',
    sellerClearingNumber: '',
    sellerAccountNumber: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate totals - use memoization to reduce recalculations
  const { quantity, price, netAmount, vatAmount, totalAmount } = useMemo(() => {
    const qty = parseInt(invoiceData.quantity) || 0;
    const prc = parseFloat(invoiceData.price) || 0;
    const net = qty * prc;
    const vat = net * 0.25; // 25% VAT
    const total = net + vat;
    
    return {
      quantity: qty,
      price: prc,
      netAmount: net,
      vatAmount: vat,
      totalAmount: total
    };
  }, [invoiceData.quantity, invoiceData.price]);

  const handleDownloadPDF = async () => {
    if (invoicePdfRef.current && !isGeneratingPdf) {
      setIsGeneratingPdf(true);
      try {
        // Create a clone of the invoice element for PDF generation
        const originalElement = invoicePdfRef.current;
        const clonedElement = originalElement.cloneNode(true) as HTMLElement;
        
        // Apply styles to make it look good in the PDF
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '-9999px';
        document.body.appendChild(clonedElement);
        
        // Process all input elements in the clone
        const inputs = clonedElement.querySelectorAll('input');
        inputs.forEach(input => {
          const originalInput = input as HTMLInputElement;
          
          // Only use value if it exists (not placeholder text)
          if (originalInput.value) {
            // Create a new span element to replace the input
            const span = document.createElement('span');
            span.textContent = originalInput.value;
            span.style.display = 'inline-block';
            span.style.width = '100%';
            
            // Copy some styles from the input
            if (originalInput.classList.contains('text-center')) {
              span.style.textAlign = 'center';
            }
            if (originalInput.classList.contains('text-right')) {
              span.style.textAlign = 'right';
            }
            if (originalInput.classList.contains('font-bold')) {
              span.style.fontWeight = 'bold';
            }
            
            // Replace the input with the span
            originalInput.parentNode?.replaceChild(span, originalInput);
          } else {
            // If no value, create an empty span
            const span = document.createElement('span');
            span.textContent = '';
            span.style.display = 'inline-block';
            span.style.width = '100%';
            originalInput.parentNode?.replaceChild(span, originalInput);
          }
        });
        
        // Generate PDF from the clone
        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        // Remove the clone from the DOM
        document.body.removeChild(clonedElement);
        
        const imgData = canvas.toDataURL('image/png');
        
        // A4 size: 210 x 297 mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`faktura-${invoiceData.invoiceNumber || 'ny'}.pdf`);
        
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Ett fel uppstod vid generering av PDF. Försök igen.');
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-invoice-700 mr-2" />
            <h1 className="text-2xl font-bold text-invoice-700">FakturaSmooth</h1>
          </div>
          <div className="flex space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/login" className="flex items-center">
                <LogIn className="h-4 w-4 mr-2" />
                Logga in
              </Link>
            </Button>
            <Button asChild className="bg-invoice-700 hover:bg-invoice-800" size="sm">
              <Link to="/login?tab=signup" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Skapa konto
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Skapa fakturor snabbt och enkelt</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              FakturaSmooth är en gratis tjänst för att skapa professionella fakturor på några sekunder.
              Inga krångliga program, inga dolda avgifter. Ändra i mallen nedan och ladda ner din faktura.
            </p>
          </div>

          <div className="flex justify-end mb-4">
            <Button 
              className="bg-invoice-700 hover:bg-invoice-800" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPdf ? 'Genererar PDF...' : 'Ladda ner PDF'}
            </Button>
          </div>

          {/* A4 Invoice Form */}
          <div className="bg-white shadow-md mx-auto max-w-4xl print:shadow-none" ref={invoicePdfRef}>
            <div className="p-8">
              {/* Top Section */}
              <div className="flex justify-between mb-8">
                <div>
                  <Input 
                    value={invoiceData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="text-2xl font-bold border-none px-0 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. Företagsnamn"
                  />
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-blue-600">FAKTURA</h1>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Label htmlFor="invoiceNumber" className="w-40 text-gray-700 font-medium">Fakturanummer</Label>
                    <Input 
                      id="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                      className="max-w-[200px] h-8 focus-visible:ring-offset-1 placeholder:text-gray-400"
                      placeholder="ex. 1001"
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="customerNumber" className="w-40 text-gray-700 font-medium">Kundnummer</Label>
                    <Input 
                      id="customerNumber"
                      value={invoiceData.customerNumber}
                      onChange={(e) => handleInputChange('customerNumber', e.target.value)}
                      className="max-w-[200px] h-8 focus-visible:ring-offset-1 placeholder:text-gray-400"
                      placeholder="ex. 112"
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="invoiceDate" className="w-40 text-gray-700 font-medium">Fakturadatum</Label>
                    <Input 
                      id="invoiceDate"
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="max-w-[200px] h-8 focus-visible:ring-offset-1"
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="paymentTerms" className="w-40 text-gray-700 font-medium">Betalningsvillkor</Label>
                    <Input 
                      id="paymentTerms"
                      value={invoiceData.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                      className="max-w-[200px] h-8 focus-visible:ring-offset-1 placeholder:text-gray-400"
                      placeholder="ex. 30 dagar"
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="dueDate" className="w-40 text-gray-700 font-medium">Förfallodatum</Label>
                    <Input 
                      id="dueDate"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="max-w-[200px] h-8 focus-visible:ring-offset-1"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Label htmlFor="yourReference" className="w-40 text-gray-700 font-medium">Vår referens</Label>
                    <Input 
                      id="yourReference"
                      value={invoiceData.yourReference}
                      onChange={(e) => handleInputChange('yourReference', e.target.value)}
                      className="max-w-[200px] h-8 focus-visible:ring-offset-1 placeholder:text-gray-400"
                      placeholder="ex. Stina"
                    />
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="customerReference" className="w-40 text-gray-700 font-medium">Er referens</Label>
                    <Input 
                      id="customerReference"
                      value={invoiceData.customerReference}
                      onChange={(e) => handleInputChange('customerReference', e.target.value)}
                      className="max-w-[200px] h-8 focus-visible:ring-offset-1 placeholder:text-gray-400"
                      placeholder="ex. Arne"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Label className="font-semibold text-gray-700 block mb-2">Adress</Label>
                    <div className="space-y-2">
                      <Input 
                        value={invoiceData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        className="h-8 w-full focus-visible:ring-offset-1 placeholder:text-gray-400"
                        placeholder="ex. Mottagande företag AB"
                      />
                      <Input 
                        value={invoiceData.customerAddress1}
                        onChange={(e) => handleInputChange('customerAddress1', e.target.value)}
                        className="h-8 w-full focus-visible:ring-offset-1 placeholder:text-gray-400"
                        placeholder="ex. Exempelgatan 123"
                      />
                      <Input 
                        value={invoiceData.customerAddress2}
                        onChange={(e) => handleInputChange('customerAddress2', e.target.value)}
                        className="h-8 w-full focus-visible:ring-offset-1 placeholder:text-gray-400"
                        placeholder="ex. 123 45 Exempelstad"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="p-3 text-left border border-gray-300 w-1/2 font-semibold">Produkt</th>
                      <th className="p-3 text-center border border-gray-300 w-1/6 font-semibold">Antal</th>
                      <th className="p-3 text-right border border-gray-300 w-1/6 font-semibold">Pris</th>
                      <th className="p-3 text-right border border-gray-300 w-1/6 font-semibold">Summa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-gray-300">
                        <Input 
                          value={invoiceData.productDescription}
                          onChange={(e) => handleInputChange('productDescription', e.target.value)}
                          className="border-none w-full focus-visible:ring-0 placeholder:text-gray-400"
                          placeholder="ex. Produkt"
                        />
                      </td>
                      <td className="p-2 border border-gray-300">
                        <Input 
                          type="text"
                          value={invoiceData.quantity}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            handleInputChange('quantity', value);
                          }}
                          className="border-none text-center w-full focus-visible:ring-0 placeholder:text-gray-400"
                          placeholder="ex. 1"
                        />
                      </td>
                      <td className="p-2 border border-gray-300">
                        <Input 
                          type="text"
                          value={invoiceData.price}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            handleInputChange('price', value);
                          }}
                          className="border-none text-right w-full focus-visible:ring-0 placeholder:text-gray-400"
                          placeholder="ex. 100"
                        />
                      </td>
                      <td className="p-2 border border-gray-300 text-right font-medium">
                        {invoiceData.quantity && invoiceData.price ? `${netAmount} kr` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-1/3">
                  <div className="flex justify-between p-2">
                    <span className="font-medium">Summa:</span>
                    <span>{invoiceData.quantity && invoiceData.price ? `${netAmount} kr` : ''}</span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span className="font-medium">Moms (25%):</span>
                    <span>{invoiceData.quantity && invoiceData.price ? `${vatAmount} kr` : ''}</span>
                  </div>
                  <div className="flex justify-between p-3 font-bold border-t border-gray-200 mt-1 pt-2 text-lg">
                    <span>TOTAL:</span>
                    <span>{invoiceData.quantity && invoiceData.price ? `${totalAmount} kr` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-5 rounded border mb-8">
                <h3 className="font-bold text-lg mb-3">Betalningsinformation</h3>
                <p className="mb-2 text-base">{invoiceData.paymentTerms ? `Betalningsvillkor: ${invoiceData.paymentTerms}` : ''}</p>
                <p className="mb-2 text-base">{invoiceData.dueDate ? `Förfallodatum: ${invoiceData.dueDate}` : ''}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-700">Bankgiro</p>
                    <Input 
                      value={invoiceData.sellerBankgiro}
                      onChange={(e) => handleInputChange('sellerBankgiro', e.target.value)}
                      className="border-none bg-transparent px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                      placeholder="ex. 123-4567"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Bank</p>
                    <Input 
                      value={invoiceData.sellerBankName}
                      onChange={(e) => handleInputChange('sellerBankName', e.target.value)}
                      className="border-none bg-transparent px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                      placeholder="ex. Nordea"
                    />
                    <div className="flex gap-2 items-center mt-1">
                      <p className="text-gray-700">Clearing: </p>
                      <Input 
                        value={invoiceData.sellerClearingNumber}
                        onChange={(e) => handleInputChange('sellerClearingNumber', e.target.value)}
                        className="border-none bg-transparent px-0 h-7 focus-visible:ring-0 w-20 placeholder:text-gray-400"
                        placeholder="ex. 3300"
                      />
                      <p className="text-gray-700">Kontonr: </p>
                      <Input 
                        value={invoiceData.sellerAccountNumber}
                        onChange={(e) => handleInputChange('sellerAccountNumber', e.target.value)}
                        className="border-none bg-transparent px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                        placeholder="ex. 123456789"
                      />
                    </div>
                  </div>
                </div>
                
                <p className="mt-3 text-base">
                  {invoiceData.invoiceNumber ? `Ange fakturanummer: ${invoiceData.invoiceNumber} som referens` : ''}
                </p>
              </div>

              {/* Footer - Company details */}
              <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Adress</p>
                  <Input 
                    value={invoiceData.sellerName}
                    onChange={(e) => handleInputChange('sellerName', e.target.value)}
                    className="border-none px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. Mitt företag AB"
                  />
                  <Input 
                    value={invoiceData.sellerAddress1}
                    onChange={(e) => handleInputChange('sellerAddress1', e.target.value)}
                    className="border-none px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. Avsändargatan 5"
                  />
                  <Input 
                    value={invoiceData.sellerAddress2}
                    onChange={(e) => handleInputChange('sellerAddress2', e.target.value)}
                    className="border-none px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. 123 45 Exempelstad"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Telefon</p>
                  <Input 
                    value={invoiceData.sellerPhone}
                    onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
                    className="border-none px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. 08 123 456 78"
                  />
                  <p className="font-semibold mt-2 text-gray-700">Webbplats</p>
                  <Input 
                    value={invoiceData.sellerWebsite}
                    onChange={(e) => handleInputChange('sellerWebsite', e.target.value)}
                    className="border-none px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. www.mittforetag.se"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Org.nr.</p>
                  <Input 
                    value={invoiceData.sellerOrgNumber}
                    onChange={(e) => handleInputChange('sellerOrgNumber', e.target.value)}
                    className="border-none px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. 556833934"
                  />
                  <p className="font-semibold mt-2 text-gray-700">Momsnr.</p>
                  <Input 
                    value={invoiceData.sellerVatNumber}
                    onChange={(e) => handleInputChange('sellerVatNumber', e.target.value)}
                    className="border-none px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. 556833934401"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">E-post</p>
                  <Input 
                    value={invoiceData.sellerEmail}
                    onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
                    className="border-none px-0 h-7 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="ex. hej@foretaget.se"
                  />
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>Godkänd för F-skatt</p>
                <p>Vid försenad betalning debiteras dröjsmålsränta enligt räntelagen.</p>
                <p>Mervärdesskatt (VAT) beräknad enligt svenska momsregler.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Vill du ha mer funktionalitet?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Skapa ett konto för att få tillgång till kundregister, fakturahistorik, automatiska påminnelser och mycket mer.
            </p>
            <Button asChild className="bg-invoice-700 hover:bg-invoice-800 px-8 py-6 text-lg">
              <Link to="/login?tab=signup">Skapa gratis konto</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">FakturaSmooth</h4>
              <p>Enkel fakturering för företagare och frilansare.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontakt</h4>
              <p>info@fakturasmooth.se</p>
              <p>070-123 45 67</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Länkar</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:underline">Logga in</Link></li>
                <li><Link to="/login?tab=signup" className="hover:underline">Skapa konto</Link></li>
                <li><a href="#" className="hover:underline">Hjälp</a></li>
                <li><a href="#" className="hover:underline">Om oss</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
            <p>© {new Date().getFullYear()} FakturaSmooth. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 