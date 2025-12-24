
import React, { useState } from 'react';
import { Product, CartItem } from '../types';

interface ProductViewProps {
  products: Product[];
  onReserve: (cart: CartItem[]) => void;
  isLoggedIn: boolean;
}

const ProductView: React.FC<ProductViewProps> = ({ products, onReserve, isLoggedIn }) => {
  const [filter, setFilter] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = products.filter(p => 
    p.isActive && (
      p.name.toLowerCase().includes(filter.toLowerCase()) || 
      p.brand.toLowerCase().includes(filter.toLowerCase())
    )
  );

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId)!;
    const existing = cart.find(item => item.productId === productId);
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert('Estoque insuficiente!');
        return;
      }
      setCart(cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId)!;
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, Math.min(product.stock, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, curr) => {
    const product = products.find(p => p.id === curr.productId)!;
    return acc + (product.price * curr.quantity);
  }, 0);

  const handleFinishReservation = () => {
    if (!isLoggedIn) {
      alert('Você precisa estar logado para realizar uma reserva.');
      onReserve([]); // Triggers the "redirect to auth" in App.tsx
      return;
    }
    onReserve(cart);
    setCart([]);
    setShowCart(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold text-yellow-500 font-oswald uppercase mb-2">Cuidados Baruc</h2>
          <p className="text-gray-400 italic">Produtos exclusivos para manutenção do seu estilo em casa.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input 
              type="text"
              placeholder="Buscar produto..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-neutral-900 border border-yellow-600/20 rounded-full py-3 pl-12 pr-6 text-white focus:outline-none focus:border-yellow-500 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowCart(!showCart)}
            className="relative bg-yellow-500 text-black p-3 rounded-full hover:bg-yellow-400 transition-all shadow-lg"
          >
            <i className="fas fa-shopping-cart text-xl"></i>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-yellow-500">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-neutral-900 rounded-3xl overflow-hidden border border-yellow-600/10 hover:border-yellow-500 transition-all group flex flex-col">
            <div className="relative aspect-square overflow-hidden bg-black">
              <img 
                src={product.image} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${product.stock === 0 ? 'opacity-30' : ''}`}
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs">Esgotado</span>
                </div>
              )}
            </div>
            
            <div className="p-6 flex-grow flex flex-col">
              <span className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest mb-1">{product.brand}</span>
              <h3 className="text-lg font-bold text-white mb-2 leading-tight uppercase font-oswald">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{product.description}</p>
              
              <div className="mt-auto flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Pagamento no local</span>
                  <span className="text-2xl font-bold text-yellow-500">R$ {product.price.toFixed(2)}</span>
                </div>
                <button 
                  disabled={product.stock === 0}
                  onClick={() => addToCart(product.id)}
                  className={`p-3 rounded-xl transition-all ${product.stock === 0 ? 'bg-neutral-800 text-gray-600 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                  title="Adicionar ao carrinho"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Carrinho */}
      {showCart && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 w-full max-w-md rounded-3xl border border-yellow-600/20 shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-oswald uppercase text-white">Seu Carrinho</h3>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fas fa-shopping-basket text-4xl text-gray-800 mb-4"></i>
                  <p className="text-gray-500">Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => {
                    const product = products.find(p => p.id === item.productId)!;
                    return (
                      <div key={item.productId} className="flex justify-between items-center bg-black p-4 rounded-2xl border border-white/5">
                        <div className="flex-grow">
                          <span className="text-white font-bold block">{product.name}</span>
                          <span className="text-yellow-500 text-xs">R$ {product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-neutral-800 rounded-lg">
                            <button onClick={() => updateQuantity(item.productId, -1)} className="px-2 py-1 text-gray-400">-</button>
                            <span className="px-2 text-white text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, 1)} className="px-2 py-1 text-gray-400">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.productId)} className="text-red-500">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 bg-black border-t border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">Total da Reserva</span>
                  <span className="text-2xl font-bold text-yellow-500 font-oswald">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleFinishReservation}
                  className="w-full bg-yellow-500 text-black font-bold py-4 rounded-2xl hover:bg-yellow-400 transition-all uppercase tracking-widest font-oswald"
                >
                  {isLoggedIn ? 'Finalizar Reserva' : 'Fazer Login para Reservar'}
                </button>
                <p className="text-[10px] text-gray-600 mt-4 text-center uppercase">Retirada e pagamento no local</p>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <i className="fas fa-box-open text-6xl text-gray-800 mb-4"></i>
          <p className="text-gray-500">Nenhum produto disponível.</p>
        </div>
      )}
    </div>
  );
};

export default ProductView;
