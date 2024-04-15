import { WebinarFixture } from '../fixtures/webinar-fixture';
import { e2eUsers } from './user-seeds.e2e';
import { addDays } from 'date-fns';
import { Webinar } from '../../webinars/write-side/entities/webinar.entity';

export const e2eWebinars = {
  webinar1: new WebinarFixture(
    new Webinar({
      id: 'id-1',
      organizerId: e2eUsers.johnDoe.entity.props.id,
      title: 'My Webinar',
      startDate: addDays(new Date(), 4),
      endDate: addDays(new Date(), 5),
      seats: 50,
    }),
  ),
};
