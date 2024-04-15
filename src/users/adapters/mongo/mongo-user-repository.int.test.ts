import { TestApp } from '../../../tests/utils/test-app';
import { MongoUser } from './mongo-user';
import { Model } from 'mongoose';
import { MongoUserRepository } from './mongo-user-repository';
import { getModelToken } from '@nestjs/mongoose';
import { testUsers } from '../../tests/user-seeds';
import { User } from '../../entities/user.entity';

describe('MongoUserRepository', () => {
  async function createUserInDatabase(user: User) {
    const record = new model({
      _id: user.props.id,
      emailAddress: user.props.emailAddress,
      password: user.props.password,
    });

    await record.save();
  }

  let app: TestApp;
  let model: Model<MongoUser.SchemaClass>;
  let repository: MongoUserRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoUser.SchemaClass>>(
      getModelToken(MongoUser.CollectionName),
    );

    repository = new MongoUserRepository(model);

    await createUserInDatabase(testUsers.alice);
  });

  describe('Find by email address', () => {
    it('should find user by email address', async () => {
      const user = await repository.findByEmailAddress(
        testUsers.alice.props.emailAddress,
      );

      expect(user?.props).toEqual(testUsers.alice.props);
    });

    it('should fail when the email address is not in use', async () => {
      const user = await repository.findByEmailAddress(
        'does-not-exist@gmail.com',
      );

      expect(user).toEqual(null);
    });
  });

  describe('Find by id', () => {
    it('should find user by id', async () => {
      const user = await repository.findById(testUsers.alice.props.id);
      expect(user?.props).toEqual(testUsers.alice.props);
    });

    it('should fail when the id is not in use', async () => {
      const user = await repository.findById('does-not-exist');
      expect(user).toEqual(null);
    });
  });

  describe('Create', () => {
    it('should create the user', async () => {
      await repository.create(testUsers.bob);

      const record = await model.findById(testUsers.bob.props.id);
      expect(record!.toObject()).toEqual({
        __v: 0,
        _id: testUsers.bob.props.id,
        emailAddress: testUsers.bob.props.emailAddress,
        password: testUsers.bob.props.password,
      });
    });
  });

  afterEach(async () => {
    await app.cleanup();
  });
});
