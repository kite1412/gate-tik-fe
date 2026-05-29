import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const getMatches = () =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);

    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
