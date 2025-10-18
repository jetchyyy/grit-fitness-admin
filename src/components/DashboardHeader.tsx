import { LogOut, Menu } from 'lucide-react';

interface DashboardHeaderProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export function DashboardHeader({ onLogout, onToggleSidebar }: DashboardHeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-red-600/30">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-white transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">GRIT Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">
              Manage memberships and track payments
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}

