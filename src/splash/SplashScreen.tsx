import { useEffect, useState } from 'react';
import { TrackPathLoader } from './TrackPathLoader';

// Loader intro runs ~2.1s (title 1.4s + 0.15s delay, subtitle ends ~2.05s),
// then a short hold before the overlay fades away.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * First-load splash screen: plays the Track Path loader animation, then fades
 * out and unmounts itself so the existing app underneath is revealed. Purely
 * presentational — it never blocks the app's data fetching and always removes
 * itself, even if the font fails to load.
 */
export function SplashScreen() {
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const reducedMotion = prefersReducedMotion();
  const introMs = reducedMotion ? 300 : 2300;
  const exitMs = reducedMotion ? 150 : 600;

  // Reveal once the Cinzel font is available (so the title reveal doesn't
  // swap fonts mid-animation), with a hard fallback so we never get stuck.
  useEffect(() => {
    let disposed = false;
    let revealed = false;

    const reveal = () => {
      if (disposed || revealed) return;
      revealed = true;
      setReady(true);
    };

    const fallback = window.setTimeout(reveal, 2000);

    if (document.fonts && document.fonts.load) {
      document.fonts.load('700 16px Cinzel').then(reveal, reveal);
    } else {
      reveal();
    }

    return () => {
      disposed = true;
      window.clearTimeout(fallback);
    };
  }, []);

  // Enter -> hold -> fade out -> unmount.
  useEffect(() => {
    if (!ready) return;
    const exitTimer = window.setTimeout(() => setExiting(true), introMs);
    const unmountTimer = window.setTimeout(() => setDismissed(true), introMs + exitMs);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [ready, introMs, exitMs]);

  if (dismissed) return null;

  return (
    <div
      className={`splash-screen${exiting ? ' is-exiting' : ''}`}
      aria-hidden={exiting ? 'true' : undefined}
    >
      {ready && <TrackPathLoader />}
    </div>
  );
}
