export const I_ID_GENERATOR = 'I_ID_GENERATOR';

export interface IdGenerator {
  generate(): string;
}
