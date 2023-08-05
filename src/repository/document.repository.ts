import { InMemoryDatabase } from "../database/inmemory/inmemory-database";
import { Doc } from "../model/documents";
import { DocumentRepository } from "./interface/document.repository.interface";

export class DocumentRepositoryImpl implements DocumentRepository {
  private db: InMemoryDatabase<Doc>;
  private static instance: DocumentRepositoryImpl;
  private id: string;

  private constructor() {
    this.db = new InMemoryDatabase<Doc>();
    this.id = "";
  }

  private setId = (id: string) => {
    this.id = id;
  };

  static async getInstance(): Promise<DocumentRepositoryImpl> {
    if (!DocumentRepositoryImpl.instance) {
      DocumentRepositoryImpl.instance = new DocumentRepositoryImpl();
      const { id } = await DocumentRepositoryImpl.instance.db.create(
        new Doc("", 0)
      );
      DocumentRepositoryImpl.instance.setId(id);
    }
    return DocumentRepositoryImpl.instance;
  }

  async updateDocument(content: string, version: number): Promise<void> {
    const doc = await this.db.read(this.id);
    if (!doc) {
      throw new Error("Document not found");
    }
    doc.content = content;
    doc.version = version;
    doc.updatedAt = new Date();
    return await this.db.update(this.id, doc);
  }

  async getLatestDocument(): Promise<Doc> {
    const doc = await this.db.read(this.id);
    if (!doc) {
      throw new Error("Document not found");
    }
    return doc;
  }
}
