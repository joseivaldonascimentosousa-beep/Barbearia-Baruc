
import React, { useState } from 'react';

interface AuthViewProps {
  onAuth: (name: string, phone: string) => void;
  onCancel: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuth, onCancel }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Por favor, preencha nome e telefone.');
      return;
    }
    onAuth(name, phone);
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4 animate-slide-up">
      <div className="bg-neutral-900 p-8 rounded-3xl border border-yellow-600/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-plus text-black text-2xl"></i>
          </div>
          <h2 className="text-2xl font-oswald uppercase text-white">Identifique-se</h2>
          <p className="text-gray-400 text-sm italic mt-2">Para agendar, precisamos do seu contato.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1 ml-2">Seu Nome</label>
            <input 
              type="text" 
              placeholder="Ex: João Silva" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1 ml-2">Telefone / WhatsApp</label>
            <input 
              type="tel" 
              placeholder="Ex: 44 99827-6028" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500 transition-all"
              required
            />
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit" 
              className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 font-oswald uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]"
            >
              Acessar Agenda
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="w-full bg-transparent text-gray-500 font-bold py-2 rounded-xl hover:text-white transition-all text-xs uppercase"
            >
              Voltar
            </button>
          </div>
        </form>
        
        <p className="text-[10px] text-gray-600 mt-8 text-center uppercase tracking-widest">
          Barbearia Baruc • Segurança e Privacidade
        </p>
      </div>
    </div>
  );
};

export default AuthView;
