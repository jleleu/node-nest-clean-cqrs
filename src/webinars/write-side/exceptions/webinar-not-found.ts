import { DomainException } from '../../../shared/exception';

export class WebinarNotFoundException extends DomainException {
  constructor() {
    super(`Webinar not found`);
  }
}
