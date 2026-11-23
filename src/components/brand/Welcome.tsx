import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Oasi } from "./Oasi";
import { Wordmark } from "./Wordmark";
import { Clouds } from "./Clouds";
import { Button } from "@/components/ui/button";
export function Welcome() {
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (sessionStorage.getItem("oasis-welcomed")) return;
    sessionStorage.setItem("oasis-welcomed", "1");
    if (reduced) return;
    setShow(true);
    const timer = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(timer);
  }, [reduced]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-sky"
          role="dialog"
          aria-label="Welcome to OASIS"
          aria-modal="true"
        >
          <Clouds />
          <div className="relative flex flex-col items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <Oasi size={190} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Wordmark size={76} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-xl font-semibold"
            >
              Your pause in the chaos.
            </motion.p>
          </div>
          <Button variant="ghost" className="absolute right-6 top-6" onClick={() => setShow(false)}>
            Skip welcome
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
