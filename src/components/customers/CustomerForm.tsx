import React, { useState } from 'react';
import { Customer } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerFormProps {
  existingCustomer?: Customer;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ existingCustomer }) => {
  const { addCustomer, updateCustomer } = useData();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState(existingCustomer?.name || '');
  const [orgNumber, setOrgNumber] = useState(existingCustomer?.orgNumber || '');
  const [vatNumber, setVatNumber] = useState(existingCustomer?.vatNumber || '');
  const [reference, setReference] = useState(existingCustomer?.reference || '');
  
  const [street, setStreet] = useState(existingCustomer?.address.street || '');
  const [postalCode, setPostalCode] = useState(existingCustomer?.address.postalCode || '');
  const [city, setCity] = useState(existingCustomer?.address.city || '');
  const [country, setCountry] = useState(existingCustomer?.address.country || 'Sverige');
  
  const [contactName, setContactName] = useState(existingCustomer?.contact.name || '');
  const [email, setEmail] = useState(existingCustomer?.contact.email || '');
  const [phone, setPhone] = useState(existingCustomer?.contact.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const customerData = {
      name,
      orgNumber,
      vatNumber: vatNumber || undefined,
      reference: reference || undefined,
      address: {
        street,
        postalCode,
        city,
        country
      },
      contact: {
        name: contactName,
        email,
        phone
      },
      userId: user.id
    };

    if (existingCustomer) {
      updateCustomer({
        ...customerData,
        id: existingCustomer.id
      });
    } else {
      addCustomer(customerData);
    }

    navigate('/customers');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="invoice-section">
        <h3 className="text-md font-semibold mb-4">Grundläggande information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="invoice-label">Företagsnamn</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="invoice-field" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="orgNumber" className="invoice-label">Organisationsnummer</Label>
            <Input 
              id="orgNumber" 
              value={orgNumber} 
              onChange={(e) => setOrgNumber(e.target.value)} 
              className="invoice-field" 
              placeholder="XXXXXX-XXXX" 
            />
          </div>
          <div>
            <Label htmlFor="vatNumber" className="invoice-label">Momsregistreringsnummer</Label>
            <Input 
              id="vatNumber" 
              value={vatNumber} 
              onChange={(e) => setVatNumber(e.target.value)} 
              className="invoice-field" 
              placeholder="SEXXXXXXXXXX01" 
            />
          </div>
          <div>
            <Label htmlFor="reference" className="invoice-label">Referens</Label>
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
        <h3 className="text-md font-semibold mb-4">Adress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="street" className="invoice-label">Gatuadress</Label>
            <Input 
              id="street" 
              value={street} 
              onChange={(e) => setStreet(e.target.value)} 
              className="invoice-field" 
            />
          </div>
          <div>
            <Label htmlFor="postalCode" className="invoice-label">Postnummer</Label>
            <Input 
              id="postalCode" 
              value={postalCode} 
              onChange={(e) => setPostalCode(e.target.value)} 
              className="invoice-field" 
              placeholder="XXX XX" 
            />
          </div>
          <div>
            <Label htmlFor="city" className="invoice-label">Ort</Label>
            <Input 
              id="city" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              className="invoice-field" 
            />
          </div>
          <div>
            <Label htmlFor="country" className="invoice-label">Land</Label>
            <Input 
              id="country" 
              value={country} 
              onChange={(e) => setCountry(e.target.value)} 
              className="invoice-field" 
            />
          </div>
        </div>
      </div>

      <div className="invoice-section">
        <h3 className="text-md font-semibold mb-4">Kontaktuppgifter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactName" className="invoice-label">Kontaktperson</Label>
            <Input 
              id="contactName" 
              value={contactName} 
              onChange={(e) => setContactName(e.target.value)} 
              className="invoice-field" 
            />
          </div>
          <div>
            <Label htmlFor="email" className="invoice-label">E-post</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="invoice-field" 
            />
          </div>
          <div>
            <Label htmlFor="phone" className="invoice-label">Telefon</Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="invoice-field" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => navigate('/customers')}>Avbryt</Button>
        <Button type="submit" className="bg-invoice-700 hover:bg-invoice-800">
          {existingCustomer ? 'Uppdatera kund' : 'Lägg till kund'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
