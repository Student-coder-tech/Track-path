import { useEffect, useState } from 'react';
import splashImage from '../assets/trackpath.jpeg';

const ENTER_MS = 1500;
const HOLD_MS = 400;
const EXIT_MS = 600;
const PRELOAD_FALLBACK_MS = 5000;

/**
 * First-load splash screen. Shows the branded Track Path image with the
 * fade-in / scale-up animation, then fades out and unmounts itself so the
 * existing app underneath is revealed. Purely presentational: it never blocks
 * the app's data fetching and removes itself even if the image fails to load.
 */
export function SplashScreen() {
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Preload the image so the animation starts once it is actually available.
  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setReady(true);
    };

    const img = new Image();
    img.onload = reveal;
    img.onerror = reveal;
    img.src = splashImage;
    if (img.complete) reveal();

    // Safety net: never leave the visitor stuck behind the splash screen.
    const fallback = window.setTimeout(reveal, PRELOAD_FALLBACK_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // Enter -> hold -> fade out -> unmount.
  useEffect(() => {
    if (!ready) return;
    const exitTimer = window.setTimeout(() => setExiting(true), ENTER_MS + HOLD_MS);
    const unmountTimer = window.setTimeout(
      () => setDismissed(true),
      ENTER_MS + HOLD_MS + EXIT_MS
    );
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [ready]);

  if (dismissed) return null;

  return (
    <div
      className={`splash-screen${exiting ? ' is-exiting' : ''}`}
      aria-hidden={exiting ? 'true' : undefined}
    >
      {ready && (
        <div className="stage">
          <img
            src={splashImage}
            alt="Track Path - Job & Internship Tracker"
            className="animated-image"
          />
        </div>
      )}
    </div>
  );
}
