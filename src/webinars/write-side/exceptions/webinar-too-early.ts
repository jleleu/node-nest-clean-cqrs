import { DomainException } from '../../../shared/exception';

export class WebinarTooEarlyException extends DomainException {
  constructor() {
    super(`The webinar must happen in at least 3 days`);
  }
}
