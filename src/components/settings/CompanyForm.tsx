
import React, { useState, useRef } from 'react';
import { Company } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileImage, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyFormProps {
  company: Company;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company }) => {
  const { user, refreshUser } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user) {
        toast.error("Du måste vara inloggad för att uppdatera företagsinformation");
        return;
      }
      
      const updatedCompany = {
        name,
        orgNumber,
        vatNumber,
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
        bankgiro,
        plusgiro,
        swish,
        iban,
        taxRate,
        logo
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          company: updatedCompany
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating company:', error);
        toast.error("Ett fel uppstod när företagsinformationen skulle uppdateras");
        return;
      }
      
      // Refresh user data to get updated company info
      await refreshUser();
      
      toast.success("Företagsinformationen har uppdaterats");
    } catch (error) {
      console.error('Error saving company details:', error);
      toast.error("Ett fel uppstod när företagsinformationen skulle uppdateras");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) {
      return;
    }

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setIsLoading(true);
      
      // Upload file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('company_logos')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('company_logos')
        .getPublicUrl(filePath);

      setLogo(publicUrl);
      toast.success("Logotyp har laddats upp");
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error("Ett fel uppstod när logotypen skulle laddas upp");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogo('');
  };
  
  const getCompanyInitials = () => {
    return name ? name.charAt(0).toUpperCase() : '';
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
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-32 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50">
                {name ? (
                  <span className="text-3xl font-bold text-invoice-700">{getCompanyInitials()}</span>
                ) : (
                  <FileImage className="h-6 w-6" />
                )}
              </div>
            )}
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
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
        <Button 
          type="submit" 
          className="bg-invoice-700 hover:bg-invoice-800"
          disabled={isLoading}
        >
          {isLoading ? 'Sparar...' : 'Spara ändringar'}
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;
