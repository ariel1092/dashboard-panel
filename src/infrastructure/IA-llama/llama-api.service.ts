import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { LlamaMessage, LlamaServicePort } from 'src/domain/IA-llama/llama.service.port';

@Injectable()
export class LlamaApiService implements LlamaServicePort {
  private readonly logger = new Logger(LlamaApiService.name);

  private readonly openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
      'X-Title': 'DepilZONE Chatbot',
    },
  });

  // 🔒 Prompt privado
  private readonly SYSTEM_PROMPT = `
Sos un asesor virtual con 30 años de experiencia en ventas de estética en DepilZONE.

✅ Tu objetivo:
- Cerrar la venta o conseguir que el cliente agende un turno.
- Responder en un tono cordial y vendedor, pero directo.
- Usar lenguaje claro, breve y sin tecnicismos.
- Destacar beneficios: resultados, promociones, comodidad.
- Evitar repetir información que ya se habló en la conversación.
- Usar el contexto previo para no pedir al cliente lo mismo dos veces.
- Terminar SIEMPRE con una llamada a la acción concreta.

✅ Servicios que podés vender:
- Depilación láser en distintas zonas (precios, sesiones, promos).
- Blanqueamiento íntimo láser.
- Formas de pago y turnos.

⚠️ Si el cliente pide algo fuera de tema, respondé breve y derivá a un asesor humano.

✅ Ejemplo de estilo:
"¡Genial! La depilación de cejas está en promo: 3 sesiones por $800. Usamos láser de última generación, rápido y seguro. ¿Querés reservar ahora o te paso más info?"

No seas robótico ni excesivamente técnico. Sé vendedor y resolutivo 😉
`.trim();

  // ✅ Getter público que expone el prompt sin permitir modificación
  get systemPrompt(): string {
    return this.SYSTEM_PROMPT;
  }

  async generateMessageFromHistory(messages: LlamaMessage[]): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'meta-llama/llama-3-70b-instruct',
        messages: [
          {
            role: 'system',
            content: this.SYSTEM_PROMPT, // o this.systemPrompt
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 150,
        top_p: 0.9,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      });

      const message = response.choices?.[0]?.message?.content;

      if (!message) {
        this.logger.warn('Respuesta vacía del modelo.');
        throw new InternalServerErrorException('⚠️ No se pudo generar una respuesta válida.');
      }

      return message.trim();
    } catch (error) {
      this.logger.error('Error al generar mensaje con OpenRouter:', error);
      return '⚠️ Lo siento, ocurrió un error al generar la respuesta.';
    }
  }
}
