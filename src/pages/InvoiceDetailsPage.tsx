
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Download, Printer, ArrowLeft } from 'lucide-react';
import InvoicePDF from '@/components/invoices/InvoicePDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices } = useData();
  const navigate = useNavigate();
  
  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="bg-amber-100 p-3 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Faktura hittades inte</h2>
          <p className="text-gray-600 mb-6">
            Fakturan du försöker visa kan ha raderats eller existerar inte.
          </p>
          <Button 
            onClick={() => navigate('/invoices')} 
            className="bg-invoice-700 hover:bg-invoice-800"
          >
            Tillbaka till fakturor
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = async () => {
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
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/edit/${invoice.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Redigera
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Skriv ut
          </Button>
          <Button className="bg-invoice-700 hover:bg-invoice-800" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Ladda ner PDF
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm print:shadow-none print:border-none">
        <div id="invoice-pdf">
          <InvoicePDF invoice={invoice} />
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;
