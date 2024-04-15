import { IFixture } from '../utils/fixture';
import { TestApp } from '../utils/test-app';
import {
  I_WEBINAR_REPOSITORY,
  WebinarRepository,
} from '../../webinars/write-side/ports/webinar.repository';
import { Webinar } from '../../webinars/write-side/entities/webinar.entity';

export class WebinarFixture implements IFixture {
  constructor(public entity: Webinar) {}

  async load(app: TestApp): Promise<void> {
    const webinarRepository = app.get<WebinarRepository>(I_WEBINAR_REPOSITORY);
    await webinarRepository.create(this.entity);
  }
}
