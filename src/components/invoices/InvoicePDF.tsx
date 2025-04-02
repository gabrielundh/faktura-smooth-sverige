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

  const companyName = user.company.name;
  
  // Default display of company initials if no logo
  const renderLogoOrInitials = () => {
    if (user.company.logo) {
      return (
        <img 
          src={user.company.logo} 
          alt={`${companyName} logotyp`} 
          className="h-16 mb-4"
        />
      );
    } else {
      return (
        <div className="h-16 mb-4 flex items-center">
          <span className="text-4xl font-bold text-invoice-700">
            {companyName.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="w-full bg-white p-8 print:p-0">
      {/* Företagslogotyp och fakturainfo */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {renderLogoOrInitials()}
          <h1 className="text-3xl font-bold text-invoice-700">FAKTURA</h1>
          <p className="text-base">Faktura #{invoice.invoiceNumber}</p>
          <p className="text-base">Datum: {format(parseISO(invoice.date), 'yyyy-MM-dd')}</p>
          <p className="text-base">Förfallodatum: {format(parseISO(invoice.dueDate), 'yyyy-MM-dd')}</p>
        </div>
        
        <div className="text-right">
          <h2 className="font-bold text-xl">{companyName}</h2>
          <p className="text-base">{user.company.address.street}</p>
          <p className="text-base">{user.company.address.postalCode} {user.company.address.city}</p>
          <p className="text-base">{user.company.address.country}</p>
          <p className="text-base mt-2">Org.nr: {user.company.orgNumber}</p>
          {user.company.vatNumber && (
            <p className="text-base">Momsreg.nr: {user.company.vatNumber}</p>
          )}
          <p className="text-base mt-2">Tel: {user.company.contact.phone}</p>
          <p className="text-base">E-post: {user.company.contact.email}</p>
        </div>
      </div>

      {/* Kundinformation */}
      <div className="mb-8 border-b pb-4">
        <h2 className="font-bold text-lg mb-2">Fakturamottagare:</h2>
        <p className="font-semibold text-base">{invoice.customer.name}</p>
        {invoice.customer.orgNumber && (
          <p className="text-base">Org.nr: {invoice.customer.orgNumber}</p>
        )}
        <p className="text-base">{invoice.customer.address.street}</p>
        <p className="text-base">{invoice.customer.address.postalCode} {invoice.customer.address.city}</p>
        <p className="text-base">{invoice.customer.address.country}</p>
        
        {invoice.customer.reference && (
          <p className="mt-2 text-base">Referens: {invoice.customer.reference}</p>
        )}
      </div>

      {/* Artiklar */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-2 px-2 text-base border border-gray-200">Beskrivning</th>
            <th className="py-2 px-2 text-base text-right border border-gray-200">Antal</th>
            <th className="py-2 px-2 text-base text-right border border-gray-200">Enhet</th>
            <th className="py-2 px-2 text-base text-right border border-gray-200">Pris</th>
            <th className="py-2 px-2 text-base text-right border border-gray-200">Moms</th>
            <th className="py-2 px-2 text-base text-right border border-gray-200">Summa</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => {
            const rowTotal = item.price * item.quantity;
            return (
              <tr key={index} className="border-b">
                <td className="py-2 px-2 text-base border border-gray-200">
                  {item.articleNumber && <span className="text-gray-600 text-sm mr-2">{item.articleNumber}</span>}
                  {item.description}
                </td>
                <td className="py-2 px-2 text-base text-right border border-gray-200">{item.quantity}</td>
                <td className="py-2 px-2 text-base text-right border border-gray-200">{item.unit}</td>
                <td className="py-2 px-2 text-base text-right border border-gray-200">{item.price.toFixed(2)}</td>
                <td className="py-2 px-2 text-base text-right border border-gray-200">{item.taxRate}%</td>
                <td className="py-2 px-2 text-base text-right font-medium border border-gray-200">{rowTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summering */}
      <div className="flex justify-end mb-8">
        <div className="w-64 border rounded p-2">
          <div className="flex justify-between py-1 text-base">
            <span>Netto:</span>
            <span>{invoice.totalNet.toFixed(2)} {invoice.currency}</span>
          </div>
          <div className="flex justify-between py-1 text-base">
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
      <div className="bg-gray-50 p-4 rounded border">
        <h3 className="font-bold text-lg mb-2">Betalningsinformation</h3>
        <p className="mb-1 text-base">Betalningsvillkor: {invoice.paymentTerms}</p>
        <p className="mb-1 text-base">Förfallodatum: {format(parseISO(invoice.dueDate), 'yyyy-MM-dd')}</p>
        
        {/* Display banking information */}
        {user.company.bankgiro && (
          <p className="mb-1 text-base">Bankgiro: {user.company.bankgiro}</p>
        )}
        {user.company.plusgiro && (
          <p className="mb-1 text-base">Plusgiro: {user.company.plusgiro}</p>
        )}
        {user.company.swish && (
          <p className="mb-1 text-base">Swish: {user.company.swish}</p>
        )}
        {(user.company.bankName || user.company.clearingNumber || user.company.accountNumber) && (
          <div className="mb-1 text-base">
            {user.company.bankName && <span>Bank: {user.company.bankName}</span>}
            {user.company.clearingNumber && user.company.accountNumber && (
              <span> | Konto: {user.company.clearingNumber}-{user.company.accountNumber}</span>
            )}
            {!user.company.clearingNumber && user.company.accountNumber && (
              <span> | Konto: {user.company.accountNumber}</span>
            )}
          </div>
        )}
        {user.company.iban && (
          <p className="mb-1 text-base">IBAN: {user.company.iban}</p>
        )}
        {user.company.swift && (
          <p className="mb-1 text-base">BIC/SWIFT: {user.company.swift}</p>
        )}
        
        <p className="mb-1 text-base">Ange fakturanummer: {invoice.invoiceNumber} som referens</p>
        
        <p className="mt-2 text-base">
          {invoice.notes}
        </p>
      </div>

      {/* Lagstadgad information */}
      <div className="mt-8 text-sm text-gray-500 border-t pt-4">
        <p>Innehar F-skattebevis</p>
        <p>Vid försenad betalning debiteras dröjsmålsränta enligt räntelagen.</p>
        <p>Mervärdesskatt (VAT) beräknad enligt svenska momsregler.</p>
      </div>
    </div>
  );
};

export default InvoicePDF;
