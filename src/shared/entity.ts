export abstract class Entity<T> {
  public initialState: T;
  public props: T;

  constructor(data: T) {
    this.initialState = { ...data };
    this.props = { ...data };

    Object.freeze(this.initialState);
  }

  update(data: Partial<T>) {
    this.props = { ...this.props, ...data };
  }

  commit() {
    this.initialState = this.props;
  }

  clone() {
    return new (this.constructor as any)(this.props);
  }
}
