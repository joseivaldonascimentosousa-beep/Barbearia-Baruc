
import React, { useState, useEffect } from 'react';
import { AppView, User, Product, Appointment, Expense, Service, ProductReservation, CartItem, BlockedSlot } from './types';
import { IDENTITY, SERVICES, INITIAL_PRODUCTS } from './constants';
import Header from './components/Header';
import HomeView from './components/HomeView';
import BookingView from './components/BookingView';
import ProductView from './components/ProductView';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import AuthView from './components/AuthView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [productReservations, setProductReservations] = useState<ProductReservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [appIdentity, setAppIdentity] = useState(IDENTITY);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

  // Carregamento inicial do LocalStorage
  useEffect(() => {
    const savedIdentity = localStorage.getItem('baruc_identity');
    if (savedIdentity) setAppIdentity(JSON.parse(savedIdentity));

    const savedUsers = localStorage.getItem('baruc_all_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    const savedUser = localStorage.getItem('baruc_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedAdminAuth = localStorage.getItem('baruc_admin_auth');
    if (savedAdminAuth === 'true') setIsAdminAuthenticated(true);

    const savedApps = localStorage.getItem('baruc_appointments');
    if (savedApps) setAppointments(JSON.parse(savedApps));

    const savedRes = localStorage.getItem('baruc_reservations');
    if (savedRes) setProductReservations(JSON.parse(savedRes));

    const savedExp = localStorage.getItem('baruc_expenses');
    if (savedExp) setExpenses(JSON.parse(savedExp));

    const savedProds = localStorage.getItem('baruc_products');
    if (savedProds) setProducts(JSON.parse(savedProds));
    
    const savedServ = localStorage.getItem('baruc_services');
    if (savedServ) setServices(JSON.parse(savedServ));

    const savedBlocked = localStorage.getItem('baruc_blocked_slots');
    if (savedBlocked) setBlockedSlots(JSON.parse(savedBlocked));
  }, []);

  // Persistência automática
  useEffect(() => { localStorage.setItem('baruc_identity', JSON.stringify(appIdentity)); }, [appIdentity]);
  useEffect(() => { localStorage.setItem('baruc_all_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('baruc_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('baruc_reservations', JSON.stringify(productReservations)); }, [productReservations]);
  useEffect(() => { localStorage.setItem('baruc_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('baruc_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('baruc_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('baruc_blocked_slots', JSON.stringify(blockedSlots)); }, [blockedSlots]);
  useEffect(() => { localStorage.setItem('baruc_admin_auth', isAdminAuthenticated.toString()); }, [isAdminAuthenticated]);

  const handleAuth = (name: string, phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const existingUser = users.find(u => u.phone.replace(/\D/g, '') === cleanPhone);
    
    if (existingUser) {
      setCurrentUser(existingUser);
      localStorage.setItem('baruc_user', JSON.stringify(existingUser));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        phone,
        isAdmin: false,
        visitCount: 0,
        totalProductSpend: 0
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('baruc_user', JSON.stringify(newUser));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('baruc_user');
    setCurrentView(AppView.HOME);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('baruc_admin_auth');
  };

  const handleBooking = (serviceId: string, date: string) => {
    if (!currentUser) {
      setCurrentView(AppView.BOOKING);
      return;
    }
    
    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      serviceId,
      date,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      isManual: false
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, visitCount: u.visitCount + 1 } : u));
    
    alert('Agendamento realizado com sucesso!');
    setCurrentView(AppView.USER_PROFILE);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    window.open("https://wa.me/5544998276028", "_blank");
  };

  const handleCancelReservation = (reservationId: string) => {
    window.open("https://wa.me/5544998276028", "_blank");
  };

  const handleReservation = (cart: CartItem[]) => {
    if (!currentUser) {
      setCurrentView(AppView.BOOKING);
      return;
    }
    if (cart.length === 0) return;

    let hasStock = true;
    cart.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p || p.stock < item.quantity) hasStock = false;
    });

    if (!hasStock) {
      alert('Desculpe, algum item no seu carrinho ficou sem estoque.');
      return;
    }

    setProducts(prevProds => prevProds.map(p => {
      const item = cart.find(it => it.productId === p.id);
      if (item) return { ...p, stock: p.stock - item.quantity };
      return p;
    }));

    const reservationItems = cart.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price
      };
    });

    const total = reservationItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const newRes: ProductReservation = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      items: reservationItems,
      total,
      date: new Date().toISOString(),
      status: 'PENDING'
    };

    setProductReservations(prev => [...prev, newRes]);
    alert('Produtos reservados! Sua reserva está aguardando retirada e confirmação na barbearia.');
    setCurrentView(AppView.USER_PROFILE);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <HomeView onBookClick={() => setCurrentView(AppView.BOOKING)} onProductsClick={() => setCurrentView(AppView.PRODUCTS)} identity={appIdentity} />;
      case AppView.BOOKING:
        if (!currentUser) return <AuthView onAuth={handleAuth} onCancel={() => setCurrentView(AppView.HOME)} />;
        return <BookingView services={services} appointments={appointments} blockedSlots={blockedSlots} onBook={handleBooking} />;
      case AppView.PRODUCTS:
        return <ProductView products={products} onReserve={handleReservation} isLoggedIn={!!currentUser} />;
      case AppView.USER_PROFILE:
        return <UserProfile user={currentUser} appointments={appointments} services={services} reservations={productReservations} onCancelAppointment={handleCancelAppointment} onCancelReservation={handleCancelReservation} onLogout={handleLogout} />;
      case AppView.ADMIN:
        return (
          <AdminDashboard 
            appointments={appointments} 
            products={products} 
            expenses={expenses} 
            services={services}
            users={users}
            reservations={productReservations}
            blockedSlots={blockedSlots}
            setProducts={setProducts}
            setExpenses={setExpenses}
            setServices={setServices}
            setAppointments={setAppointments}
            setUsers={setUsers}
            setBlockedSlots={setBlockedSlots}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            identity={appIdentity}
            setIdentity={setAppIdentity}
            setProductReservations={setProductReservations}
            isAdminAuthenticated={isAdminAuthenticated}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
          />
        );
      default:
        return <HomeView onBookClick={() => setCurrentView(AppView.BOOKING)} onProductsClick={() => setCurrentView(AppView.PRODUCTS)} identity={appIdentity} />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header currentView={currentView} setCurrentView={setCurrentView} user={currentUser} />
      <main className="flex-grow pt-20">
        {renderView()}
      </main>
      <footer className="bg-neutral-900 border-t border-yellow-600/30 p-8 text-center text-gray-400">
        <p className="mb-2 uppercase text-xs tracking-widest font-oswald">&copy; {new Date().getFullYear()} {appIdentity.name}</p>
        <p className="text-[10px] mb-4 uppercase tracking-widest">{appIdentity.address}</p>
        <div className="flex justify-center space-x-6">
          <a href={appIdentity.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400"><i className="fab fa-instagram text-xl"></i></a>
          <a href={appIdentity.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400"><i className="fab fa-whatsapp text-xl"></i></a>
        </div>
      </footer>
    </div>
  );
};

export default App;
