
import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, Product, Expense, Service, User, ProductReservation, BlockedSlot } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  appointments: Appointment[];
  products: Product[];
  expenses: Expense[];
  services: Service[];
  users: User[];
  reservations: ProductReservation[];
  blockedSlots: BlockedSlot[];
  setProducts: (products: any) => void;
  setExpenses: (expenses: any) => void;
  setServices: (services: any) => void;
  setAppointments: (apps: any) => void;
  setUsers: (users: any) => void;
  setBlockedSlots: (slots: any) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  identity: any;
  setIdentity: (id: any) => void;
  setProductReservations: (res: any) => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  appointments, products, expenses, services, users, reservations, blockedSlots,
  setProducts, setExpenses, setServices, setAppointments, setUsers, setBlockedSlots,
  currentUser, setCurrentUser, identity, setIdentity, setProductReservations,
  isAdminAuthenticated, setIsAdminAuthenticated
}) => {
  // Added 'RESERVATIONS' to the allowed tab types to fix comparison errors on line 393
  const [activeTab, setActiveTab] = useState<'AGENDA' | 'FINANCE' | 'STOCK' | 'SERVICES' | 'USERS' | 'SETTINGS' | 'BLOCK_TIME' | 'RESERVATIONS'>('AGENDA');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showModal, setShowModal] = useState<'SERVICE' | 'APPOINTMENT' | 'RESERVATION' | 'PRODUCT' | 'USER' | 'STATUS_MODAL' | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [barberImagePreview, setBarberImagePreview] = useState<string | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);
  const [selectedBlockDate, setSelectedBlockDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (activeTab === 'FINANCE' && isAdminAuthenticated) {
      const timer = setTimeout(() => setChartReady(true), 300);
      return () => {
        clearTimeout(timer);
        setChartReady(false);
      };
    }
  }, [activeTab, isAdminAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email === 'admin@baruc.com' && loginForm.password === 'admin') {
      setIsAdminAuthenticated(true);
      setLoginForm({ email: '', password: '' });
    } else {
      alert('Credenciais administrativas incorretas.');
    }
  };

  // Finanças
  const serviceRevenue = useMemo(() => 
    appointments.filter(a => a.status === 'COMPLETED').reduce((acc, curr) => {
      const s = services.find(s => s.id === curr.serviceId);
      return acc + (s ? s.price : 0);
    }, 0), 
  [appointments, services]);

  const productRevenue = useMemo(() => 
    reservations.filter(r => r.status === 'PICKED_UP').reduce((acc, curr) => acc + curr.total, 0), 
  [reservations]);

  const totalRevenue = serviceRevenue + productRevenue;
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  const profit = totalRevenue - totalExpenses;

  const pieData = useMemo(() => [
    { name: 'Receitas', value: totalRevenue || 0.0001, color: '#eab308' },
    { name: 'Despesas', value: totalExpenses || 0.0001, color: '#ef4444' }
  ], [totalRevenue, totalExpenses]);

  const monthlyServicesSummary = useMemo(() => {
    const summary: Record<string, { qty: number; unitPrice: number; total: number }> = {};
    appointments.filter(a => a.status === 'COMPLETED').forEach(app => {
      const s = services.find(sv => sv.id === app.serviceId);
      if (s) {
        if (!summary[s.name]) summary[s.name] = { qty: 0, unitPrice: s.price, total: 0 };
        summary[s.name].qty += 1;
        summary[s.name].total += s.price;
      }
    });
    return summary;
  }, [appointments, services]);

  const monthlyProductsSummary = useMemo(() => {
    const summary: Record<string, { qty: number; unitPrice: number; total: number }> = {};
    reservations.filter(r => r.status === 'PICKED_UP').forEach(res => {
      res.items.forEach(it => {
        if (!summary[it.productName]) summary[it.productName] = { qty: 0, unitPrice: it.price, total: 0 };
        summary[it.productName].qty += it.quantity;
        summary[it.productName].total += it.price * it.quantity;
      });
    });
    return summary;
  }, [reservations]);

  const generateTimeSlots = () => {
    const slots = [];
    let current = 8 * 60; 
    const end = 19.5 * 60; 
    const breakStart = 12 * 60;
    const breakEnd = 13 * 60;
    while (current < end) {
      if (current < breakStart || current >= breakEnd) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
      current += 30;
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const toggleSlotBlock = (time: string) => {
    const exists = blockedSlots.find(s => s.date === selectedBlockDate && s.time === time);
    if (exists) {
      setBlockedSlots(blockedSlots.filter(s => !(s.date === selectedBlockDate && s.time === time)));
    } else {
      setBlockedSlots([...blockedSlots, { date: selectedBlockDate, time }]);
    }
  };

  const blockAllDay = () => {
    const newSlotsForDay = timeSlots.map(t => ({ date: selectedBlockDate, time: t }));
    const otherDays = blockedSlots.filter(s => s.date !== selectedBlockDate);
    setBlockedSlots([...otherDays, ...newSlotsForDay]);
  };

  const unblockAllDay = () => {
    setBlockedSlots(blockedSlots.filter(s => s.date !== selectedBlockDate));
  };

  const handleCRUD = (type: any, action: 'ADD' | 'EDIT' | 'DELETE', data?: any) => {
    if (action === 'DELETE') {
      if (!confirm('Deseja excluir permanentemente?')) return;
      if (type === 'SERVICE') setServices((prev: Service[]) => prev.filter(s => s.id !== data.id));
      if (type === 'PRODUCT') setProducts((prev: Product[]) => prev.filter(p => p.id !== data.id));
      if (type === 'USER') setUsers((prev: User[]) => prev.filter(u => u.id !== data.id));
      if (type === 'APPOINTMENT') setAppointments((prev: Appointment[]) => prev.filter(a => a.id !== data.id));
      if (type === 'RESERVATION') setProductReservations((prev: ProductReservation[]) => prev.filter(r => r.id !== data.id));
      return;
    }
    setImagePreview(data?.image || null);
    setEditingItem(data || {});
    setShowModal(type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'ITEM' | 'BARBER' | 'BG') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === 'ITEM') setImagePreview(result);
        if (target === 'BARBER') setBarberImagePreview(result);
        if (target === 'BG') setBgImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());

    if (showModal === 'SERVICE') {
      const obj = { 
        ...editingItem, 
        ...data, 
        id: editingItem.id || Math.random().toString(36).substr(2,9), 
        price: parseFloat(data.price as string), 
        durationMinutes: parseInt(data.durationMinutes as string),
        image: imagePreview || editingItem.image || 'https://picsum.photos/400/300'
      };
      if (editingItem.id) setServices((prev: any) => prev.map((s: any) => s.id === editingItem.id ? obj : s));
      else setServices((prev: any) => [...prev, obj]);
    } else if (showModal === 'PRODUCT') {
      const obj = { 
        ...editingItem, 
        ...data, 
        id: editingItem.id || Math.random().toString(36).substr(2,9), 
        price: parseFloat(data.price as string), 
        stock: parseInt(data.stock as string), 
        isActive: true,
        salesCount: editingItem.salesCount || 0,
        image: imagePreview || editingItem.image || 'https://picsum.photos/300/300'
      };
      if (editingItem.id) setProducts((prev: any) => prev.map((p: any) => p.id === editingItem.id ? obj : p));
      else setProducts((prev: any) => [...prev, obj]);
    } else if (showModal === 'APPOINTMENT') {
      const obj = { 
        ...editingItem, 
        ...data, 
        id: editingItem.id || Math.random().toString(36).substr(2,9), 
        date: new Date(data.date as string).toISOString(),
        status: editingItem.status || 'PENDING'
      };
      if (editingItem.id) setAppointments((prev: any) => prev.map((a: any) => a.id === editingItem.id ? obj : a));
      else setAppointments((prev: any) => [...prev, obj]);
    } else if (showModal === 'RESERVATION') {
      const newStatus = data.status as 'PENDING' | 'PICKED_UP' | 'CANCELLED';
      const obj = { ...editingItem, userName: data.userName as string, status: newStatus };
      setProductReservations((prev: ProductReservation[]) => prev.map(r => r.id === editingItem.id ? obj : r));
    }

    setShowModal(null);
    setEditingItem(null);
    setImagePreview(null);
  };

  const updateAppointmentStatus = (status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
    setAppointments((prev: Appointment[]) => prev.map(a => a.id === editingItem.id ? { ...a, status } : a));
    setShowModal(null);
    setEditingItem(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    setIdentity({
      ...identity,
      name: data.name,
      slogan: data.slogan,
      address: data.address,
      phone: data.phone,
      instagramUrl: data.instagramUrl,
      whatsappUrl: data.whatsappUrl,
      bgImage: bgImagePreview || identity.bgImage,
      barber: {
        name: data.barberName,
        image: barberImagePreview || identity.barber.image
      }
    });
    setBgImagePreview(null);
    setBarberImagePreview(null);
    alert('Site atualizado com sucesso!');
  };

  if (!isAdminAuthenticated) return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-neutral-900 p-10 rounded-3xl border border-yellow-600/20 text-center shadow-2xl animate-slide-up">
        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <i className="fas fa-user-shield text-black text-3xl"></i>
        </div>
        <h2 className="text-2xl font-oswald uppercase text-white mb-2 tracking-widest">Painel Administrativo</h2>
        <p className="text-gray-500 text-[10px] uppercase mb-8 tracking-widest font-bold">Acesso Restrito</p>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="E-mail" 
            value={loginForm.email} 
            onChange={e => setLoginForm({...loginForm, email: e.target.value})} 
            className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" 
            required 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={loginForm.password} 
            onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
            className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" 
            required 
          />
          <button className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 font-oswald uppercase tracking-widest">Entrar</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in relative">
      <a 
        href="https://wa.me/5544998276028" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed top-24 left-4 z-40 bg-green-600 text-white px-6 py-2 rounded-full shadow-xl hover:bg-green-500 transition-all font-bold text-xs uppercase flex items-center gap-2"
      >
        <i className="fab fa-whatsapp"></i> Suporte
      </a>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-bold text-yellow-500 font-oswald uppercase tracking-tight">Gestão Baruc</h2>
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Administrador Geral</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {['AGENDA', 'BLOCK_TIME', 'RESERVATIONS', 'FINANCE', 'STOCK', 'SERVICES', 'SETTINGS'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)} 
              className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-yellow-500 text-black' : 'bg-neutral-900 text-gray-400 hover:text-yellow-500'}`}
            >
              {tab === 'BLOCK_TIME' ? 'BLOQUEAR HORÁRIOS' : tab === 'RESERVATIONS' ? 'VENDAS' : tab}
            </button>
          ))}
          <button onClick={() => setIsAdminAuthenticated(false)} className="px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest bg-red-600/20 text-red-500 border border-red-600/30 ml-4">Sair</button>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-3xl p-8 border border-yellow-600/10 min-h-[600px] shadow-2xl relative">
        
        {activeTab === 'AGENDA' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-oswald uppercase text-white tracking-widest">Agenda Administrativa</h3>
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('BLOCK_TIME')} className="bg-neutral-800 text-yellow-500 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-yellow-600/30">Bloquear Horários</button>
                <button onClick={() => handleCRUD('APPOINTMENT', 'ADD')} className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Novo Horário</button>
              </div>
            </div>
            <div className="grid gap-3">
              {appointments.sort((a,b) => new Date(a.date).getTime() - new Date(a.date).getTime()).map(app => (
                <div key={app.id} className="bg-black p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center group transition-all hover:border-yellow-600/30">
                  <div className="flex items-center gap-5">
                    <div className="bg-yellow-500/10 p-4 rounded-xl font-oswald text-yellow-500 text-center min-w-[90px]"><span className="block text-xl">{new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span className="text-[9px] uppercase opacity-70">{new Date(app.date).toLocaleDateString('pt-BR')}</span></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-lg">{app.userName}</span>
                        <span onClick={() => handleCRUD('STATUS_MODAL', 'EDIT', app)} className={`text-[8px] cursor-pointer px-3 py-1 rounded-full uppercase font-bold tracking-widest ${app.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' : app.status === 'CANCELLED' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {app.status === 'COMPLETED' ? 'Cumprido' : app.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                        </span>
                      </div>
                      <span className="text-gray-500 text-[10px] uppercase font-bold">{services.find(s => s.id === app.serviceId)?.name} • {app.userPhone}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4 md:mt-0"><button onClick={() => handleCRUD('APPOINTMENT', 'EDIT', app)} className="text-gray-600 hover:text-yellow-500 transition-colors"><i className="fas fa-edit"></i></button><button onClick={() => handleCRUD('APPOINTMENT', 'DELETE', app)} className="text-gray-600 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'BLOCK_TIME' && (
          <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-oswald uppercase text-white tracking-widest">Bloquear Horários</h3>
                <button onClick={() => setActiveTab('AGENDA')} className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest">Voltar para Agenda</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-1 space-y-4">
                  <label className="text-[10px] text-gray-500 uppercase font-bold block tracking-widest">1. Selecione o Dia</label>
                  <input 
                    type="date" 
                    value={selectedBlockDate}
                    onChange={(e) => setSelectedBlockDate(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-5 text-white outline-none focus:border-yellow-500 transition-all font-bold"
                  />
                  <div className="pt-6 space-y-3">
                    <button onClick={blockAllDay} className="w-full bg-red-600/10 text-red-500 border border-red-600/30 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Bloquear Dia Todo</button>
                    <button onClick={unblockAllDay} className="w-full bg-white/5 text-gray-500 border border-white/10 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all">Liberar Dia Todo</button>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] text-gray-500 uppercase font-bold block tracking-widest">2. Horários Disponíveis para Bloqueio</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {timeSlots.map(t => {
                      const isBlocked = blockedSlots.some(s => s.date === selectedBlockDate && s.time === t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggleSlotBlock(t)}
                          className={`py-4 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${isBlocked ? 'bg-red-600 border-red-600 text-white shadow-lg scale-95' : 'bg-black border-white/10 text-gray-500 hover:border-yellow-500'}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-gray-600 uppercase italic mt-4">* Horários marcados em vermelho estão bloqueados para os clientes.</p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'RESERVATIONS' && (
          <div className="space-y-6">
            <h3 className="text-xl font-oswald uppercase text-white mb-6 tracking-widest">Vendas de Produtos</h3>
            <div className="grid gap-4">
              {reservations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(res => (
                <div key={res.id} className={`bg-black p-6 rounded-2xl border-2 border-yellow-600/10 flex justify-between items-center transition-all ${res.status === 'PICKED_UP' ? 'opacity-60' : res.status === 'CANCELLED' ? 'opacity-30' : 'shadow-lg'}`}>
                  <div>
                    <span className="text-white font-bold text-lg block font-oswald uppercase">{res.userName}</span>
                    <span className={`text-[8px] px-3 py-1 rounded-full uppercase font-bold tracking-widest ${res.status === 'PICKED_UP' ? 'bg-green-500/10 text-green-500' : res.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{res.status === 'PICKED_UP' ? 'Vendido' : res.status === 'CANCELLED' ? 'Cancelado' : 'Reservado'}</span>
                    <div className="mt-2 text-[10px] text-gray-500 font-bold">{res.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-2xl font-bold text-yellow-500 font-oswald">R$ {res.total.toFixed(2)}</span>
                    <div className="flex gap-4"><button onClick={() => handleCRUD('RESERVATION', 'EDIT', res)} className="text-gray-600 hover:text-yellow-500"><i className="fas fa-edit"></i></button><button onClick={() => handleCRUD('RESERVATION', 'DELETE', res)} className="text-gray-600 hover:text-red-500"><i className="fas fa-trash-alt"></i></button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'FINANCE' && (
          <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black p-8 rounded-2xl border border-yellow-500/20 text-center shadow-lg"><span className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Faturamento Confirmado</span><span className="text-4xl font-bold text-yellow-500 font-oswald">R$ {totalRevenue.toFixed(2)}</span></div>
              <div className="bg-black p-8 rounded-2xl border border-red-500/20 text-center shadow-lg"><span className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Despesas Lançadas</span><span className="text-4xl font-bold text-red-500 font-oswald">R$ {totalExpenses.toFixed(2)}</span></div>
              <div className="bg-black p-8 rounded-2xl border border-green-500/20 text-center shadow-lg"><span className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Resultado Líquido</span><span className="text-4xl font-bold text-green-500 font-oswald">R$ {profit.toFixed(2)}</span></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-black/40 p-10 rounded-3xl border border-white/5 flex flex-col" style={{ minHeight: '400px' }}>
                <h4 className="text-white font-oswald uppercase mb-8 text-xs tracking-[0.2em]">Balanço Geral</h4>
                <div className="flex-grow w-full" style={{ height: '300px' }}>
                  {chartReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px'}} itemStyle={{color: '#fff', fontSize: '10px'}} /><Legend iconType="circle" /></PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full flex items-center justify-center text-gray-700 uppercase text-[9px]">Aguarde...</div>}
                </div>
              </div>
              <div className="bg-black/40 p-10 rounded-3xl border border-white/5 h-fit shadow-lg">
                <h4 className="text-white font-oswald uppercase mb-8 text-xs tracking-[0.2em]">Lançar Despesa</h4>
                <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget as HTMLFormElement; const d = Object.fromEntries(new FormData(f).entries()); setExpenses((prev: Expense[]) => [...prev, { id: Math.random().toString(36).substr(2,9), description: d.desc as string, amount: parseFloat(d.val as string), date: new Date().toISOString() }]); f.reset(); alert('Despesa registrada!'); }} className="space-y-4">
                  <input name="desc" placeholder="Ex: Fornecedor, Energia..." required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" /><input name="val" type="number" step="0.01" placeholder="Valor (R$)" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" /><button className="w-full bg-red-600/10 text-red-500 border border-red-600/20 py-4 rounded-xl font-bold uppercase text-[10px]">Salvar Saída</button>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               <div className="bg-black/40 p-8 rounded-3xl border border-white/5 overflow-x-auto">
                  <h4 className="text-yellow-500 font-oswald uppercase mb-6 text-xs tracking-[0.2em]">Serviços Confirmados</h4>
                  <table className="w-full text-left text-[10px] uppercase font-bold tracking-widest">
                    <thead className="text-gray-500 border-b border-white/10">
                      <tr><th className="py-4">Serviço</th><th className="py-4">Qtd</th><th className="py-4">Unitário</th><th className="py-4 text-right">Total</th></tr>
                    </thead>
                    <tbody className="text-gray-300 divide-y divide-white/5">
                      {(Object.entries(monthlyServicesSummary) as [string, any][]).map(([name, data]) => (
                        <tr key={name}><td className="py-4">{name}</td><td className="py-4">{data.qty}</td><td className="py-4">R$ {data.unitPrice.toFixed(2)}</td><td className="py-4 text-right text-white">R$ {data.total.toFixed(2)}</td></tr>
                      ))}
                      <tr className="border-t-2 border-yellow-500/30 font-bold"><td colSpan={3} className="py-4 text-yellow-500">TOTAL GERAL SERVIÇOS</td><td className="py-4 text-right text-yellow-500 text-sm">R$ {serviceRevenue.toFixed(2)}</td></tr>
                    </tbody>
                  </table>
               </div>
               <div className="bg-black/40 p-8 rounded-3xl border border-white/5 overflow-x-auto">
                  <h4 className="text-yellow-500 font-oswald uppercase mb-6 text-xs tracking-[0.2em]">Vendas de Loja</h4>
                  <table className="w-full text-left text-[10px] uppercase font-bold tracking-widest">
                    <thead className="text-gray-500 border-b border-white/10">
                      <tr><th className="py-4">Produto</th><th className="py-4">Qtd</th><th className="py-4">Unitário</th><th className="py-4 text-right">Total</th></tr>
                    </thead>
                    <tbody className="text-gray-300 divide-y divide-white/5">
                      {(Object.entries(monthlyProductsSummary) as [string, any][]).map(([name, data]) => (
                        <tr key={name}><td className="py-4">{name}</td><td className="py-4">{data.qty}</td><td className="py-4">R$ {data.unitPrice.toFixed(2)}</td><td className="py-4 text-right text-white">R$ {data.total.toFixed(2)}</td></tr>
                      ))}
                      <tr className="border-t-2 border-yellow-500/30 font-bold"><td colSpan={3} className="py-4 text-yellow-500">TOTAL GERAL PRODUTOS</td><td className="py-4 text-right text-yellow-500 text-sm">R$ {productRevenue.toFixed(2)}</td></tr>
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'STOCK' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-oswald uppercase text-white tracking-widest">Estoque</h3><button onClick={() => handleCRUD('PRODUCT', 'ADD')} className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Novo Produto</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-black p-6 rounded-2xl border border-white/5 group hover:border-yellow-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-yellow-500 text-[8px] uppercase font-bold">{p.brand}</span>
                    <div className="flex gap-3"><button onClick={() => handleCRUD('PRODUCT', 'EDIT', p)} className="text-gray-600 hover:text-yellow-500"><i className="fas fa-edit"></i></button><button onClick={() => handleCRUD('PRODUCT', 'DELETE', p)} className="text-gray-600 hover:text-red-500"><i className="fas fa-trash-alt"></i></button></div>
                  </div>
                  <div className="mb-4 aspect-square rounded-xl overflow-hidden bg-neutral-900"><img src={p.image} className="w-full h-full object-cover" /></div>
                  <h4 className="text-white font-oswald uppercase mb-2 text-lg">{p.name}</h4>
                  <div className="flex justify-between items-end border-t border-white/5 pt-4"><div><span className="text-[8px] text-gray-600 uppercase block font-bold">Saldo</span><span className={`text-xl font-bold font-oswald ${p.stock <= 2 ? 'text-red-500' : 'text-white'}`}>{p.stock} un.</span></div><span className="text-yellow-500 font-bold text-lg font-oswald">R$ {p.price.toFixed(2)}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SERVICES' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-oswald uppercase text-white tracking-widest">Serviços</h3><button onClick={() => handleCRUD('SERVICE', 'ADD')} className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Novo Serviço</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map(s => (
                <div key={s.id} className="bg-black p-6 rounded-2xl border border-white/5 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden"><img src={s.image} className="w-full h-full object-cover" /></div>
                    <div className="flex gap-4"><button onClick={() => handleCRUD('SERVICE', 'EDIT', s)} className="text-gray-600 hover:text-yellow-500"><i className="fas fa-edit"></i></button><button onClick={() => handleCRUD('SERVICE', 'DELETE', s)} className="text-gray-600 hover:text-red-500"><i className="fas fa-trash-alt"></i></button></div>
                  </div>
                  <h4 className="text-white font-oswald uppercase mb-1 text-lg">{s.name}</h4>
                  <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">{s.durationMinutes} min • R$ {s.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-oswald uppercase text-white mb-6 tracking-widest border-b border-white/5 pb-4">Personalização do Sistema</h3>
            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div><label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Marca</label><input name="name" defaultValue={identity.name} placeholder="Nome da Barbearia" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500 mb-4 font-bold" /><input name="slogan" defaultValue={identity.slogan} placeholder="Slogan" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" /></div>
                  <div><label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Endereço e Contato</label><input name="address" defaultValue={identity.address} placeholder="Endereço" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500 mb-4" /><input name="phone" defaultValue={identity.phone} placeholder="Telefone" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Instagram</label><input name="instagramUrl" defaultValue={identity.instagramUrl} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white text-xs" /></div>
                    <div><label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">WhatsApp</label><input name="whatsappUrl" defaultValue={identity.whatsappUrl} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white text-xs" /></div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Equipe Principal</label>
                    <input name="barberName" defaultValue={identity.barber.name} placeholder="Nome do Barbeiro" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500 mb-4" />
                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Trocar Foto da Equipe</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'BARBER')} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white text-xs mb-2 cursor-pointer" />
                    {(barberImagePreview || identity.barber.image) && <img src={barberImagePreview || identity.barber.image} className="w-20 h-20 object-cover rounded-full border border-yellow-500/30 shadow-lg" />}
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Imagem de Fundo Hero</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'BG')} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white text-xs mb-2 cursor-pointer" />
                    {(bgImagePreview || identity.bgImage) && <img src={bgImagePreview || identity.bgImage} className="w-full h-32 object-cover rounded-xl border border-yellow-500/30 shadow-inner" />}
                  </div>
                  <div className="pt-6"><button type="submit" className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl hover:bg-yellow-400 uppercase font-oswald tracking-widest shadow-xl">Confirmar Alterações</button></div>
               </div>
            </form>
          </div>
        )}

      </div>

      {/* Modais */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          {showModal === 'STATUS_MODAL' ? (
             <div className="bg-neutral-900 w-full max-w-xs rounded-3xl border border-yellow-600/20 p-8 space-y-4 animate-slide-up shadow-2xl text-center">
                <h3 className="text-xl font-oswald uppercase text-white mb-6 tracking-widest">Status do Corte</h3>
                <button onClick={() => updateAppointmentStatus('PENDING')} className="w-full bg-neutral-800 text-yellow-500 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Aguardando</button>
                <button onClick={() => updateAppointmentStatus('COMPLETED')} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Cumprido</button>
                <button onClick={() => updateAppointmentStatus('CANCELLED')} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Liberar Horário</button>
                <button onClick={() => setShowModal(null)} className="w-full bg-transparent text-gray-500 py-2 text-[10px] uppercase font-bold">Voltar</button>
             </div>
          ) : (
            <form onSubmit={saveItem} className="bg-neutral-900 w-full max-w-md rounded-3xl border border-yellow-600/20 p-8 space-y-5 animate-slide-up shadow-2xl">
              <h3 className="text-2xl font-oswald uppercase text-white mb-6 border-b border-white/5 pb-4 tracking-widest">{editingItem?.id ? 'Editar' : 'Criar'} Registro</h3>
              
              {(showModal === 'SERVICE' || showModal === 'PRODUCT') && (
                <div className="space-y-5">
                  <input name="name" defaultValue={editingItem?.name} placeholder="Nome" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" />
                  {showModal === 'PRODUCT' && <input name="brand" defaultValue={editingItem?.brand} placeholder="Marca" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" />}
                  <div className="grid grid-cols-2 gap-4">
                    <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} placeholder="Preço (R$)" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" />
                    {showModal === 'SERVICE' ? <input name="durationMinutes" type="number" defaultValue={editingItem?.durationMinutes} placeholder="Minutos" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" /> : <input name="stock" type="number" defaultValue={editingItem?.stock} placeholder="Estoque" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" />}
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Upload de Foto / Preview</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'ITEM')} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white text-xs mb-2 cursor-pointer" />
                    {(imagePreview || editingItem?.image) && <img src={imagePreview || editingItem?.image} className="mt-2 w-full h-32 object-cover rounded-xl border border-white/5 shadow-inner" />}
                  </div>
                </div>
              )}

              {showModal === 'APPOINTMENT' && (
                <>
                  <input name="userName" defaultValue={editingItem?.userName} placeholder="Nome do Cliente" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" />
                  <input name="userPhone" defaultValue={editingItem?.userPhone} placeholder="WhatsApp" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" />
                  <select name="serviceId" defaultValue={editingItem?.serviceId} required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500"><option value="" disabled>Selecionar Serviço</option>{services.map(s => <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>)}</select>
                  <input name="date" type="datetime-local" defaultValue={editingItem?.date ? new Date(editingItem.date).toISOString().slice(0, 16) : ''} required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-yellow-500" />
                </>
              )}

              {showModal === 'RESERVATION' && (
                <>
                  <input name="userName" defaultValue={editingItem?.userName} placeholder="Nome do Cliente" required className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none" />
                  <div><label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Status da Venda</label><select name="status" defaultValue={editingItem?.status} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none uppercase font-bold"><option value="PENDING">Pendente</option><option value="PICKED_UP">Vendido</option><option value="CANCELLED">Cancelado</option></select></div>
                </>
              )}

              <div className="flex gap-4 pt-4"><button type="button" onClick={() => { setShowModal(null); setEditingItem(null); setImagePreview(null); }} className="flex-grow bg-white/5 text-gray-500 py-4 rounded-xl uppercase font-bold text-[10px] tracking-widest">Sair</button><button type="submit" className="flex-grow bg-yellow-500 text-black py-4 rounded-xl uppercase font-bold text-[10px] tracking-widest shadow-lg">Confirmar</button></div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
 