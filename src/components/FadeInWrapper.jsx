// src/components/FadeInWrapper.jsx
import { motion } from "framer-motion";

const FadeInWrapper = ({ children, delay = 0, duration = 0.4 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default FadeInWrapper;
