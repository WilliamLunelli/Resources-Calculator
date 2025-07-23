import path from "path";
import fs from "fs/promises";
import { LitematicParser } from "../core/parsers/parse-litematic";
import type { ParsedLitematic, CalculationRequest } from "../types";

export class LitematicService {
  private static uploadDir = process.env.UPLOAD_PATH || "./uploads";

  /**
   * Processa upload de arquivo litematic
   */
  static async processUpload(
    file: Express.Multer.File,
    userId?: string
  ): Promise<{
    litematicData: ParsedLitematic;
    calculationResult?: any;
  }> {
    try {
      // Validar arquivo
      if (!file.originalname.endsWith(".litematic")) {
        throw new Error("File must be a .litematic file");
      }

      // Mover arquivo para pasta correta
      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(this.uploadDir, "lithematics", filename);

      await fs.rename(file.path, filepath);

      // Parsear litematic
      const litematicData = await LitematicParser.parseFile(filepath);

      // TODO: Calcular recursos automaticamente quando tivermos CalculationService
      const calculationRequest: CalculationRequest = {
        targetItems: litematicData.simplifiedBlocks,
        optimizationLevel: "basic",
      };

      // Log para debug
      console.log(
        `Litematic processed: ${litematicData.summary.totalBlocks} blocks, ${litematicData.summary.uniqueBlocks} unique types`
      );

      return {
        litematicData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error("Failed to process litematic: " + errorMessage);
    }
  }

  /**
   * Lista lithematics uploadados por um usuário
   */
  static async getUserLithematics(userId: string): Promise<any[]> {
    // TODO: Implementar quando tivermos banco de dados
    return [];
  }

  /**
   * Obtém informações básicas de um litematic sem processamento completo
   */
  static async getLitematicPreview(filePath: string): Promise<{
    name: string;
    author: string;
    size: { x: number; y: number; z: number };
    totalBlocks: number;
  }> {
    return LitematicParser.getLitematicInfo(filePath);
  }

  /**
   * Valida se um arquivo uploaded é um litematic válido
   */
  static async validateUpload(file: Express.Multer.File): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Verificar extensão
    if (!file.originalname.endsWith(".litematic")) {
      errors.push("File must have .litematic extension");
    }

    // Verificar tamanho
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    }

    // Verificar se não está vazio
    if (file.size === 0) {
      errors.push("File cannot be empty");
    }

    // Tentar validar conteúdo (se passou nas verificações básicas)
    if (errors.length === 0) {
      try {
        const isValid = await LitematicParser.validateLitematicFile(file.path);
        if (!isValid) {
          errors.push("Invalid litematic file format");
        }
      } catch (error) {
        errors.push("Could not validate litematic file");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
