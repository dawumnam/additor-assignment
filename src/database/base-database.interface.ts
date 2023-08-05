export interface BaseDatabase<T> {
  create(entity: T): Promise<T>;
  read(id: string): Promise<T | null>;
  update(id: string, item: T): Promise<void>;
  delete(id: string): Promise<void>;
  getCount(): Promise<number>;
  findItemByKey(key: string | number, value: any): Promise<T | null>;
}
