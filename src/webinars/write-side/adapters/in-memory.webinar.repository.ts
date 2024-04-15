import { WebinarRepository } from '../ports/webinar.repository';
import { Webinar } from '../entities/webinar.entity';

export class InMemoryWebinarRepository implements WebinarRepository {
  constructor(public database: Webinar[] = []) {}

  findByIdSync(id: string): Webinar | null {
    const webinar = this.database.find((w) => w.props.id === id);
    return webinar ? new Webinar({ ...webinar.initialState }) : null;
  }

  async findById(id: string): Promise<Webinar | null> {
    return this.findByIdSync(id);
  }

  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }

  async update(webinar: Webinar): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinar.props.id,
    );
    this.database[index] = webinar;
    webinar.commit();
  }

  async delete(webinar: Webinar): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinar.props.id,
    );
    this.database.splice(index, 1);
  }
}
