"use client";
export default function StoreError({ reset }: { reset: () => void }) {
  return (
    <main style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1>We couldn’t load the store.</h1>
      <p>
        Please try again in a moment. Your saved cart stays in this browser.
      </p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
