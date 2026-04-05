// toaster.jsx content with fixes
import React from "react";
import { Snackbar, IconButton, Slide, Alert, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useUIStore from "../state/core/useUIStore";

export const Toaster = () => {
  const toasterQueue = useUIStore((state) => state.toasterQueue);
  const removeToaster = useUIStore((state) => state.removeToast);

  const handleToastClose = (event, reason, id) => {
    if (reason === "clickaway") return;
    removeToaster(id);  // Only remove the toast to prevent loops
  };

  // Define valid severity types
  const validSeverityTypes = ["error", "info", "success", "warning"];

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={(event) => handleToastClose(event, null)}  // Fixed missing id by removing unused handler or better yet, not using this action if it's broken
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Stack spacing={2}>  {/* Spacing added to ensure visual stacking */}
      {toasterQueue.map((toaster, index) => (
        <Snackbar
          key={toaster.id}
          open={toaster.show}
          autoHideDuration={toaster.duration}
          onClose={(event, reason) => handleToastClose(event, reason, toaster.id)}
          TransitionComponent={Slide}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}  
          style={{ marginBottom: `${index * 60}px` }} 
        >
          {toaster.show && validSeverityTypes.includes(toaster.type) ? (
            <Alert
              onClose={() => handleToastClose(null, null, toaster.id)}  // Ensure closure
              severity={toaster.type}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {toaster.message}
            </Alert>
          ) : null}
        </Snackbar>
      ))}
    </Stack>
  );
};
