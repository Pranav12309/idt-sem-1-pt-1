import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  to: number;
  suffix?: string;
  duration?: number;
}

export function AnimatedNumber({ to, suffix = "", duration = 1.4 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  const [text, setText] = useState("0");

  useEffect(() => {
    if (inView) mv.set(to);
    return display.on("change", (v) => setText(v));
  }, [inView, to, mv, display]);

  return <span ref={ref}>{text}{suffix}</span>;
}
