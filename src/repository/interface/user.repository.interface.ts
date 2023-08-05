import { User } from "../../model/users";

export interface UserRepository {
  create(user: User): Promise<User>;
  read(id: string): Promise<User | null>;
  update(id: string, user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
}
