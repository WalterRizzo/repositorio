export const UserAuditLogSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  user_email: z.string().optional(),
  action: z.string(),
  details: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.string(),
});

export type UserAuditLog = z.infer<typeof UserAuditLogSchema>;
import z from "zod";

export const UserProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["usuario", "supervisor", "admin"]),
  monthly_salary: z.number(),
  balance: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const AttachmentSchema = z.object({
  id: z.number().optional(),
  filename: z.string(),
  originalName: z.string(),
  contentType: z.string(),
  size: z.number().optional(),
  url: z.string(),
  createdAt: z.string().optional(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;

export const ExpenseSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  expense_date: z.string(),
  status: z.enum(["pendiente", "aprobado", "rechazado"]),
  approved_by: z.string().nullable(),
  approved_at: z.string().nullable(),
  rejection_reason: z.string().nullable().optional(),
  rejected_by: z.string().nullable().optional(),
  rejected_at: z.string().nullable().optional(),
  use_balance: z.boolean(),
  receipt_photo_url: z.string().nullable(), // Mantener para compatibilidad
  attachments: z.array(AttachmentSchema).default([]), // Múltiples archivos
  currency: z.string().default("ARS"),
  tipo_comprobante_id: z.number().nullable().optional(),
  sigla: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Información del usuario que cargó el gasto (viene del JOIN)
  user_name: z.string().optional(),
  user_email: z.string().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

export const TipoComprobanteSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string().optional(),
  descripcion: z.string().nullable().optional(),
  activo: z.number().default(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TipoComprobante = z.infer<typeof TipoComprobanteSchema>;

export const CreateExpenseSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().positive("El monto debe ser positivo"),
  category: z.string().min(1, "La categoría es requerida"),
  expense_date: z.string().min(1, "La fecha es requerida"),
  use_balance: z.boolean().default(false),
  sigla: z.string().nullable().optional(),
});

export type CreateExpense = z.infer<typeof CreateExpenseSchema>;

export const BalanceTransactionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  amount: z.number(),
  type: z.enum(["carga", "gasto", "ajuste"]),
  description: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BalanceTransaction = z.infer<typeof BalanceTransactionSchema>;

export const EXPENSE_CATEGORIES = [
  "Alimentación",
  "Transporte",
  "Alojamiento",
  "Material de oficina",
  "Tecnología",
  "Marketing",
  "Servicios profesionales",
  "Capacitación",
  "Entretenimiento",
  "Otros",
] as const;
