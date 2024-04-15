import { DateGenerator } from '../ports/date-generator';

export class CurrentDateGenerator implements DateGenerator {
  now(): Date {
    return new Date();
  }
}
