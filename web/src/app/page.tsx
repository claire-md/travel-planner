"use client";

import {
  ArrowNarrowRight,
  Calendar,
  Clock,
  Globe01,
  MarkerPin01,
  Route,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

const features = [
  {
    icon: Calendar,
    title: "Plan day by day",
    description:
      "Break a trip into individual days and build a clear itinerary for each one.",
  },
  {
    icon: Clock,
    title: "Schedule activities",
    description:
      "Add activities with start and end times so every day flows in order.",
  },
  {
    icon: MarkerPin01,
    title: "Keep track of places",
    description:
      "Save destinations and locations so you always know where you're headed next.",
  },
];

const HomePage = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-primary">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 border-b border-secondary bg-primary/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-solid">
              <Globe01 className="size-5 text-white" />
            </span>
            <span className="text-lg font-semibold text-primary">
              Travel Planner
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button color="link-gray" size="md" href="/login">
              Log in
            </Button>
            <Button size="md" href="/signup">
              Sign up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:py-28">
          <span className="flex items-center gap-2 rounded-full bg-brand-primary px-3 py-1 text-sm font-medium text-brand-secondary ring-1 ring-brand ring-inset">
            <Route className="size-4 shrink-0" />
            Plan every day of your next trip
          </span>

          <div className="flex max-w-3xl flex-col gap-5">
            <h1 className="text-display-sm font-semibold text-primary sm:text-display-md">
              Your trips, organized from the first day to the last
            </h1>
            <p className="text-lg text-tertiary">
              Travel Planner helps you turn a rough idea into a day-by-day
              itinerary. Add your trips, plan each day, and keep every activity
              in one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="xl" href="/signup" iconTrailing={ArrowNarrowRight}>
              Get started for free
            </Button>
            <Button color="secondary" size="xl" href="/login">
              Log in
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="bg-secondary">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex max-w-2xl flex-col gap-4">
              <h2 className="text-display-xs font-semibold text-primary">
                Everything you need to plan a trip
              </h2>
              <p className="text-md text-tertiary">
                Simple tools to structure your travels, without the clutter of a
                spreadsheet.
              </p>
            </div>

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="flex flex-col gap-4 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-brand-primary ring-1 ring-brand ring-inset">
                    <feature.icon className="size-5.5 text-fg-brand-primary" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-lg font-semibold text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-tertiary">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Call to action */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-brand-solid px-6 py-14 text-center sm:px-12">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="text-display-xs font-semibold text-white">
                Ready to plan your next adventure?
              </h2>
              <p className="text-lg text-white/80">
                Create an account and start building your itinerary in minutes.
              </p>
            </div>
            <Button
              color="secondary"
              size="xl"
              href="/signup"
              iconTrailing={ArrowNarrowRight}
            >
              Get started
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-secondary">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-solid">
              <Globe01 className="size-4 text-white" />
            </span>
            <span className="text-sm font-semibold text-primary">
              Travel Planner
            </span>
          </div>
          <p className="text-sm text-tertiary">
            &copy; {new Date().getFullYear()} Travel Planner. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
