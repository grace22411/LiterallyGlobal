"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <main className="container section"><h1>We couldn’t load your dashboard.</h1><p>Your result has not been removed. Please retry in a moment.</p><button className="button button-dark" onClick={reset}>Try again</button></main>;
}
