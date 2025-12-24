
import { Service, Product } from './types';

export const IDENTITY = {
  name: 'Barbearia Baruc',
  slogan: 'Mais que corte, identidade',
  address: 'Avenida Brasil, nº 4005, Bairro Marechal 2, Rondon – PR, CEP 87800-000',
  phone: '(44) 99827-6028',
  instagram: '@barbearia.baruc',
  instagramUrl: 'https://www.instagram.com/barbearia.baruc',
  whatsappUrl: 'https://wa.me/5544998276028',
  barber: {
    name: 'José Ivaldo',
    image: 'https://picsum.photos/seed/barber1/400/400'
  },
  bgImage: 'https://picsum.photos/seed/barbershop/1920/1080'
};

export const SERVICES: Service[] = [
  { id: '1', name: 'Corte de cabelo (degradê/social)', price: 35.0, durationMinutes: 30, description: 'Corte moderno ou clássico com acabamento profissional.', image: 'https://picsum.photos/seed/cut1/400/300' },
  { id: '2', name: 'Barba', price: 35.0, durationMinutes: 30, description: 'Alinhamento e hidratação da barba com toalha quente.', image: 'https://picsum.photos/seed/beard1/400/300' },
  { id: '3', name: 'Cabelo + Barba', price: 70.0, durationMinutes: 60, description: 'Combo completo para um visual renovado.', image: 'https://picsum.photos/seed/combo1/400/300' },
  { id: '4', name: 'Corte infantil', price: 35.0, durationMinutes: 30, description: 'Corte especial para os pequenos.', image: 'https://picsum.photos/seed/kid1/400/300' }
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Pomada Caramelo', brand: 'El Barón', price: 35.0, stock: 12, image: 'https://picsum.photos/seed/p1/300/300', description: 'Pomada modeladora com fragrância suave.', isActive: true, salesCount: 5 },
  { id: 'p2', name: 'Pomada Teia 2A', brand: '2A', price: 35.0, stock: 6, image: 'https://picsum.photos/seed/p2/300/300', description: 'Efeito seco e alta fixação.', isActive: true, salesCount: 2 },
  { id: 'p3', name: 'Pasta Modeladora Oficina Hair', brand: 'Oficina Hair', price: 35.0, stock: 3, image: 'https://picsum.photos/seed/p3/300/300', description: 'Efeito molhado clássico.', isActive: true, salesCount: 8 },
  { id: 'p4', name: 'Óleo para Barba 2A', brand: '2A', price: 50.0, stock: 7, image: 'https://picsum.photos/seed/p4/300/300', description: 'Hidratação profunda para fios rebeldes.', isActive: true, salesCount: 1 },
  { id: 'p5', name: 'Minoxidil Creme', brand: '2A', price: 80.0, stock: 4, image: 'https://picsum.photos/seed/p5/300/300', description: 'Tratamento capilar intensivo.', isActive: true, salesCount: 0 },
  { id: 'p6', name: 'Pomada Modeladora Resurge', brand: 'Resurge', price: 45.0, stock: 4, image: 'https://picsum.photos/seed/p6/300/300', description: 'Efeito matte de longa duração.', isActive: true, salesCount: 3 },
  { id: 'p7', name: 'Perfume Amei Cosméticos', brand: 'Amei Cosméticos', price: 150.0, stock: 21, image: 'https://picsum.photos/seed/p7/300/300', description: 'Base óleo, duração até 16h.', isActive: true, salesCount: 12 }
];

export const WORKING_HOURS = {
  start: '08:00',
  end: '19:30',
  break: {
    start: '12:00',
    end: '13:00'
  },
  days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
};
