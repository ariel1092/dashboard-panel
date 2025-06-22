function shouldEscalateToHuman(message: string): boolean {
  const keywords = ['soporte', 'humano', 'asesor', 'ayuda real', 'hablar con alguien', 'atención real'];
  const lower = message.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}
