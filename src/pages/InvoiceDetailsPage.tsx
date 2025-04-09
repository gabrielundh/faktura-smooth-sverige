import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Download, Printer, ArrowLeft, FileText } from 'lucide-react';
import InvoicePDF from '@/components/invoices/InvoicePDF';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const InvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices } = useData();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
            onClick={() => navigate('/app/invoices')} 
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

      toast.loading('Genererar PDF...');
      
      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // A4 dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Prepare the element for optimal capture with better spacing
      const prepareElement = (clonedDoc: Document) => {
        const clonedElement = clonedDoc.getElementById('invoice-pdf');
        if (clonedElement) {
          // Adjust padding to create more space at the bottom for footer
          clonedElement.style.padding = '15mm 15mm 30mm 15mm'; // top, right, bottom, left
          clonedElement.style.boxSizing = 'border-box';
          clonedElement.style.maxWidth = '100%';
          
          // Improve spacing between sections to distribute content evenly
          const headerSection = clonedElement.querySelector('.invoice-header');
          if (headerSection) {
            (headerSection as HTMLElement).style.marginBottom = '30px';
          }
          
          // Ensure recipient section has proper spacing
          const recipientSection = clonedElement.querySelector('.invoice-recipient');
          if (recipientSection) {
            (recipientSection as HTMLElement).style.marginBottom = '30px';
          }
          
          // Ensure table has appropriate spacing
          const tableSection = clonedElement.querySelector('.invoice-items-table');
          if (tableSection) {
            (tableSection as HTMLElement).style.marginBottom = '30px';
          }
          
          // Add more space above the payment info section to move it down
          const paymentSection = clonedElement.querySelector('.bg-gray-50');
          if (paymentSection) {
            (paymentSection as HTMLElement).style.marginTop = '50px';
            (paymentSection as HTMLElement).style.marginBottom = '50px';
          }
          
          // Improve footer positioning
          const footerSection = clonedElement.querySelector('.mt-8');
          if (footerSection) {
            (footerSection as HTMLElement).style.marginTop = '60px !important';
            (footerSection as HTMLElement).style.position = 'relative';
            (footerSection as HTMLElement).style.bottom = '0';
            (footerSection as HTMLElement).style.left = '0';
            (footerSection as HTMLElement).style.width = '100%';
            (footerSection as HTMLElement).style.display = 'block';
            (footerSection as HTMLElement).style.visibility = 'visible';
            (footerSection as HTMLElement).style.opacity = '1';
            (footerSection as HTMLElement).style.color = '#666';
          }
          
          // Ensure the text is properly spaced
          const footerParagraphs = footerSection?.querySelectorAll('p');
          if (footerParagraphs) {
            footerParagraphs.forEach(p => {
              (p as HTMLElement).style.marginBottom = '4px';
            });
          }
          
          // Make all content visible
          Array.from(clonedElement.querySelectorAll('*')).forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.display === 'none') {
              (el as HTMLElement).style.display = 'block';
            }
          });
          
          // Ensure company info is not squashed
          const companyInfo = clonedElement.querySelector('.text-right');
          if (companyInfo) {
            (companyInfo as HTMLElement).style.lineHeight = '1.5';
            (companyInfo as HTMLElement).style.marginBottom = '20px';
          }
          
          // Ensure table takes appropriate space and has borders
          const table = clonedElement.querySelector('table');
          if (table) {
            (table as HTMLTableElement).style.width = '100%';
            (table as HTMLTableElement).style.borderCollapse = 'collapse';
            
            // Ensure table cells have proper padding
            Array.from(table.querySelectorAll('th, td')).forEach(cell => {
              (cell as HTMLElement).style.padding = '8px';
            });
          }
        }
      };
      
      // Apply professional print quality with optimal scaling for A4
      const dpi = 300;
      const pixelsPerMm = dpi / 25.4;
      const canvasWidth = Math.floor(pageWidth * pixelsPerMm);
      const scale = canvasWidth / element.offsetWidth;
      
      // Render to canvas with high-quality settings
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        allowTaint: true,
        onclone: prepareElement
      });
      
      // Calculate dimensions for optimal A4 layout
      const imgWidth = pageWidth;
      
      // Distribute content more evenly on the page - use more vertical space
      // Use a balanced value that ensures content is neither squashed nor has excess white space
      const adjustmentFactor = 1.0; // Use full height scaling for better content distribution
      const imgHeight = Math.min(pageHeight - 10, (canvas.height * imgWidth) / canvas.width * adjustmentFactor);
      
      // Position content with appropriate margins
      const horizontalMargin = 0;
      const verticalMargin = 5; // 5mm top margin
      
      // Add image to PDF with precise dimensions
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        horizontalMargin,
        verticalMargin,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      
      // Set PDF metadata
      pdf.setProperties({
        title: `Faktura ${invoice.invoiceNumber}`,
        subject: `Faktura till ${invoice.customer.name}`,
        creator: 'Faktura Smooth Sverige',
        author: user?.company?.name || 'Unknown Company',
        keywords: `faktura, ${invoice.invoiceNumber}, ${invoice.customer.name}`
      });

      pdf.save(`faktura-${invoice.invoiceNumber}.pdf`);
      toast.dismiss();
      toast.success('PDF har genererats');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Ett fel uppstod vid generering av PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => navigate('/app/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/app/invoices/edit/${invoice.id}`)}>
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
