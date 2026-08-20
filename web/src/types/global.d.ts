interface User {
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
}

interface Trip {
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

interface Itinerary {
  trip: Trip;
  date: Date;
  day: number;
  activities: Activity[];
}

interface Activity {
  title: string;
  location: string;
  startTime: Date;
  endTime: Date;
}
