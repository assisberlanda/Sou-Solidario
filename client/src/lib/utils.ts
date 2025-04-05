import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função para simular um delay - útil para feedback visual em operações rápidas
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const donationStatusMap: Record<string, { label: string, color: string }> = {
  'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  'confirmed': { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  'scheduled': { label: 'Agendada', color: 'bg-purple-100 text-purple-800' },
  'collected': { label: 'Coletada', color: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

// Máscara para telefone brasileiro
export const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  
  const phoneNumber = value.replace(/\D/g, '');
  
  if (phoneNumber.length <= 2) {
    return `(${phoneNumber}`;
  }
  if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  }
  if (phoneNumber.length <= 10) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
  }
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

// Máscara para CEP brasileiro
export const formatZipCode = (value: string) => {
  if (!value) return value;
  
  const zipCode = value.replace(/\D/g, '');
  
  if (zipCode.length <= 5) {
    return zipCode;
  }
  return `${zipCode.slice(0, 5)}-${zipCode.slice(5, 8)}`;
};

// Auxiliar para calcular o progresso de uma campanha com base nas doações recebidas
export const calculateCampaignProgress = (neededItems: any[], donationItems: any[]) => {
  if (!neededItems.length) return 0;
  
  let totalNeeded = 0;
  let totalDonated = 0;
  
  // Mapeamento de itens doados por ID do item necessário
  const donatedByItemId: Record<number, number> = {};
  donationItems.forEach(item => {
    if (!donatedByItemId[item.neededItemId]) {
      donatedByItemId[item.neededItemId] = 0;
    }
    donatedByItemId[item.neededItemId] += item.quantity;
  });
  
  // Calcular total necessário e doado
  neededItems.forEach(item => {
    totalNeeded += item.quantity;
    totalDonated += Math.min(donatedByItemId[item.id] || 0, item.quantity);
  });
  
  return totalNeeded > 0 ? Math.min(Math.round((totalDonated / totalNeeded) * 100), 100) : 0;
};
