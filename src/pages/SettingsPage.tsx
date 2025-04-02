
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CompanyForm from '@/components/settings/CompanyForm';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Settings className="h-5 w-5 mr-2 text-invoice-700" />
        <h1 className="text-2xl font-bold tracking-tight">Inställningar</h1>
      </div>

      <div className="space-y-4">
        <CompanyForm company={user.company} />
      </div>
    </div>
  );
};

export default SettingsPage;
