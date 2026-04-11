import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChartLine, Cow, ArrowsLeftRight, Calendar, CurrencyDollar, FileText, List, X } from '@phosphor-icons/react';

const navigation = [
  { name: 'Dashboard', path: '/', icon: ChartLine },
  { name: 'Animais', path: '/animais', icon: Cow },
  { name: 'Movimentações', path: '/movimentacoes', icon: ArrowsLeftRight },
  { name: 'Eventos', path: '/eventos', icon: Calendar },
  { name: 'Despesas', path: '/despesas', icon: CurrencyDollar },
  { name: 'Relatórios', path: '/relatorios', icon: FileText },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" data-testid="main-layout">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#1B2620] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-[#2A3730]">
            <h1 className="text-xl font-semibold text-[#E5E3DB]" data-testid="app-title">Gestão Rural</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#E5E3DB] hover:text-white"
              data-testid="close-sidebar-btn"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg text-[#E5E3DB] ${
                    isActive ? 'bg-[#4A6741] text-white' : 'hover:bg-[#2A3730]'
                  }`}
                  data-testid={`nav-link-${item.name.toLowerCase()}`}
                >
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-[#E5E3DB] px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#1B2620] mr-3"
            data-testid="open-sidebar-btn"
          >
            <List size={24} />
          </button>
          <h1 className="text-lg font-semibold text-[#1B2620]">Gestão Rural</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
