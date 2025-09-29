import { useState, useCallback, useMemo } from 'react';
import type { 
  ChargeDistribution, 
  PaymentDistribution, 
  ChargeDistributionType,
  RoomCharges,
  DistributionTemplate,
  DistributionTemplateConfig
} from '../types/chargeDistribution';
import type { PaymentMethod } from '../types/checkin';

// Plantillas predefinidas
const DISTRIBUTION_TEMPLATES: DistributionTemplateConfig[] = [
  {
    template: 'single_guest',
    label: 'Un solo responsable',
    description: 'Una persona se hace cargo de todos los gastos',
    defaultDistribution: [{
      guestName: 'Huésped Principal',
      paymentMethod: 'credit_card',
      description: 'Responsable único de todos los cargos'
    }]
  },
  {
    template: 'equal_split',
    label: 'División equitativa',
    description: 'Dividir los costos equitativamente entre todos los huéspedes',
    defaultDistribution: [] // Se genera dinámicamente
  },
  {
    template: 'primary_secondary',
    label: 'Principal + Acompañante',
    description: 'Huésped principal paga mayoría, acompañante paga una parte',
    defaultDistribution: [
      {
        guestName: 'Huésped Principal',
        paymentMethod: 'credit_card',
        percentage: 70,
        description: 'Responsable principal'
      },
      {
        guestName: 'Acompañante',
        paymentMethod: 'credit_card',
        percentage: 30,
        description: 'Responsable secundario'
      }
    ]
  },
  {
    template: 'corporate_guest',
    label: 'Empresa + Huésped',
    description: 'Empresa paga hospedaje, huésped paga extras',
    defaultDistribution: [
      {
        guestName: 'Empresa/Corporativo',
        paymentMethod: 'corporate_account',
        description: 'Hospedaje y servicios básicos'
      },
      {
        guestName: 'Huésped',
        paymentMethod: 'credit_card',
        description: 'Servicios adicionales y personales'
      }
    ]
  }
];

export const useChargeDistribution = (totalGuests: number = 1, totalAmount: number = 0) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [distributionType, setDistributionType] = useState<ChargeDistributionType>('full');
  const [distributions, setDistributions] = useState<PaymentDistribution[]>([]);
  const [roomCharges, setRoomCharges] = useState<RoomCharges>({
    accommodationCost: 0,
    taxes: 0,
    services: 0,
    deposits: 0,
    total: 0
  });

  // Generar ID único para distribuciones
  const generateId = useCallback(() => {
    return `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Calcular si la distribución es válida
  const isDistributionValid = useMemo(() => {
    if (!isEnabled || distributions.length === 0) return true;
    
    const totalDistributed = distributions.reduce((sum, dist) => sum + dist.amount, 0);
    return Math.abs(totalDistributed - totalAmount) < 0.01; // Tolerancia para decimales
  }, [distributions, totalAmount, isEnabled]);

  // Aplicar plantilla predefinida
  const applyTemplate = useCallback((template: DistributionTemplate) => {
    const templateConfig = DISTRIBUTION_TEMPLATES.find(t => t.template === template);
    if (!templateConfig) return;

    let newDistributions: PaymentDistribution[] = [];

    if (template === 'equal_split') {
      // División equitativa
      const amountPerGuest = totalAmount / totalGuests;
      newDistributions = Array.from({ length: totalGuests }, (_, index) => ({
        id: generateId(),
        guestName: `Huésped ${index + 1}`,
        paymentMethod: 'credit_card' as PaymentMethod,
        amount: amountPerGuest,
        percentage: 100 / totalGuests,
        description: `Parte ${index + 1} de ${totalGuests}`
      }));
    } else {
      // Otras plantillas
      newDistributions = templateConfig.defaultDistribution.map((dist) => ({
        ...dist,
        id: generateId(),
        amount: dist.percentage ? (totalAmount * dist.percentage / 100) : totalAmount / templateConfig.defaultDistribution.length
      }));
    }

    setDistributions(newDistributions);
    setDistributionType(template === 'equal_split' ? 'equal' : 'percentage');
  }, [totalAmount, totalGuests, generateId]);

  // Agregar nueva distribución
  const addDistribution = useCallback(() => {
    const newDistribution: PaymentDistribution = {
      id: generateId(),
      guestName: `Nuevo responsable ${distributions.length + 1}`,
      paymentMethod: 'credit_card',
      amount: 0,
      description: 'Nuevo cargo'
    };
    setDistributions(prev => [...prev, newDistribution]);
  }, [distributions.length, generateId]);

  // Actualizar distribución específica
  const updateDistribution = useCallback((id: string, updates: Partial<PaymentDistribution>) => {
    setDistributions(prev => prev.map(dist => 
      dist.id === id ? { ...dist, ...updates } : dist
    ));
  }, []);

  // Eliminar distribución
  const removeDistribution = useCallback((id: string) => {
    setDistributions(prev => prev.filter(dist => dist.id !== id));
  }, []);

  // Redistribuir automáticamente
  const redistributeEqually = useCallback(() => {
    if (distributions.length === 0) return;
    
    const amountPerDistribution = totalAmount / distributions.length;
    setDistributions(prev => prev.map(dist => ({
      ...dist,
      amount: amountPerDistribution,
      percentage: 100 / distributions.length
    })));
  }, [distributions.length, totalAmount]);

  // Ajustar distribución por porcentajes
  const redistributeByPercentages = useCallback(() => {
    setDistributions(prev => prev.map(dist => ({
      ...dist,
      amount: dist.percentage ? (totalAmount * dist.percentage / 100) : 0
    })));
  }, [totalAmount]);

  // Obtener resumen de la distribución
  const getDistributionSummary = useMemo(() => {
    const totalDistributed = distributions.reduce((sum, dist) => sum + dist.amount, 0);
    const remaining = totalAmount - totalDistributed;
    
    return {
      totalAmount,
      totalDistributed,
      remaining,
      isValid: isDistributionValid,
      distributionCount: distributions.length,
      paymentMethods: [...new Set(distributions.map(d => d.paymentMethod))]
    };
  }, [distributions, totalAmount, isDistributionValid]);

  // Generar objeto de distribución completo
  const getChargeDistribution = useCallback((): ChargeDistribution => {
    return {
      id: generateId(),
      type: distributionType,
      description: `División de cargos entre ${distributions.length} responsable(s)`,
      distributions,
      totalAmount,
      isValid: isDistributionValid
    };
  }, [distributionType, distributions, totalAmount, isDistributionValid, generateId]);

  // Resetear todo
  const reset = useCallback(() => {
    setIsEnabled(false);
    setDistributionType('full');
    setDistributions([]);
    setRoomCharges({
      accommodationCost: 0,
      taxes: 0,
      services: 0,
      deposits: 0,
      total: 0
    });
  }, []);

  return {
    // Estado
    isEnabled,
    distributionType,
    distributions,
    roomCharges,
    isDistributionValid,
    
    // Acciones
    setIsEnabled,
    setDistributionType,
    setRoomCharges,
    applyTemplate,
    addDistribution,
    updateDistribution,
    removeDistribution,
    redistributeEqually,
    redistributeByPercentages,
    reset,
    
    // Utilidades
    getDistributionSummary,
    getChargeDistribution,
    
    // Constantes
    templates: DISTRIBUTION_TEMPLATES
  };
};