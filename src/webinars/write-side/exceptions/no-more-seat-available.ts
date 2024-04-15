import { DomainException } from '../../../shared/exception';

export class NoMoreSeatsAvailableException extends DomainException {
  constructor() {
    super(`No more seats available`);
  }
}
