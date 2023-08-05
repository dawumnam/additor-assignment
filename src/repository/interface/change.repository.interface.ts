import { Change } from "../../model/changes";

export interface ChangeRepository {
  create(change: Change): Promise<Change>;
  findByVersion(version: number): Promise<Change | null>;
  findAll(): Promise<Record<number, string>>;
}
