
import React from 'react';
import { Invoice } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';

interface InvoicePDFProps {
  invoice: Invoice;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-md">
      {/* Företagslogotyp och fakturainfo */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {user.company.logo && (
            <img 
              src={user.company.logo} 
              alt={`${user.company.name} logotyp`} 
              className="h-16 mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-invoice-700">FAKTURA</h1>
          <p className="text-sm">Faktura #{invoice.invoiceNumber}</p>
          <p className="text-sm">Datum: {format(parseISO(invoice.date), 'yyyy-MM-dd')}</p>
          <p className="text-sm">Förfallodatum: {format(parseISO(invoice.dueDate), 'yyyy-MM-dd')}</p>
        </div>
        
        <div className="text-right">
          <h2 className="font-bold text-lg">{user.company.name}</h2>
          <p className="text-sm">{user.company.address.street}</p>
          <p className="text-sm">{user.company.address.postalCode} {user.company.address.city}</p>
          <p className="text-sm">{user.company.address.country}</p>
          <p className="text-sm mt-2">Org.nr: {user.company.orgNumber}</p>
          {user.company.vatNumber && (
            <p className="text-sm">Momsreg.nr: {user.company.vatNumber}</p>
          )}
          <p className="text-sm mt-2">Tel: {user.company.contact.phone}</p>
          <p className="text-sm">E-post: {user.company.contact.email}</p>
        </div>
      </div>

      {/* Kundinformation */}
      <div className="mb-8 border-b pb-4">
        <h2 className="font-bold mb-2">Fakturamottagare:</h2>
        <p className="font-semibold">{invoice.customer.name}</p>
        {invoice.customer.orgNumber && (
          <p>Org.nr: {invoice.customer.orgNumber}</p>
        )}
        <p>{invoice.customer.address.street}</p>
        <p>{invoice.customer.address.postalCode} {invoice.customer.address.city}</p>
        <p>{invoice.customer.address.country}</p>
        
        {invoice.customer.reference && (
          <p className="mt-2">Referens: {invoice.customer.reference}</p>
        )}
      </div>

      {/* Artiklar */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-2 px-4 text-sm">Beskrivning</th>
            <th className="py-2 px-4 text-sm text-right">Antal</th>
            <th className="py-2 px-4 text-sm text-right">Enhet</th>
            <th className="py-2 px-4 text-sm text-right">Pris</th>
            <th className="py-2 px-4 text-sm text-right">Moms</th>
            <th className="py-2 px-4 text-sm text-right">Summa</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => {
            const rowTotal = item.price * item.quantity;
            return (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">
                  {item.articleNumber && <span className="text-gray-600 text-xs mr-2">{item.articleNumber}</span>}
                  {item.description}
                </td>
                <td className="py-2 px-4 text-right">{item.quantity}</td>
                <td className="py-2 px-4 text-right">{item.unit}</td>
                <td className="py-2 px-4 text-right">{item.price.toFixed(2)}</td>
                <td className="py-2 px-4 text-right">{item.taxRate}%</td>
                <td className="py-2 px-4 text-right font-medium">{rowTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summering */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-1">
            <span>Netto:</span>
            <span>{invoice.totalNet.toFixed(2)} {invoice.currency}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Moms:</span>
            <span>{invoice.totalTax.toFixed(2)} {invoice.currency}</span>
          </div>
          <div className="flex justify-between py-1 font-bold text-lg border-t mt-2 pt-2">
            <span>Att betala:</span>
            <span>{invoice.totalGross.toFixed(2)} {invoice.currency}</span>
          </div>
        </div>
      </div>

      {/* Betalningsinformation */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-bold mb-2">Betalningsinformation</h3>
        <p className="mb-1">Betalningsvillkor: {invoice.paymentTerms}</p>
        <p className="mb-1">Förfallodatum: {format(parseISO(invoice.dueDate), 'yyyy-MM-dd')}</p>
        {user.company.bankgiro && (
          <p className="mb-1">Bankgiro: {user.company.bankgiro}</p>
        )}
        {user.company.plusgiro && (
          <p className="mb-1">Plusgiro: {user.company.plusgiro}</p>
        )}
        {user.company.swish && (
          <p className="mb-1">Swish: {user.company.swish}</p>
        )}
        <p className="mb-1">Ange fakturanummer: {invoice.invoiceNumber} som referens</p>
        
        <p className="mt-2 text-sm">
          {invoice.notes}
        </p>
      </div>

      {/* Lagstadgad information */}
      <div className="mt-8 text-xs text-gray-500 border-t pt-4">
        <p>Innehar F-skattebevis</p>
        <p>Vid försenad betalning debiteras dröjsmålsränta enligt räntelagen.</p>
        <p>Mervärdesskatt (VAT) beräknad enligt svenska momsregler.</p>
      </div>
    </div>
  );
};

export default InvoicePDF;
