export const I_DATE_GENERATOR = 'I_DATE_GENERATOR';

export interface DateGenerator {
  now(): Date;
}
