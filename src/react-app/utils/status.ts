export type ExpenseStatus = 'pendiente' | 'aprobado' | 'rechazado';

export function getStatusBadgeClasses(status: ExpenseStatus) {
  switch (status) {
    case 'aprobado':
      // Use neutral text color only (no colored background) so grids look cleaner
      return 'text-green-600 dark:text-green-300';
    case 'rechazado':
      return 'text-orange-500 dark:text-orange-300';
    case 'pendiente':
    default:
      return 'text-blue-600 dark:text-blue-300';
  }
}

export function getStatusLabel(status: ExpenseStatus) {
  return status === 'aprobado' ? 'Aprobado' : status === 'rechazado' ? 'Rechazado' : 'Pendiente';
}
