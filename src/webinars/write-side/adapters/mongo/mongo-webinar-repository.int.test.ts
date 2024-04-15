import { MongoWebinar } from './mongo-webinar';
import { Model } from 'mongoose';
import { MongoWebinarRepository } from './mongo-webinar-repository';
import { getModelToken } from '@nestjs/mongoose';
import { Webinar } from '../../entities/webinar.entity';
import { TestApp } from '../../../../tests/utils/test-app';

const cleanArchitectureWebinar = new Webinar({
  id: 'clean-architecture-id',
  organizerId: 'organizer-id',
  title: 'Clean Architecture',
  seats: 100,
  startDate: new Date('2023-01-01T00:00:00Z'),
  endDate: new Date('2023-01-01T01:00:00Z'),
});

const cqrsWebinar = new Webinar({
  id: 'cqrs-id',
  organizerId: 'organizer-id',
  title: 'CQRS',
  seats: 100,
  startDate: new Date('2023-01-01T00:00:00Z'),
  endDate: new Date('2023-01-01T01:00:00Z'),
});

describe('MongoWebinarRepository', () => {
  async function createWebinarInDatabase(webinar: Webinar) {
    const record = new model({
      _id: webinar.props.id,
      organizerId: webinar.props.organizerId,
      title: webinar.props.title,
      seats: webinar.props.seats,
      startDate: webinar.props.startDate,
      endDate: webinar.props.endDate,
    });

    await record.save();
  }

  let app: TestApp;
  let model: Model<MongoWebinar.SchemaClass>;
  let repository: MongoWebinarRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = app.get<Model<MongoWebinar.SchemaClass>>(
      getModelToken(MongoWebinar.CollectionName),
    );

    repository = new MongoWebinarRepository(model);

    await createWebinarInDatabase(cleanArchitectureWebinar);
  });

  describe('Find by id', () => {
    it('should find webinar by id', async () => {
      const webinar = await repository.findById(
        cleanArchitectureWebinar.props.id,
      );
      expect(webinar!.props).toEqual(cleanArchitectureWebinar.props);
    });

    it('should return null when the webinar is not found', async () => {
      const webinar = await repository.findById('non-existing-id');
      expect(webinar).toBeNull();
    });
  });

  describe('Create', () => {
    it('should create a webinar', async () => {
      await repository.create(cqrsWebinar);

      const webinar = await model.findById(cqrsWebinar.props.id);
      expect(webinar!.toObject()).toEqual({
        __v: 0,
        _id: cqrsWebinar.props.id,
        organizerId: cqrsWebinar.props.organizerId,
        title: cqrsWebinar.props.title,
        seats: cqrsWebinar.props.seats,
        startDate: cqrsWebinar.props.startDate,
        endDate: cqrsWebinar.props.endDate,
      });
    });
  });

  describe('Update', () => {
    it('should update the webinar', async () => {
      await createWebinarInDatabase(cqrsWebinar);

      const updatedWebinar = cqrsWebinar.clone() as Webinar;
      updatedWebinar.update({
        title: 'CQRS and Event Sourcing',
        seats: 200,
        startDate: new Date('2023-01-02T00:00:00Z'),
        endDate: new Date('2023-01-02T01:00:00Z'),
      });

      await repository.update(updatedWebinar);

      const record = await model.findById(cqrsWebinar.props.id);
      expect(record!.toObject()).toEqual({
        __v: 0,
        _id: updatedWebinar.props.id,
        organizerId: updatedWebinar.props.organizerId,
        title: updatedWebinar.props.title,
        seats: updatedWebinar.props.seats,
        startDate: updatedWebinar.props.startDate,
        endDate: updatedWebinar.props.endDate,
      });

      expect(updatedWebinar.props).toEqual(updatedWebinar.initialState);
    });
  });

  describe('Delete', () => {
    it('should delete the webinar', async () => {
      await repository.delete(cqrsWebinar);

      const webinar = await model.findById(cqrsWebinar.props.id);
      expect(webinar).toBeNull();
    });
  });

  afterEach(async () => {
    await app.cleanup();
  });
});
