import { randomUUID } from "crypto";
import { BaseDatabase } from "../base-database.interface";

interface Indexable {
  [key: string | number]: any;
}

export class InMemoryDatabase<T extends Indexable> implements BaseDatabase<T> {
  private db: Record<string, T>;

  constructor() {
    this.db = {};
  }

  async create(item: T): Promise<T> {
    const id = item.id;
    this.db[id] = item;
    return Promise.resolve(this.db[id]);
  }

  async read(id: string): Promise<T | null> {
    return Promise.resolve(this.db[id]);
  }

  async update(id: string, item: T): Promise<void> {
    if (this.db[id]) {
      this.db[id] = item;
    }
  }

  async delete(id: string): Promise<void> {
    if (this.db[id]) {
      delete this.db[id];
    }
  }

  async getCount(): Promise<number> {
    return Promise.resolve(Object.keys(this.db).length);
  }

  async findItemByKey(key: string | number, value: any): Promise<T | null> {
    const item = Object.values(this.db).find((item) => item[key] === value);
    return Promise.resolve(item || null);
  }

  private generateId(): string {
    return randomUUID();
  }
}
