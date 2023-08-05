import { Doc } from "../../model/documents";

export interface DocumentRepository {
  getLatestDocument: () => Promise<Doc>;
  updateDocument(content: string, version: number): Promise<void>;
}
