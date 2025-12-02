/**
 * Price Calculation Hook
 * 
 * Calcula el desglose de precios en tiempo real para una reserva
 */

import { useState, useEffect } from 'react';
import type { Room, AdditionalService } from '../../../types/core';

export interface PriceBreakdownItem {
  label: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
}

export interface PriceBreakdown {
  // Habitaciones
  rooms: PriceBreakdownItem[];
  roomsSubtotal: number;
  
  // Servicios adicionales
  services: PriceBreakdownItem[];
  servicesSubtotal: number;
  
  // Totales
  subtotal: number;
  taxes: number;
  taxRate: number;
  total: number;
  
  // Metadata
  currency: string;
  nights: number;
  
  // Depósito requerido (30%)
  minimumDeposit: number;
  depositPercentage: number;
}

/**
 * Hook para calcular precios en tiempo real
 */
export function usePriceCalculation(
  selectedRooms: Room[],
  checkInDate: string | null,
  checkOutDate: string | null,
  additionalServices: AdditionalService[] = []
): PriceBreakdown | null {
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);

  useEffect(() => {
    // Validar que tengamos los datos mínimos
    if (!checkInDate || !checkOutDate || selectedRooms.length === 0) {
      setBreakdown(null);
      return;
    }

    // Calcular número de noches
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    // Calcular subtotal de habitaciones
    const roomsBreakdown: PriceBreakdownItem[] = selectedRooms.map(room => ({
      label: room.number || room.name || `Habitación ${room.id}`,
      quantity: nights,
      unitPrice: room.basePrice || room.pricePerNight,
      amount: (room.basePrice || room.pricePerNight) * nights,
    }));

    const roomsSubtotal = roomsBreakdown.reduce((sum, item) => sum + item.amount, 0);

    // Calcular subtotal de servicios (asumir que vienen con quantity ya incluido)
    const servicesBreakdown: PriceBreakdownItem[] = additionalServices
      .filter(service => service.price > 0)
      .map(service => ({
        label: service.name,
        quantity: 1, // Quantity should be handled externally
        unitPrice: service.price,
        amount: service.price,
      }));

    const servicesSubtotal = servicesBreakdown.reduce((sum, item) => sum + item.amount, 0);

    // Calcular totales
    const subtotal = roomsSubtotal + servicesSubtotal;
    const taxRate = 0.13; // 13% IVA Costa Rica
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;

    // Depósito mínimo (30%)
    const depositPercentage = 0.3;
    const minimumDeposit = total * depositPercentage;

    setBreakdown({
      rooms: roomsBreakdown,
      roomsSubtotal,
      services: servicesBreakdown,
      servicesSubtotal,
      subtotal,
      taxes,
      taxRate,
      total,
      currency: 'USD', // Base currency for pricing
      nights,
      minimumDeposit,
      depositPercentage,
    });
  }, [selectedRooms, checkInDate, checkOutDate, additionalServices]);

  return breakdown;
}

/**
 * Formatea un monto en moneda
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
