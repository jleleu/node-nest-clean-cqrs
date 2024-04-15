import { IFixture } from '../utils/fixture';
import { TestApp } from '../utils/test-app';
import { UserRepository } from '../../users/ports/user-repository.interface';
import { I_USER_REPOSITORY } from '../../users/adapters/in-memory.user-repository';
import { User } from '../../users/entities/user.entity';

export class UserFixture implements IFixture {
  constructor(public entity: User) {}

  async load(app: TestApp): Promise<void> {
    const userRepository = app.get<UserRepository>(I_USER_REPOSITORY);
    await userRepository.create(this.entity);
  }

  createAuthorizationToken(): string {
    return `Basic ${Buffer.from(
      `${this.entity.props.emailAddress}:${this.entity.props.password}`,
    ).toString('base64')}`;
  }
}
