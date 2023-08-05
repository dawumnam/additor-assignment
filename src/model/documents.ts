import { BaseEntity } from "./base-entity";

export class Doc extends BaseEntity {
  constructor(public content: string, public version: number) {
    super();
    this.content = content;
    this.version = version;
  }
}
