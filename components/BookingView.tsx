
import React, { useState } from 'react';
import { Service, Appointment, BlockedSlot } from '../types';

interface BookingViewProps {
  services: Service[];
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  onBook: (serviceId: string, date: string) => void;
}

const BookingView: React.FC<BookingViewProps> = ({ services, appointments, blockedSlots, onBook }) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const getService = (id: string) => services.find(s => s.id === id);

  const isSlotOccupied = (dateStr: string, timeStr: string, serviceId: string) => {
    const service = getService(serviceId);
    if (!service) return true;

    const requestedStart = new Date(`${dateStr}T${timeStr}:00`).getTime();
    const requestedEnd = requestedStart + service.durationMinutes * 60000;

    // Não permitir horários no passado
    if (requestedStart < Date.now()) return true;

    // Verificar se o administrador bloqueou este horário específico
    const isBlocked = blockedSlots.some(s => s.date === dateStr && s.time === timeStr);
    if (isBlocked) return true;

    return appointments.some(app => {
      const appService = getService(app.serviceId);
      if (!appService || app.status === 'CANCELLED') return false;

      const appStart = new Date(app.date).getTime();
      const appEnd = appStart + appService.durationMinutes * 60000;

      const isSameDay = app.date.split('T')[0] === dateStr;
      if (!isSameDay) return false;

      // Detecta sobreposição de qualquer minuto entre os intervalos
      const overlap = (requestedStart < appEnd && requestedEnd > appStart);
      return overlap;
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    let current = 8 * 60; // 08:00
    const end = 19.5 * 60; // 19:30
    const breakStart = 12 * 60;
    const breakEnd = 13 * 60;

    while (current < end) {
      if (current < breakStart || current >= breakEnd) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
      current += 30; // Slots de 30 em 30 para permitir granularidade de 30min ou 1h
    }
    return slots;
  };

  const slots = generateTimeSlots();

  const handleConfirm = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Selecione todos os campos para prosseguir.');
      return;
    }
    onBook(selectedService, `${selectedDate}T${selectedTime}:00`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-slide-up">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-yellow-500 font-oswald uppercase mb-2">Agendamento Online</h2>
        <p className="text-gray-400 italic">"Seu novo visual começa com um horário marcado"</p>
      </div>

      <div className="bg-neutral-900 p-8 rounded-3xl border border-yellow-600/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <i className="fas fa-scissors text-8xl text-yellow-500"></i>
        </div>
        
        <div className="space-y-10 relative z-10">
          <div>
            <label className="block text-yellow-500 font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">1. Escolha o serviço desejado</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s.id); setSelectedTime(''); }}
                  className={`p-5 rounded-xl border transition-all text-left flex justify-between items-center ${selectedService === s.id ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-black border-white/10 text-gray-400 hover:border-yellow-600/50'}`}
                >
                  <div>
                    <span className="font-bold block uppercase font-oswald text-lg tracking-wider">{s.name}</span>
                    <span className="text-[9px] opacity-70 tracking-widest font-bold uppercase">{s.durationMinutes} MINUTOS</span>
                  </div>
                  <span className="font-bold font-oswald text-xl">R$ {s.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-yellow-500 font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">2. Selecione o dia</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-black border border-white/10 rounded-xl p-5 text-white outline-none focus:border-yellow-500 transition-all font-bold"
              />
            </div>

            <div>
              <label className="block text-yellow-500 font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">3. Horário disponível</label>
              <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedDate && selectedService ? slots.map(t => {
                  const occupied = isSlotOccupied(selectedDate, t, selectedService);
                  return (
                    <button
                      key={t}
                      disabled={occupied}
                      onClick={() => setSelectedTime(t)}
                      className={`py-3 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-widest ${occupied ? 'opacity-10 cursor-not-allowed bg-gray-900 border-transparent text-gray-700' : selectedTime === t ? 'bg-yellow-500 border-yellow-500 text-black scale-105 shadow-lg' : 'bg-black border-white/5 text-gray-500 hover:text-white hover:border-yellow-500/30'}`}
                    >
                      {t}
                    </button>
                  );
                }) : (
                  <div className="col-span-3 text-center py-10 opacity-30">
                    <i className="fas fa-calendar-day text-4xl mb-4 block"></i>
                    <p className="text-[10px] uppercase tracking-widest font-bold">Aguardando serviço e data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-gray-600 text-[10px] uppercase tracking-widest font-bold leading-relaxed">
              <p className="mb-1"><i className="fas fa-clock mr-3 text-yellow-500"></i> Duração: {selectedService ? getService(selectedService)?.durationMinutes : '--'} min.</p>
              <p><i className="fas fa-calendar-check mr-3 text-yellow-500"></i> Cancelamento: Entre em contato pelo WhatsApp.</p>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!selectedService || !selectedDate || !selectedTime}
              className="w-full md:w-auto bg-yellow-500 text-black px-16 py-5 rounded-full font-bold text-sm hover:bg-yellow-400 transition-all disabled:opacity-20 disabled:grayscale font-oswald uppercase tracking-widest shadow-[0_10px_30px_rgba(234,179,8,0.2)]"
            >
              Finalizar Agendamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingView;
