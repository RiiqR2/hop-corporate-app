export const formatCLP = (value?: number) => {
  if (!value) return '0';

  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};