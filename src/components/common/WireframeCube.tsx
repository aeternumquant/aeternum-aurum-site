import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface WireframeCubeProps {
  className?: string;
  animate?: boolean;
}

export function WireframeCube({ className, animate = true }: WireframeCubeProps) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.2, type: "spring", duration: 2, bounce: 0 },
        opacity: { delay: i * 0.2, duration: 0.5 },
      },
    }),
  };

  const floatAnimation = animate
    ? {
        y: ["-4px", "4px", "-4px"],
        rotate: [0, 1, 0, -1, 0],
        transition: {
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        },
      }
    : {};

  return (
    <motion.div
      className={cn("relative flex items-center justify-center", className)}
      animate={floatAnimation}
    >
      <div className="absolute inset-0 glow-radial blur-2xl opacity-60 scale-150 rounded-full" />
      {/* Outer rotating ring */}
      {animate && (
        <motion.div
          className="absolute inset-[-12px] rounded-full border border-primary/[0.06]"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      )}
      <svg
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(198,167,92,0.5)]"
      >
        <g stroke="hsl(var(--primary))" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <motion.polygon
            points="50,5 95,30 95,80 50,105 5,80 5,30"
            variants={draw} custom={0} initial="hidden" animate="visible"
          />
          <motion.polygon
            points="50,25 75,40 75,70 50,85 25,70 25,40"
            variants={draw} custom={1} initial="hidden" animate="visible"
            strokeOpacity="0.6"
          />
          <motion.line x1="50" y1="5" x2="50" y2="25" variants={draw} custom={2} initial="hidden" animate="visible" />
          <motion.line x1="50" y1="85" x2="50" y2="105" variants={draw} custom={2} initial="hidden" animate="visible" />
          <motion.line x1="50" y1="55" x2="5" y2="30" variants={draw} custom={3} initial="hidden" animate="visible" />
          <motion.line x1="50" y1="55" x2="95" y2="30" variants={draw} custom={3} initial="hidden" animate="visible" />
          <motion.line x1="50" y1="55" x2="50" y2="105" variants={draw} custom={3} initial="hidden" animate="visible" />
          <motion.line x1="25" y1="40" x2="5" y2="30" variants={draw} custom={4} initial="hidden" animate="visible" strokeOpacity="0.5" />
          <motion.line x1="75" y1="40" x2="95" y2="30" variants={draw} custom={4} initial="hidden" animate="visible" strokeOpacity="0.5" />
          <motion.line x1="25" y1="70" x2="5" y2="80" variants={draw} custom={4} initial="hidden" animate="visible" strokeOpacity="0.5" />
          <motion.line x1="75" y1="70" x2="95" y2="80" variants={draw} custom={4} initial="hidden" animate="visible" strokeOpacity="0.5" />
        </g>
      </svg>
    </motion.div>
  );
}
