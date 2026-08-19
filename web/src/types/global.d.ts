interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface Trip {
  id: string;
  userId: string;
  user: User;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  itinerary?: Itinerary[];
}

interface Itinerary {
  id: string;
  tripId: string;
  trip: Trip;
  date: Date;
  day: number;
  activities: Activity[];
}

interface Activity {
  id: string;
  itineraryId: string;
  title: string;
  location: string;
  startTime: Date;
  endTime: Date;
}
