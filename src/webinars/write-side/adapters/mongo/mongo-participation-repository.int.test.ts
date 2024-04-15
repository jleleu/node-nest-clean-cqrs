import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MongoParticipation } from './mongo-participation';
import { MongoParticipationRepository } from './mongo-participation-repository';
import { Participation } from '../../entities/participation.entity';
import { TestApp } from '../../../../tests/utils/test-app';

describe('MongoParticipationRepository', () => {
  async function createParticipationInDatabase(participation: Participation) {
    const record = new model({
      _id: MongoParticipation.SchemaClass.makeId(participation),
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });

    await record.save();
  }

  const savedParticipation = new Participation({
    userId: 'user-id',
    webinarId: 'webinar-id',
  });

  let app: TestApp;
  let model: Model<MongoParticipation.SchemaClass>;
  let repository: MongoParticipationRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoParticipation.SchemaClass>>(
      getModelToken(MongoParticipation.CollectionName),
    );

    repository = new MongoParticipationRepository(model);

    await createParticipationInDatabase(savedParticipation);
  });

  describe('Find one', () => {
    it('should find participation by user and webinar id', async () => {
      const participation = await repository.findOne(
        savedParticipation.props.userId,
        savedParticipation.props.webinarId,
      );

      expect(participation?.props).toEqual(savedParticipation.props);
    });

    it('should return null if participation not found', async () => {
      const participation = await repository.findOne(
        'unknown-user-id',
        'unknown-webinar-id',
      );

      expect(participation).toBeNull();
    });
  });

  describe('Find by webinar id', () => {
    it('should find participation by webinar id', async () => {
      const participations = await repository.findByWebinarId(
        savedParticipation.props.webinarId,
      );

      expect(participations).toHaveLength(1);
      expect(participations[0].props).toEqual(savedParticipation.props);
    });
  });

  describe('Find participation count', () => {
    it('should find participation count', async () => {
      const participationCount = await repository.findParticipationCount(
        savedParticipation.props.webinarId,
      );

      expect(participationCount).toEqual(1);
    });
  });

  describe('Create', () => {
    it('should create the participation', async () => {
      const participation = new Participation({
        userId: 'new-user-id',
        webinarId: 'new-web',
      });

      await repository.create(participation);

      const record = await model.findOne({
        userId: participation.props.userId,
        webinarId: participation.props.webinarId,
      });

      expect(record?.toObject()).toEqual({
        __v: 0,
        _id: MongoParticipation.SchemaClass.makeId(participation),
        userId: participation.props.userId,
        webinarId: participation.props.webinarId,
      });
    });
  });

  describe('Delete', () => {
    it('should delete the participation', async () => {
      await repository.delete(savedParticipation);

      const record = await model.findOne({
        userId: savedParticipation.props.userId,
        webinarId: savedParticipation.props.webinarId,
      });

      expect(record).toBeNull();
    });
  });

  afterEach(async () => {
    await app.cleanup();
  });
});
