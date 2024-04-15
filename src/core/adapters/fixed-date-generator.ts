import { DateGenerator } from '../ports/date-generator';

export class FixedDateGenerator implements DateGenerator {
  now(): Date {
    return new Date('2023-01-01T00:00:00.000Z');
  }
}
