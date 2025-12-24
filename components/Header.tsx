
import React from 'react';
import { AppView, User } from '../types';
import { IDENTITY } from '../constants';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, user }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-yellow-600/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group"
            onClick={() => setCurrentView(AppView.HOME)}
          >
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mr-3 group-hover:bg-yellow-400 transition-colors">
              <i className="fas fa-scissors text-black text-xl"></i>
            </div>
            <div>
              <span className="text-yellow-500 font-bold text-xl block leading-tight tracking-wider uppercase font-oswald">{IDENTITY.name}</span>
              <span className="text-gray-400 text-[10px] block uppercase tracking-[0.2em]">{IDENTITY.slogan}</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <a 
              href="https://wa.me/5544998276028" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md text-sm font-bold text-green-500 hover:text-green-400 transition-all uppercase flex items-center gap-2 group"
            >
              <i className="fab fa-whatsapp text-lg group-hover:scale-110 transition-transform"></i> Suporte
            </a>
            <button 
              onClick={() => setCurrentView(AppView.HOME)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === AppView.HOME ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'}`}
            >
              Início
            </button>
            <button 
              onClick={() => setCurrentView(AppView.BOOKING)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === AppView.BOOKING ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'}`}
            >
              Agendar
            </button>
            <button 
              onClick={() => setCurrentView(AppView.PRODUCTS)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === AppView.PRODUCTS ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'}`}
            >
              Produtos
            </button>
            {user && (
              <button 
                onClick={() => setCurrentView(AppView.USER_PROFILE)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === AppView.USER_PROFILE ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'}`}
              >
                Minha Conta
              </button>
            )}
            <button 
              onClick={() => setCurrentView(AppView.ADMIN)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all bg-yellow-600 text-black hover:bg-yellow-500 ml-4 font-oswald uppercase tracking-wider shadow-inner`}
            >
              Admin
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <a href="https://wa.me/5544998276028" target="_blank" rel="noopener noreferrer" className="text-green-500 mr-4">
              <i className="fab fa-whatsapp text-2xl"></i>
            </a>
            <button onClick={() => setCurrentView(AppView.BOOKING)} className="text-yellow-500 mr-4">
              <i className="fas fa-calendar-plus text-2xl"></i>
            </button>
            <button onClick={() => setCurrentView(AppView.ADMIN)} className="text-gray-300">
              <i className="fas fa-user-shield text-2xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
