import { BaseEntity } from "./base-entity";

export class Change extends BaseEntity {
  constructor(public changeDelta: string, public targetVersion: number) {
    super();
    this.changeDelta = changeDelta;
    this.targetVersion = targetVersion;
  }
}
