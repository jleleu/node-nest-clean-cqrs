import { Module } from '@nestjs/common';
import { I_USER_REPOSITORY } from '../users/adapters/in-memory.user-repository';
import { Authenticator } from '../users/services/authenticator';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { WebinarModule } from '../webinars/webinar.module';
import { CommonModule } from './common.module';
import { UserModule } from '../users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          uri: config.get<string>('MONGODB_URL'),
        };
      },
    }),
    CommonModule,
    WebinarModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: Authenticator,
      inject: [I_USER_REPOSITORY],
      useFactory: (userRepository) => {
        return new Authenticator(userRepository);
      },
    },
    {
      provide: APP_GUARD,
      inject: [Authenticator],
      useFactory: (authenticator) => {
        return new AuthGuard(authenticator);
      },
    },
  ],
  exports: [],
})
export class AppModule {}
