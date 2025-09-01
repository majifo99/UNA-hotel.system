import type { AdditionalService } from '../../../types/core';

export const servicesData: AdditionalService[] = [
  {
    id: "service-breakfast-continental",
    name: "Desayuno Continental",
    description: "Desayuno buffet con frutas frescas, cereales, pan artesanal, mermeladas caseras y bebidas calientes (café, té, chocolate)",
    price: 8500,
    category: "food",
    isActive: true
  },
  {
    id: "service-breakfast-american",
    name: "Desayuno Americano",
    description: "Desayuno completo con huevos, tocino, salchichas, hash browns, tostadas, frutas y bebidas",
    price: 12000,
    category: "food",
    isActive: true
  },
  {
    id: "service-spa-access",
    name: "Acceso al Spa",
    description: "Acceso completo al spa con sauna, jacuzzi, piscina termal, área de relajación y toallas incluidas",
    price: 25000,
    category: "spa",
    isActive: true
  },
  {
    id: "service-massage-relaxing",
    name: "Masaje Relajante",
    description: "Masaje de cuerpo completo de 60 minutos con aceites aromáticos en nuestro spa",
    price: 45000,
    category: "spa",
    isActive: true
  },
  {
    id: "service-massage-couples",
    name: "Masaje en Pareja",
    description: "Sesión de masaje relajante para dos personas en sala privada con vista al jardín",
    price: 80000,
    category: "spa",
    isActive: true
  },
  {
    id: "service-airport-pickup",
    name: "Traslado desde Aeropuerto",
    description: "Transporte privado en vehículo de lujo desde el Aeropuerto Juan Santamaría hasta el hotel",
    price: 35000,
    category: "transport",
    isActive: true
  },
  {
    id: "service-airport-dropoff",
    name: "Traslado al Aeropuerto",
    description: "Transporte privado desde el hotel hasta el Aeropuerto Juan Santamaría",
    price: 35000,
    category: "transport",
    isActive: true
  },
  {
    id: "service-city-tour",
    name: "Tour por la Ciudad",
    description: "Tour guiado de 4 horas por los principales atractivos de San José con guía bilingüe",
    price: 55000,
    category: "entertainment",
    isActive: true
  },
  {
    id: "service-late-checkout",
    name: "Late Check-out",
    description: "Check-out tardío hasta las 6:00 PM sin costo adicional de limpieza",
    price: 15000,
    category: "other",
    isActive: true
  },
  {
    id: "service-early-checkin",
    name: "Early Check-in",
    description: "Check-in temprano desde las 10:00 AM con habitación garantizada",
    price: 12000,
    category: "other",
    isActive: true
  },
  {
    id: "service-dinner-romantic",
    name: "Cena Romántica",
    description: "Cena de tres tiempos en nuestro restaurante principal con mesa privada y decoración especial",
    price: 35000,
    category: "food",
    isActive: true
  },
  {
    id: "service-dinner-gourmet",
    name: "Cena Gourmet",
    description: "Experiencia gastronómica de 5 tiempos con maridaje de vinos locales",
    price: 55000,
    category: "food",
    isActive: true
  },
  {
    id: "service-laundry",
    name: "Servicio de Lavandería",
    description: "Lavado, secado y planchado de ropa con entrega en 24 horas",
    price: 8000,
    category: "other",
    isActive: true
  },
  {
    id: "service-baby-crib",
    name: "Cuna para Bebé",
    description: "Cuna cómoda y segura para bebés menores de 2 años con ropa de cama incluida",
    price: 5000,
    category: "other",
    isActive: true
  },
  {
    id: "service-pet-friendly",
    name: "Hospedaje Pet-Friendly",
    description: "Servicio especial para mascotas incluyendo cama, platos y área designada",
    price: 20000,
    category: "other",
    isActive: true
  }
];
