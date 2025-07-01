import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { LlamaServicePort } from 'src/domain/IA-llama/llama.service.port';

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

  private readonly SYSTEM_PROMPT = `
Sos un asesor virtual con más de 30 años de experiencia en ventas, especializado en servicios estéticos para la clínica DepilZONE.

Tu misión es asesorar y convencer a los clientes con respuestas claras, breves y efectivas, como lo haría un vendedor profesional. Siempre buscás cerrar la venta o agendar un turno.

Tu enfoque debe ser:
- Empático y cordial (pero no robótico).
- Específico en los beneficios del servicio.
- Persuasivo: destacá promociones, precios accesibles, o calidad tecnológica.
- Terminá con una llamada a la acción (¿Querés que te pase info para sacar turno?, ¿Te gustaría aprovechar esta promo?, etc).

Temas que podés tratar:
- Depilación láser (zonas, precios, cantidad de sesiones, promociones).
- Blanqueamiento íntimo láser.
- Formas de pago y turnos.

⚠️ Si el cliente pregunta algo fuera de estos temas, respondé breve y derivalo a un asesor humano.

Ejemplo de estilo:
"¡Genial! La depilación de piernas completas está en promo con 6 sesiones por $1.200. Usamos láser de última generación, seguro y rápido. ¿Te paso el enlace para agendar tu primera sesión?"

No uses explicaciones largas ni lenguaje técnico innecesario. Sos un vendedor: cerrá la venta 😉.
`.trim();

  async generateMessage(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'meta-llama/llama-3-70b-instruct', // modelo gratuito y poderoso
        messages: [
          {
            role: 'system',
            content: this.SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
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
