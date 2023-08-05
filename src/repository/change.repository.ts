import { InMemoryDatabase } from "../database/inmemory/inmemory-database";
import { Change } from "../model/changes";
import { ChangeRepository } from "./interface/change.repository.interface";

export class ChangeRepositoryImpl implements ChangeRepository {
  private db: InMemoryDatabase<Change>;
  private static instance: ChangeRepository;

  private constructor() {
    this.db = new InMemoryDatabase<Change>();
  }

  static getInstance(): ChangeRepository {
    if (!ChangeRepositoryImpl.instance) {
      ChangeRepositoryImpl.instance = new ChangeRepositoryImpl();
    }
    return ChangeRepositoryImpl.instance;
  }
  async create(change: Change): Promise<Change> {
    return await this.db.create(change);
  }
  async findByVersion(version: number): Promise<Change | null> {
    return await this.db.findItemByKey("version", version);
  }

  async findAll(): Promise<Record<number, string>> {
    const changes = await Object.values(this.db);
    return arrayToObject(changes);
  }
}

function arrayToObject(arr: any) {
  return arr.reduce((acc: any, curr: any) => {
    acc[curr.targetVersion] = curr.changeDelta;
    return acc;
  }, {});
}
