// Date and time fields are typed as `Date | string` because they arrive from the
// API as JSON strings, even though Prisma models them as dates on the server.

interface User {
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: Date | string;
  endDate: Date | string;
}

interface Itinerary {
  id: string;
  tripId: string;
  date: Date | string;
  day: number;
  // Only present on endpoints that include the day's activities.
  activities?: Activity[];
}

interface Activity {
  id: string;
  itineraryId: string;
  title: string;
  location: string;
  startTime: Date | string;
  endTime: Date | string;
}
