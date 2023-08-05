import { randomUUID } from "crypto";

export class BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  id: string;

  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.id = randomUUID();
  }
}
