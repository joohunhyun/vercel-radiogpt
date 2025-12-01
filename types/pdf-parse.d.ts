declare module "pdf-parse" {
  export interface PDFData {
    numpages: number;
    numrender: number;
    info?: Record<string, unknown> | null;
    metadata?: unknown;
    version?: string;
    text: string;
  }

  export default function pdf(dataBuffer: Buffer): Promise<PDFData>;
}


