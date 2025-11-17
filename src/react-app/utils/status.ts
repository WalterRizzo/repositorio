export type ExpenseStatus = 'pendiente' | 'aprobado' | 'rechazado';

export function getStatusBadgeClasses(status: ExpenseStatus) {
  switch (status) {
    case 'aprobado':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'rechazado':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'pendiente':
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }
}

export function getStatusLabel(status: ExpenseStatus) {
  return status === 'aprobado' ? 'Aprobado' : status === 'rechazado' ? 'Rechazado' : 'Pendiente';
}
