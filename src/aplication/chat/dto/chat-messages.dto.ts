
export class ChatMessageDto {
  id: string
  content: string
  sender: string // podés usar un Enum si lo tenés
  timestamp: Date
  chatId: string
  userId: string
}