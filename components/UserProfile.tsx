
import React from 'react';
import { User, Appointment, Service, ProductReservation } from '../types';

interface UserProfileProps {
  user: User | null;
  appointments: Appointment[];
  services: Service[];
  reservations: ProductReservation[];
  onCancelAppointment: (id: string) => void;
  onCancelReservation: (id: string) => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, appointments, services, reservations, onCancelAppointment, onCancelReservation, onLogout }) => {
  if (!user) return <div className="text-center py-20 text-gray-500 font-oswald uppercase">Realize o login para ver seu perfil.</div>;

  const userAppointments = appointments.filter(a => a.userId === user.id);
  const userReservations = reservations.filter(r => r.userId === user.id);

  const handleCancelApp = (app: Appointment) => {
    // Redireciona para o WhatsApp conforme solicitado, o horário continua ocupado no sistema
    window.open("https://wa.me/5544998276028", "_blank");
    alert('Você foi redirecionado ao WhatsApp para solicitar o cancelamento ou reagendamento do seu horário.');
  };

  const handleCancelRes = (res: ProductReservation) => {
    // Redireciona para o WhatsApp conforme solicitado para desistência de pedido
    window.open("https://wa.me/5544998276028", "_blank");
    alert('Você foi redirecionado ao WhatsApp para solicitar a desistência do seu pedido.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 bg-neutral-900 p-8 rounded-3xl border border-yellow-500/10 shadow-xl">
        <div className="flex items-center space-x-8">
          <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <span className="text-4xl font-bold text-black uppercase font-oswald">{user.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white uppercase font-oswald tracking-wider">{user.name}</h2>
            <div className="flex items-center gap-4 mt-2">
                <p className="text-yellow-500 font-bold uppercase text-[10px] tracking-widest"><i className="fab fa-whatsapp mr-2"></i> {user.phone}</p>
                <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">• Perfil Cliente</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-600/10 text-red-500 border border-red-600/20 px-10 py-3 rounded-full font-bold uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-lg"
        >
          Sair da Conta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-neutral-900 rounded-3xl p-10 border border-yellow-600/10 h-fit shadow-2xl relative">
          <h3 className="text-2xl font-bold text-yellow-500 mb-8 font-oswald uppercase tracking-widest flex items-center">
            <i className="fas fa-history mr-4 opacity-50"></i> Meus Agendamentos
          </h3>
          {userAppointments.length === 0 ? (
            <p className="text-xs uppercase tracking-widest text-gray-600 text-center py-10">Nenhum agendamento encontrado.</p>
          ) : (
            <div className="space-y-4">
              {userAppointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(app => {
                const service = services.find(s => s.id === app.serviceId);
                const date = new Date(app.date);
                const active = app.status === 'PENDING';
                
                return (
                  <div key={app.id} className={`bg-black p-6 rounded-2xl border transition-all ${active ? 'border-white/5 hover:border-yellow-500/30 shadow-inner' : 'opacity-30'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <span className="font-bold block uppercase text-xl font-oswald tracking-wider text-white">{service?.name}</span>
                          <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1 block font-bold">
                            {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                          <span className={`text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border ${app.status === 'COMPLETED' ? 'text-green-500 border-green-500/20 bg-green-500/10' : app.status === 'CANCELLED' ? 'text-red-500 border-red-500/20 bg-red-500/10' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10'}`}>
                            {app.status === 'COMPLETED' ? 'Cumprido' : app.status === 'CANCELLED' ? 'Cancelado' : 'Reservado'}
                          </span>
                          {active && (
                            <button 
                              onClick={() => handleCancelApp(app)}
                              className="text-[10px] text-red-500 font-bold hover:text-red-400 uppercase tracking-widest underline underline-offset-4"
                            >
                              Cancelar Horário
                            </button>
                          )}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-neutral-900 rounded-3xl p-10 border border-yellow-600/10 h-fit shadow-2xl relative">
          <h3 className="text-2xl font-bold text-yellow-500 mb-8 font-oswald uppercase tracking-widest flex items-center">
            <i className="fas fa-bag-shopping mr-4 opacity-50"></i> Meus Pedidos
          </h3>
          {userReservations.length === 0 ? (
            <p className="text-[10px] uppercase tracking-widest text-gray-600 text-center py-10">Nenhuma reserva.</p>
          ) : (
            <div className="space-y-6">
              {userReservations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(res => (
                <div key={res.id} className={`bg-black p-6 rounded-2xl border transition-all hover:border-yellow-500/20 shadow-inner ${res.status === 'CANCELLED' ? 'opacity-30' : 'border-white/5'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-gray-600 text-[9px] uppercase font-bold">{new Date(res.date).toLocaleDateString()}</span>
                    <span className={`text-[8px] px-3 py-1 rounded-full uppercase font-bold border ${res.status === 'PICKED_UP' ? 'text-green-500 border-green-500/20' : res.status === 'CANCELLED' ? 'text-red-500 border-red-500/20' : 'text-yellow-500 border-yellow-500/20'}`}>
                      {res.status === 'PICKED_UP' ? 'Finalizado' : res.status === 'CANCELLED' ? 'Cancelado' : 'Reservado'}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {res.items.map((item, idx) => (
                      <p key={idx} className="text-[10px] text-gray-400 font-bold uppercase">
                        {item.quantity}x {item.productName}
                      </p>
                    ))}
                  </div>
                  <div className="text-right border-t border-white/5 pt-4 flex justify-between items-center">
                    {(res.status === 'PENDING') && (
                        <button 
                            onClick={() => handleCancelRes(res)}
                            className="text-[10px] text-red-500 font-bold hover:text-red-400 uppercase tracking-widest underline underline-offset-4"
                        >
                            Desistir do Pedido
                        </button>
                    )}
                    <span className="text-xl font-bold text-yellow-500 font-oswald ml-auto">R$ {res.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
