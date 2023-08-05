import { RegisterDto } from "../controller/interface/dto";
import { User } from "../model/users";
import { UserRepository } from "../repository/interface/user.repository.interface";
import { UserRepositoryImpl } from "../repository/user.repository";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {
    this.userRepository = UserRepositoryImpl.getInstance();
  }

  async createUser(registerDto: RegisterDto): Promise<void> {
    const { name, email } = registerDto;
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      await this.userRepository.update(user.id, { ...user, name });
    } else {
      const user = await this.userRepository.create(new User(name, email));
    }
  }
}
