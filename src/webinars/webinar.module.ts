import { Module } from '@nestjs/common';
import { WebinarController } from './controllers/webinar.controller';
import { CommonModule } from '../core/common.module';
import { I_USER_REPOSITORY } from '../users/adapters/in-memory.user-repository';
import { I_MAILER } from '../core/ports/mailer.interface';
import { I_DATE_GENERATOR } from '../core/ports/date-generator';
import { I_ID_GENERATOR } from '../core/ports/id-generator';
import { UserModule } from '../users/user.module';
import { ParticipationController } from './controllers/participation.controller';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoUser } from '../users/adapters/mongo/mongo-user';
import { GetWebinarByIdQueryHandler } from './read-side/queries/get-webinar-by-id';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoWebinar } from './write-side/adapters/mongo/mongo-webinar';
import { MongoParticipation } from './write-side/adapters/mongo/mongo-participation';
import { I_WEBINAR_REPOSITORY } from './write-side/ports/webinar.repository';
import { MongoWebinarRepository } from './write-side/adapters/mongo/mongo-webinar-repository';
import { I_PARTICIPATION_REPOSITORY } from './write-side/ports/participation.repository';
import { MongoParticipationRepository } from './write-side/adapters/mongo/mongo-participation-repository';
import { OrganizeWebinar } from './write-side/commands/organize-webinar';
import { ChangeSeats } from './write-side/commands/change-seats';
import { ChangeDates } from './write-side/commands/change-dates';
import { CancelWebinar } from './write-side/commands/cancel-webinar';
import { ReserveSeatCommandHandler } from './write-side/commands/reserve-seat';
import { CancelSeat } from './write-side/commands/cancel-seat';

@Module({
  imports: [
    CqrsModule,
    CommonModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: MongoWebinar.CollectionName,
        schema: MongoWebinar.Schema,
      },
      {
        name: MongoParticipation.CollectionName,
        schema: MongoParticipation.Schema,
      },
    ]),
  ],
  controllers: [WebinarController, ParticipationController],
  providers: [
    {
      provide: I_WEBINAR_REPOSITORY,
      inject: [getModelToken(MongoWebinar.CollectionName)],
      useFactory: (model) => {
        return new MongoWebinarRepository(model);
      },
    },
    {
      provide: I_PARTICIPATION_REPOSITORY,
      inject: [getModelToken(MongoParticipation.CollectionName)],
      useFactory: (model) => {
        return new MongoParticipationRepository(model);
      },
    },
    {
      provide: GetWebinarByIdQueryHandler,
      inject: [
        getModelToken(MongoWebinar.CollectionName),
        getModelToken(MongoParticipation.CollectionName),
        getModelToken(MongoUser.CollectionName),
      ],
      useFactory: (webinarModel, participationModel, userModel) => {
        return new GetWebinarByIdQueryHandler(
          webinarModel,
          participationModel,
          userModel,
        );
      },
    },
    {
      provide: OrganizeWebinar,
      inject: [I_DATE_GENERATOR, I_ID_GENERATOR, I_WEBINAR_REPOSITORY],
      useFactory: (dateGenerator, idGenerator, repository) => {
        return new OrganizeWebinar(repository, idGenerator, dateGenerator);
      },
    },
    {
      provide: ChangeSeats,
      inject: [I_WEBINAR_REPOSITORY],
      useFactory: (repository) => {
        return new ChangeSeats(repository);
      },
    },
    {
      provide: ChangeDates,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_DATE_GENERATOR,
        I_MAILER,
      ],
      useFactory: (
        webinarRepository,
        participationRepository,
        userRepository,
        dateGenerator,
        mailer,
      ) => {
        return new ChangeDates(
          webinarRepository,
          participationRepository,
          userRepository,
          dateGenerator,
          mailer,
        );
      },
    },
    {
      provide: CancelWebinar,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        webinarRepository,
        participationRepository,
        userRepository,
        mailer,
      ) => {
        return new CancelWebinar(
          webinarRepository,
          participationRepository,
          userRepository,
          mailer,
        );
      },
    },
    {
      provide: ReserveSeatCommandHandler,
      inject: [
        I_PARTICIPATION_REPOSITORY,
        I_WEBINAR_REPOSITORY,
        I_USER_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        participationRepository,
        webinarRepository,
        userRepository,
        mailer,
      ) => {
        return new ReserveSeatCommandHandler(
          participationRepository,
          webinarRepository,
          userRepository,
          mailer,
        );
      },
    },
    {
      provide: CancelSeat,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_MAILER,
      ],

      useFactory: (
        webinarRepository,
        participationRepository,
        userRepository,
        mailer,
      ) => {
        return new CancelSeat(
          webinarRepository,
          participationRepository,
          userRepository,
          mailer,
        );
      },
    },
  ],
  exports: [I_WEBINAR_REPOSITORY],
})
export class WebinarModule {}
