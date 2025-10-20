import {  CreditCard, BarChart3, Users, } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
  isOpen: boolean;
}

export function Sidebar({ currentPage, onNavigate, isOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    // { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className={`${
      isOpen ? 'w-64' : 'w-20'
    } bg-gray-900 border-r border-red-600/30 transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b border-red-600/30">
        <div className={`text-red-600 font-bold ${isOpen ? 'text-xl' : 'text-lg text-center'}`}>
          {isOpen ? 'GRIT' : 'G'}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-semibold">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-red-600/30 text-xs text-gray-500 text-center">
        {isOpen && <p>v1.0.0</p>}
      </div>
    </aside>
  );
}
