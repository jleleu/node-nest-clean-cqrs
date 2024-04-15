import { IdGenerator } from '../ports/id-generator';

export class FixedIdGenerator implements IdGenerator {
  generate(): string {
    return 'id-1';
  }
}
