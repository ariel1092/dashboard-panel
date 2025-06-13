// src/domain/chat/enums/chat.enums.ts

export enum ChatType {
  AI_ONLY = 'AI_ONLY',           // Usuario no logueado - solo IA
  AI_LOGGED = 'AI_LOGGED',       // Usuario logueado eligió IA
  HUMAN_SUPPORT = 'HUMAN_SUPPORT' // Usuario logueado eligió operador humano
}

export enum ChatStatus {
  WAITING = 'WAITING',           // Esperando asignación
  ACTIVE = 'ACTIVE',             // Chat activo
  COMPLETED = 'COMPLETED',       // Chat completado
  CANCELLED = 'CANCELLED',       // Chat cancelado
  IN_QUEUE = 'IN_QUEUE',         // En cola esperando operador
  TIMEOUT_FALLBACK = 'TIMEOUT_FALLBACK' // Timeout de cola, fallback a IA
}

export enum UserRole {
  ADMIN = 'admin',
  VENDEDOR = 'vendedor', 
  ANALISTA = 'analista',
  OPERADOR = 'operador'
}

// Roles que pueden usar chats (crear y participar)
export const CHAT_USER_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.VENDEDOR,
  UserRole.OPERADOR
];

// Solo operadores pueden atender chats de soporte
export const OPERATOR_ROLES: UserRole[] = [
  UserRole.OPERADOR
];

export enum MessageType {
  USER = 'USER',     // Mensaje de usuario
  AI = 'AI',         // Mensaje de IA
  OPERATOR = 'OPERATOR', // Mensaje de operador humano
  SYSTEM = 'SYSTEM'  // Mensaje del sistema (notificaciones)
}