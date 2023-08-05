import { BaseEntity } from "./base-entity";

export class User extends BaseEntity {
  constructor(public email: string, public name: string) {
    super();
    this.email = email;
    this.name = name;
  }
}
