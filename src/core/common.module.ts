import { Module } from '@nestjs/common';
import { CurrentDateGenerator } from './adapters/current-date-generator';
import { RandomIdGenerator } from './adapters/random-id-generator';
import { I_DATE_GENERATOR } from './ports/date-generator';
import { I_ID_GENERATOR } from './ports/id-generator';
import { I_MAILER } from './ports/mailer.interface';
import { InMemoryMailer } from './adapters/in-memory-mailer';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: I_DATE_GENERATOR,
      useClass: CurrentDateGenerator,
    },
    {
      provide: I_ID_GENERATOR,
      useClass: RandomIdGenerator,
    },
    {
      provide: I_MAILER,
      useClass: InMemoryMailer,
    },
  ],
  exports: [I_DATE_GENERATOR, I_ID_GENERATOR, I_MAILER],
})
export class CommonModule {}
