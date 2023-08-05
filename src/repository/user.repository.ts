import { UserRepository } from "./interface/user.repository.interface";
import { InMemoryDatabase } from "../database/inmemory/inmemory-database";
import { User } from "../model/users";

export class UserRepositoryImpl implements UserRepository {
  private db: InMemoryDatabase<User>;
  private static instance: UserRepository;

  private constructor() {
    this.db = new InMemoryDatabase<User>();
  }

  static getInstance(): UserRepository {
    if (!UserRepositoryImpl.instance) {
      UserRepositoryImpl.instance = new UserRepositoryImpl();
    }
    return UserRepositoryImpl.instance;
  }

  async create(user: User): Promise<User> {
    return await this.db.create(user);
  }
  async read(id: string): Promise<User | null> {
    return await this.db.read(id);
  }

  async update(id: string, user: User): Promise<void> {
    return await this.db.update(id, user);
  }

  async delete(id: string): Promise<void> {
    return await this.db.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.db.findItemByKey("email", email);
  }

  async findByName(name: string): Promise<User | null> {
    return await this.db.findItemByKey("name", name);
  }
}
