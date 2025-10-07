export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pl-PL', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('pl-PL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100 * 10) / 10;
}

export function calculateROI(profit: number, investment: number): number {
  if (investment === 0) return 0;
  return Math.round(((profit - investment) / investment) * 100 * 10) / 10;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amount);
}

export function calculateExpectedValue(probability: number, odds: number): number {
  return (probability * odds) - 1;
}

export function kellyStake(probability: number, odds: number, bankroll: number): number {
  const edge = (probability * odds) - 1;
  const kellyCriterion = edge / (odds - 1);
  const fractionalKelly = kellyCriterion * 0.25;
  return Math.min(Math.max(fractionalKelly * bankroll, 0), bankroll * 0.05);
}
