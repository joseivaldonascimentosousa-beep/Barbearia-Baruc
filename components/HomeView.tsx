
import React from 'react';
import { SERVICES } from '../constants';

interface HomeViewProps {
  onBookClick: () => void;
  onProductsClick: () => void;
  identity: any;
}

const HomeView: React.FC<HomeViewProps> = ({ onBookClick, onProductsClick, identity }) => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={identity.bgImage} 
            alt="Barbearia Background" 
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-yellow-500 mb-4 tracking-tighter uppercase font-oswald">
            {identity.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto italic">
            "{identity.slogan}"
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onBookClick}
              className="bg-yellow-500 text-black px-10 py-4 rounded-full text-lg font-bold hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
            >
              AGENDAR HORÁRIO
            </button>
            <button 
              onClick={onProductsClick}
              className="bg-transparent border-2 border-yellow-500 text-yellow-500 px-10 py-4 rounded-full text-lg font-bold hover:bg-yellow-500 hover:text-black transition-all transform hover:scale-105"
            >
              COMPRAR PRODUTOS
            </button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-neutral-900 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <div className="relative group">
              <img 
                src={identity.barber.image} 
                alt={identity.barber.name} 
                className="rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 w-full aspect-square object-cover border-4 border-yellow-500/20"
              />
              <div className="absolute -bottom-6 -right-6 bg-yellow-500 p-6 rounded-xl shadow-xl">
                <span className="text-black font-bold block text-sm">BARBEIRO RESPONSÁVEL</span>
                <span className="text-black font-oswald text-2xl uppercase">{identity.barber.name}</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl font-bold text-yellow-500 mb-6 font-oswald uppercase">Excelência em cada detalhe</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Localizada em Rondon, a Barbearia Baruc é referência em atendimento personalizado. Sob o comando de {identity.barber.name}, transformamos o momento do corte em uma experiência de cuidado e estilo.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-yellow-600/20 p-4 rounded-lg bg-black/50">
                <i className="fas fa-clock text-yellow-500 mb-2 block"></i>
                <span className="text-sm text-gray-500 block">Atendimento</span>
                <span className="text-white font-bold">Seg - Sáb</span>
              </div>
              <div className="border border-yellow-600/20 p-4 rounded-lg bg-black/50">
                <i className="fas fa-location-dot text-yellow-500 mb-2 block"></i>
                <span className="text-sm text-gray-500 block">Onde estamos</span>
                <span className="text-white font-bold">{identity.address.split(',')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-yellow-500 font-oswald uppercase mb-4">Nossos Serviços</h2>
          <div className="h-1 w-20 bg-yellow-500 mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map(service => (
            <div key={service.id} className="bg-neutral-900 border border-yellow-600/20 p-8 rounded-2xl hover:border-yellow-500 transition-colors group flex flex-col h-full">
              <div className="mb-6 h-12 w-12 bg-yellow-500/10 flex items-center justify-center rounded-lg group-hover:bg-yellow-500 transition-colors">
                 <i className="fas fa-cut text-yellow-500 group-hover:text-black transition-colors"></i>
              </div>
              <h3 className="text-xl font-bold mb-2 font-oswald uppercase">{service.name}</h3>
              <p className="text-gray-500 text-sm mb-6 h-12 overflow-hidden">{service.description}</p>
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                <span className="text-2xl font-bold text-yellow-500">R$ {service.price.toFixed(2)}</span>
                <span className="text-gray-400 text-xs italic">{service.durationMinutes} min</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;
