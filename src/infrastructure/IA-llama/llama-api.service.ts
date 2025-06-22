import { Injectable } from '@nestjs/common';
import { LlamaServicePort } from 'src/domain/IA-llama/llama.service.port';
import { OpenAI } from 'openai';

@Injectable()
export class LlamaApiService implements LlamaServicePort {
  private openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:3001', // Cambialo si usás otra URL en frontend
      'X-Title': 'depilzoneKey', // Nombre personalizado para identificar tu app en OpenRouter
    },
  });

  async generateMessage(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Podés cambiar a otro modelo si lo necesitás
        messages: [
          {
            role: 'system',
            content: `
Sos un chatbot profesional de atención al cliente para una clínica estética llamada DepilZONE.

Tu única tarea es responder consultas sobre los productos y servicios estéticos que ofrece la empresa, como:
- Depilación láser (zonas, cantidad de sesiones, precios, promociones).
- Blanqueamiento íntimo láser.
- Formas de pago disponibles (efectivo, débito, crédito, transferencias).
- Turnos, promociones vigentes o contacto.

⚠️ No respondas preguntas sobre temas médicos, consejos de salud general, temas personales, clima, política, chistes ni ningún otro tema que no tenga relación directa con los servicios estéticos de la empresa.

Si un cliente hace una pregunta fuera de tu ámbito, respondé brevemente y derivá al operador con algo como:
"⚠️ Solo puedo responder consultas sobre nuestros servicios estéticos. Si necesitás otra ayuda, un asesor humano podrá asistirte."

Sé breve, clara y cordial en tus respuestas. Usá emojis solo si es útil (como ✅ o ⚠️).
          `.trim(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
         max_tokens: 500,
      });

      return completion.choices[0].message.content || 'Lo siento, no pude generar una respuesta.';
    } catch (error) {
      console.error('Error al generar mensaje con OpenAI:', error);
      return '⚠️ Lo siento, ocurrió un error al generar la respuesta.';
    }
  }
}
