// toaster.jsx content with fixes
import React, { useEffect } from "react";
import { IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useTransientStore from "../state/transientState";
import { motion, AnimatePresence } from "motion/react";

export const Toaster = () => {
  const toaster_queue = useTransientStore((state) => state.toaster_queue);
  const removeToaster = useTransientStore((state) => state.removeToast);

  const handleToastClose = (event, reason, id) => {
    if (reason === "clickaway") return;
    removeToaster(id);
  };

  // Define valid severity types
  const validSeverityTypes = ["error", "info", "success", "warning"];

  return (
    <motion.div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '16px',
        padding: '16px',
        zIndex: 1400,
      }}
    >
      <AnimatePresence>
        {toaster_queue.map((toaster) => {
          return (
            <motion.div
              key={toaster.id}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <ToastItem
                toaster={toaster}
                removeToaster={removeToaster}
                handleToastClose={handleToastClose}
                validSeverityTypes={validSeverityTypes}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

const ToastItem = ({ toaster, removeToaster, handleToastClose, validSeverityTypes }) => {
  useEffect(() => {
    if (toaster.show && toaster.duration && toaster.duration !== null && toaster.duration !== Infinity) {
      const timer = setTimeout(() => {
        removeToaster(toaster.id);
      }, toaster.duration);
      return () => clearTimeout(timer);
    }
  }, [toaster.id, toaster.duration, toaster.show, removeToaster]);

  return (
    toaster.show && validSeverityTypes.includes(toaster.type) ? (
      <Alert
        onClose={() => handleToastClose(null, null, toaster.id)}
        severity={toaster.type}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {toaster.message}
      </Alert>
    ) : null
  );
};
