import { motion } from "framer-motion";

export default function PageTransition({ children }) {
  const variants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: "easeOut" }}
      variants={variants}
      style={{ minHeight: "100%" }}
    >
      {children}
    </motion.div>
  );
}

