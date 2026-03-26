import { useEffect, useRef } from "react";

export function useScrollReveal() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    const children = el.querySelectorAll(".scroll-reveal");
    for (const child of Array.from(children)) {
      observer.observe(child);
    }
    if (el.classList.contains("scroll-reveal")) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}
