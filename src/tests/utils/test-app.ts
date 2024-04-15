import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IFixture } from './fixture';
import { AppModule } from '../../core/app.module';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { MongoUser } from '../../users/adapters/mongo/mongo-user';
import { getModelToken } from '@nestjs/mongoose';
import { MongoParticipation } from '../../webinars/write-side/adapters/mongo/mongo-participation';
import { MongoWebinar } from '../../webinars/write-side/adapters/mongo/mongo-webinar';

export class TestApp {
  private app: INestApplication;

  async setup() {
    const module = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          isGlobal: true,
          load: [
            () => ({
              MONGODB_URL:
                'mongodb://admin:azerty@localhost:3701/webinars?authSource=admin&directConnection=true',
            }),
          ],
        }),
      ],
    }).compile();

    this.app = module.createNestApplication();
    await this.app.init();

    await this.clearDatabase();
  }

  async cleanup() {
    await this.app.close();
  }

  loadFixtures(fixtures: IFixture[]) {
    return Promise.all(fixtures.map((fixture) => fixture.load(this)));
  }

  get<T>(name: any) {
    return this.app.get<T>(name);
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  private async clearDatabase() {
    await this.app
      .get<Model<MongoUser.SchemaClass>>(
        getModelToken(MongoUser.CollectionName),
      )
      .deleteMany({});

    await this.app
      .get<Model<MongoWebinar.SchemaClass>>(
        getModelToken(MongoWebinar.CollectionName),
      )
      .deleteMany({});

    await this.app
      .get<Model<MongoParticipation.SchemaClass>>(
        getModelToken(MongoParticipation.CollectionName),
      )
      .deleteMany({});
  }
}
