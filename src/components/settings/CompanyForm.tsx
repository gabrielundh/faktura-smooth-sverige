
import React, { useState } from 'react';
import { Company } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileImage } from 'lucide-react';

interface CompanyFormProps {
  company: Company;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company }) => {
  const [name, setName] = useState(company.name);
  const [orgNumber, setOrgNumber] = useState(company.orgNumber);
  const [vatNumber, setVatNumber] = useState(company.vatNumber || '');
  const [street, setStreet] = useState(company.address.street);
  const [postalCode, setPostalCode] = useState(company.address.postalCode);
  const [city, setCity] = useState(company.address.city);
  const [country, setCountry] = useState(company.address.country);
  const [contactName, setContactName] = useState(company.contact.name);
  const [email, setEmail] = useState(company.contact.email);
  const [phone, setPhone] = useState(company.contact.phone);
  const [bankgiro, setBankgiro] = useState(company.bankgiro || '');
  const [plusgiro, setPlusgiro] = useState(company.plusgiro || '');
  const [swish, setSwish] = useState(company.swish || '');
  const [iban, setIban] = useState(company.iban || '');
  const [taxRate, setTaxRate] = useState(company.taxRate);
  const [logo, setLogo] = useState(company.logo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Här skulle vi normalt uppdatera företagsinformationen via en API-anrop,
    // men eftersom detta är en demo med hårdkodade användare visar vi bara en toast
    
    toast.success("Företagsinformationen har uppdaterats");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="invoice-section">
        <h3 className="text-md font-semibold mb-4">Företagsinformation</h3>
        
        <div className="mb-4">
          <Label className="invoice-label mb-2">Logotyp</Label>
          <div className="flex items-center space-x-4">
            {logo ? (
              <div className="relative w-32 h-16">
                <img 
                  src={logo} 
                  alt="Företagslogotyp" 
                  className="object-contain w-full h-full"
                />
                <button 
                  type="button" 
                  onClick={() => setLogo('')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-32 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <FileImage className="h-6 w-6" />
              </div>
            )}
            <div>
              <Button type="button" variant="outline" size="sm">
                Ladda upp logotyp
              </Button>
              <p className="text-xs text-gray-500 mt-1">Rekommenderad storlek: 200x100 px, PNG eller JPG</p>
            </div>
          </div>
        </div>
        
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
              required 
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
            <Label htmlFor="taxRate" className="invoice-label">Standard momssats (%)</Label>
            <Input 
              id="taxRate" 
              type="number" 
              min="0" 
              max="100" 
              value={taxRate} 
              onChange={(e) => setTaxRate(Number(e.target.value))} 
              className="invoice-field" 
              required 
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
              required 
            />
          </div>
          <div>
            <Label htmlFor="postalCode" className="invoice-label">Postnummer</Label>
            <Input 
              id="postalCode" 
              value={postalCode} 
              onChange={(e) => setPostalCode(e.target.value)} 
              className="invoice-field" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="city" className="invoice-label">Ort</Label>
            <Input 
              id="city" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              className="invoice-field" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="country" className="invoice-label">Land</Label>
            <Input 
              id="country" 
              value={country} 
              onChange={(e) => setCountry(e.target.value)} 
              className="invoice-field" 
              required 
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
              required 
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
              required 
            />
          </div>
          <div>
            <Label htmlFor="phone" className="invoice-label">Telefon</Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="invoice-field" 
              required 
            />
          </div>
        </div>
      </div>

      <div className="invoice-section">
        <h3 className="text-md font-semibold mb-4">Betalningsinformation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankgiro" className="invoice-label">Bankgiro</Label>
            <Input 
              id="bankgiro" 
              value={bankgiro} 
              onChange={(e) => setBankgiro(e.target.value)} 
              className="invoice-field" 
            />
          </div>
          <div>
            <Label htmlFor="plusgiro" className="invoice-label">Plusgiro</Label>
            <Input 
              id="plusgiro" 
              value={plusgiro} 
              onChange={(e) => setPlusgiro(e.target.value)} 
              className="invoice-field" 
            />
          </div>
          <div>
            <Label htmlFor="swish" className="invoice-label">Swish</Label>
            <Input 
              id="swish" 
              value={swish} 
              onChange={(e) => setSwish(e.target.value)} 
              className="invoice-field" 
            />
          </div>
          <div>
            <Label htmlFor="iban" className="invoice-label">IBAN</Label>
            <Input 
              id="iban" 
              value={iban} 
              onChange={(e) => setIban(e.target.value)} 
              className="invoice-field" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-invoice-700 hover:bg-invoice-800">
          Spara ändringar
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;
