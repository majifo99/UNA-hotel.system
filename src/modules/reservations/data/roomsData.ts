import type { Room } from '../types';

export const roomsData: Room[] = [
  {
    id: "room-001",
    type: "single",
    name: "Habitación Individual Estándar",
    capacity: 1,
    pricePerNight: 45000,
    amenities: [
      "WiFi gratuito",
      "TV por cable",
      "Aire acondicionado",
      "Escritorio",
      "Baño privado"
    ],
    isAvailable: true
  },
  {
    id: "room-002",
    type: "single",
    name: "Habitación Individual Premium",
    capacity: 1,
    pricePerNight: 55000,
    amenities: [
      "WiFi gratuito",
      "Smart TV",
      "Aire acondicionado",
      "Escritorio ejecutivo",
      "Baño privado",
      "Vista al jardín"
    ],
    isAvailable: true
  },
  {
    id: "room-003",
    type: "double",
    name: "Habitación Doble Estándar",
    capacity: 2,
    pricePerNight: 65000,
    amenities: [
      "WiFi gratuito",
      "TV por cable",
      "Aire acondicionado",
      "Minibar",
      "Caja fuerte",
      "Balcón"
    ],
    isAvailable: true
  },
  {
    id: "room-004",
    type: "double",
    name: "Habitación Doble Deluxe",
    capacity: 2,
    pricePerNight: 75000,
    amenities: [
      "WiFi gratuito",
      "Smart TV",
      "Aire acondicionado",
      "Minibar premium",
      "Caja fuerte",
      "Balcón con vista al mar",
      "Cafetera"
    ],
    isAvailable: true
  },
  {
    id: "room-005",
    type: "triple",
    name: "Habitación Triple",
    capacity: 3,
    pricePerNight: 85000,
    amenities: [
      "WiFi gratuito",
      "TV por cable",
      "Aire acondicionado",
      "Minibar",
      "Balcón",
      "Área de estar",
      "3 camas individuales"
    ],
    isAvailable: true
  },
  {
    id: "room-006",
    type: "suite",
    name: "Suite Ejecutiva",
    capacity: 4,
    pricePerNight: 120000,
    amenities: [
      "WiFi gratuito",
      "Smart TV en sala y dormitorio",
      "Aire acondicionado",
      "Minibar premium",
      "Balcón privado",
      "Jacuzzi",
      "Sala de estar separada",
      "Servicio de habitaciones 24h"
    ],
    isAvailable: true
  },
  {
    id: "room-007",
    type: "suite",
    name: "Suite Presidencial",
    capacity: 6,
    pricePerNight: 200000,
    amenities: [
      "WiFi gratuito",
      "Smart TV en múltiples habitaciones",
      "Aire acondicionado centralizado",
      "Bar completo",
      "Terraza privada",
      "Jacuzzi y sauna",
      "Comedor privado",
      "Servicio de mayordomo",
      "Vista panorámica"
    ],
    isAvailable: true
  },
  {
    id: "room-008",
    type: "family",
    name: "Habitación Familiar Estándar",
    capacity: 6,
    pricePerNight: 150000,
    amenities: [
      "WiFi gratuito",
      "TV por cable",
      "Aire acondicionado",
      "Minibar",
      "Kitchenette",
      "Área de juegos para niños",
      "Camas literas",
      "Balcón amplio"
    ],
    isAvailable: true
  },
  {
    id: "room-009",
    type: "family",
    name: "Habitación Familiar Premium",
    capacity: 8,
    pricePerNight: 180000,
    amenities: [
      "WiFi gratuito",
      "Smart TV",
      "Aire acondicionado",
      "Minibar",
      "Cocina completa",
      "Área de juegos",
      "Habitaciones separadas",
      "Terraza familiar",
      "Mesa de comedor"
    ],
    isAvailable: true
  }
];
