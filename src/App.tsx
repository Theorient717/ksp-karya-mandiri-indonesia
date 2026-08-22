import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CalculatorModal } from './components/common/CalculatorModal';
import { CloudSyncModal } from './components/common/CloudSyncModal';
import { DeployGuideModal } from './components/common/DeployGuideModal';

// Views
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { MemberPortalView } from './components/member/MemberPortalView';
import { MemberView } from './components/member/MemberView';
import { LoanView } from './components/loan/LoanView';
import { InstallmentView } from './components/installment/InstallmentView';
import { SavingsView } from './components/savings/SavingsView';
import { CashBankView } from './components/cashbank/CashBankView';
import { AccountingView } from './components/accounting/AccountingView';
import { TaxView } from './components/tax/TaxView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { GasExportView } from './components/gas/GasExportView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [activeView, setActiveView] = useState(() => (currentUser?.role === 'ANGGOTA' ? 'member_portal' : 'dashboard'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [cloudSyncModalOpen, setCloudSyncModalOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView onOpenDeployGuide={() => setDeployModalOpen(true)} />;
  }

  // If role is ANGGOTA and user is on dashboard, show member_portal
  const effectiveView = currentUser?.role === 'ANGGOTA' && activeView === 'dashboard' ? 'member_portal' : activeView;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* Sidebar */}
      <Sidebar
        activeView={effectiveView}
        onSelectView={(v) => setActiveView(v)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          activeView={effectiveView}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenCalculator={() => setCalcModalOpen(true)}
          onOpenCloudSync={() => setCloudSyncModalOpen(true)}
          onOpenDeployGuide={() => setDeployModalOpen(true)}
        />

        {/* Dynamic Body View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {effectiveView === 'dashboard' && (
            <DashboardView
              onNavigate={(v) => setActiveView(v)}
              onOpenCalculator={() => setCalcModalOpen(true)}
            />
          )}
          {effectiveView === 'member_portal' && <MemberPortalView />}
          {effectiveView === 'members' && <MemberView />}
          {activeView === 'loans' && <LoanView />}
          {activeView === 'installments' && <InstallmentView />}
          {activeView === 'savings' && <SavingsView />}
          {activeView === 'cashbank' && <CashBankView />}
          {activeView === 'accounting' && <AccountingView />}
          {activeView === 'tax' && <TaxView />}
          {activeView === 'reports' && <ReportsView />}
          {activeView === 'audit' && <AuditLogView />}
          {activeView === 'gas_export' && <GasExportView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <CalculatorModal
        isOpen={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
      />
      <CloudSyncModal
        isOpen={cloudSyncModalOpen}
        onClose={() => setCloudSyncModalOpen(false)}
      />
      <DeployGuideModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
