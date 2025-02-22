export type WebinarDto = {
  id: string;
  organizer: {
    id: string;
    emailAddress: string;
  };
  title: string;
  startDate: Date;
  endDate: Date;
  seats: {
    reserved: number;
    available: number;
  };
};
