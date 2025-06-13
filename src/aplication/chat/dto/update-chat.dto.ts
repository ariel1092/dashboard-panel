// update-chat.dto.ts
export class UpdateChatDto {
  status?: 'waiting' | 'active' | 'resolved' | 'closed';
  priority?: 'normal' | 'high' | 'urgent';
  operatorId?: string;
  internalNotes?: string;
  rating?: number;
  feedback?: string;
}