import { DomainException } from '../../../shared/exception';

export class WebinarUpdateForbiddenException extends DomainException {
  constructor() {
    super(`You are not allowed to update this webinar`);
  }
}
