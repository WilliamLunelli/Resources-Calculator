import { PythonShell } from "python-shell";
import path from "path";
import fs from "fs/promises";
import type {
  LitematicData,
  ParsedLitematic,
} from "../../types/litematic.types";

export class LitematicParser {
  private static pythonScriptPath = path.join(
    process.cwd(),
    "scripts",
    "litematic-parser.py"
  );

  /**
   * Parseia um arquivo .litematic usando o script Python
   */
  static async parseFile(litematicFilePath: string): Promise<ParsedLitematic> {
    try {
      // Verificar se o arquivo existe
      await fs.access(litematicFilePath);

      // Executar o script Python
      const results = await PythonShell.run(this.pythonScriptPath, {
        args: [litematicFilePath],
        mode: "text",
        pythonOptions: ["-u"], // unbuffered stdout
      });

      // Caminho do JSON gerado pelo Python
      const jsonPath = litematicFilePath.replace(".litematic", "_blocks.json");

      // Ler o JSON gerado
      const jsonContent = await fs.readFile(jsonPath, "utf-8");
      const litematicData: LitematicData = JSON.parse(jsonContent);

      // Processar dados para formato mais utilizável
      const parsedData = this.processLitematicData(litematicData);

      return parsedData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error("Failed to parse litematic file: " + errorMessage);
    }
  }

  /**
   * Processa os dados brutos do litematic para formato mais utilizável
   */
  private static processLitematicData(data: LitematicData): ParsedLitematic {
    const simplifiedBlocks: Record<string, number> = {};
    let totalBlocks = 0;
    let uniqueBlocks = 0;

    // Processar todas as regiões
    for (const [regionName, regionData] of Object.entries(data.regions)) {
      for (const [blockKey, blockData] of Object.entries(
        regionData.block_counts
      )) {
        // Pular ar
        if (blockData.name === "air") continue;

        // Normalizar nome do bloco (remover propriedades)
        const normalizedName = this.normalizeBlockName(blockData.name);

        // Somar quantidades
        if (!simplifiedBlocks[normalizedName]) {
          simplifiedBlocks[normalizedName] = 0;
          uniqueBlocks++;
        }

        simplifiedBlocks[normalizedName] += blockData.count;
        totalBlocks += blockData.count;
      }
    }

    return {
      originalData: data,
      simplifiedBlocks,
      summary: {
        totalBlocks,
        uniqueBlocks,
        dimensions: data.metadata.enclosing_size,
      },
    };
  }

  /**
   * Normaliza nomes de blocos para match com receitas
   */
  private static normalizeBlockName(blockName: string): string {
    // Remover namespace minecraft: se existir
    const withoutNamespace = blockName.replace(/^minecraft:/, "");

    // Mapeamentos especiais para blocos com nomes diferentes nas receitas
    const mappings: Record<string, string> = {
      wall_torch: "torch",
      grass_block: "grass_block",
      oak_log: "oak_log",
      oak_planks: "oak_planks",
    };

    return mappings[withoutNamespace] || withoutNamespace;
  }

  /**
   * Valida se um arquivo é um .litematic válido
   */
  static async validateLitematicFile(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);

      // Verificações básicas
      if (!stats.isFile()) return false;
      if (!filePath.endsWith(".litematic")) return false;
      if (stats.size === 0) return false;
      if (stats.size > 50 * 1024 * 1024) return false; // Máximo 50MB

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extrai informações básicas de um litematic sem processamento completo
   */
  static async getLitematicInfo(filePath: string): Promise<{
    name: string;
    author: string;
    size: { x: number; y: number; z: number };
    totalBlocks: number;
  }> {
    const parsed = await this.parseFile(filePath);

    return {
      name: parsed.originalData.metadata.name,
      author: parsed.originalData.metadata.author,
      size: parsed.originalData.metadata.enclosing_size,
      totalBlocks: parsed.summary.totalBlocks,
    };
  }
}

export default LitematicParser;
