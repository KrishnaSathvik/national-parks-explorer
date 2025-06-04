// src/components/FadeInWrapper.jsx
import { motion } from "framer-motion";

const FadeInWrapper = ({ 
  children, 
  delay = 0, 
  duration = 0.4, 
  className = "",
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 }
}) => (
  <motion.div
    initial={initial}
    animate={animate}
    transition={{ delay, duration, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default FadeInWrapper;