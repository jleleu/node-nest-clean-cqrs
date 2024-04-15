import { IdGenerator } from '../ports/id-generator';
import { v4 } from 'uuid';

export class RandomIdGenerator implements IdGenerator {
  generate(): string {
    return v4();
  }
}
