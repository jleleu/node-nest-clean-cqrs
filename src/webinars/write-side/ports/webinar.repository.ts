import { Webinar } from '../entities/webinar.entity';

export const I_WEBINAR_REPOSITORY = 'I_WEBINAR_REPOSITORY';

export interface WebinarRepository {
  findById(id: string): Promise<Webinar | null>;
  create(webinar: Webinar): Promise<void>;
  update(webinar: Webinar): Promise<void>;
  delete(webinar: Webinar): Promise<void>;
}
