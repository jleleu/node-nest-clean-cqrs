import { User } from '../entities/user.entity';

export interface UserRepository {
  findByEmailAddress(emailAddress: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
