import { User } from 'src/users/entities/user.entity';
import { UserRepository } from '../ports/user-repository.interface';

export const I_USER_REPOSITORY = 'I_USER_REPOSITORY';

export class InMemoryUserRepository implements UserRepository {
  constructor(public readonly database: User[] = []) {}

  async findByEmailAddress(emailAddress: string): Promise<User | null> {
    const user = this.database.find(
      (user) => user.props.emailAddress === emailAddress,
    );

    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.database.find((user) => user.props.id === id);
    return user || null;
  }

  async create(user: User): Promise<void> {
    this.database.push(user);
  }
}
