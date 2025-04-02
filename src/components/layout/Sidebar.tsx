
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-3 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-invoice-50 text-invoice-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Home className="mr-3 h-5 w-5" />
            Översikt
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-invoice-50 text-invoice-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Users className="mr-3 h-5 w-5" />
            Kunder
          </NavLink>

          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-invoice-50 text-invoice-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <FileText className="mr-3 h-5 w-5" />
            Fakturor
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-invoice-50 text-invoice-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Settings className="mr-3 h-5 w-5" />
            Inställningar
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
