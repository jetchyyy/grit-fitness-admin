import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Sidebar } from '../components/Sidebar';
import { DashboardHeader } from '../components/DashboardHeader';
import { PaymentsPage } from './PaymentsPage';
import { AnalyticsPage } from './AnalyticsPage';
import { MembersPage } from './MembersPage';
import { SettingsPage } from './SettingsPage';

type PageType = 'dashboard' | 'payments' | 'analytics' | 'members' | 'settings';

export function AdminLandingPage() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'payments':
        return <PaymentsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'members':
        return <MembersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <PaymentsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}