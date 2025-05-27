import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from 'src/domain/clients/entities/client.entity';
import { ClientDocument } from 'src/infrastructure/schema/client.schema';


@Injectable()
export class NormalizePhoneNumbersUseCase {
  private readonly logger = new Logger(NormalizePhoneNumbersUseCase.name);

  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  /**
   * Normaliza un número de teléfono eliminando todos los caracteres no numéricos
   */
  private normalizePhone(phone: string): string {
    return phone ? phone.replace(/\D/g, '').trim() : '';
  }

  /**
   * Normaliza todos los números de teléfono en la base de datos
   * @returns Un objeto con estadísticas de la operación
   */
  async execute(): Promise<{
    total: number;
    normalized: number;
    unchanged: number;
    errors: number;
    details: Array<{ id: string; before: string; after: string }>;
  }> {
    this.logger.log('Iniciando normalización de números de teléfono...');
    
    const stats = {
      total: 0,
      normalized: 0,
      unchanged: 0,
      errors: 0,
      details: [] as Array<{ id: string; before: string; after: string }>,
    };

    try {
      // Obtener todos los clientes
      const allClients = await this.clientModel.find().exec();
      stats.total = allClients.length;
      
      this.logger.log(`Encontrados ${stats.total} clientes para normalizar`);

      // Procesar cada cliente
      for (const client of allClients) {
        try {
          const originalPhone = client.phone || '';
          const normalizedPhone = this.normalizePhone(originalPhone);
          
          // Si el teléfono ya está normalizado, no hacer nada
          if (normalizedPhone === originalPhone) {
            stats.unchanged++;
            continue;
          }
          
          // Guardar el teléfono normalizado
          client.phone = normalizedPhone;
          await client.save();
          
          stats.normalized++;
          stats.details.push({
            id: client.id.toString(),
            before: originalPhone,
            after: normalizedPhone,
          });
          
          this.logger.debug(
            `Normalizado: ${client._id} | ${originalPhone} → ${normalizedPhone}`,
          );
        } catch (error) {
          stats.errors++;
          this.logger.error(
            `Error al normalizar cliente ${client._id}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log(
        `Normalización completada: ${stats.normalized} normalizados, ${stats.unchanged} sin cambios, ${stats.errors} errores`,
      );
      
      return stats;
    } catch (error) {
      this.logger.error(
        `Error general en normalización: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}