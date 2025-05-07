import React from "react";
import { Snackbar, IconButton, Slide, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useTransientStore from "../state/transientState";

export const Toaster = () => {
  const toaster = useTransientStore((state) => state.toaster);
  const setToaster = useTransientStore((state) => state.setToaster);

  const handleToastClose = (reason) => {
    if (reason === "clickaway") return;
    setToaster({ type: "", message: "", show: false });
  };

  // Define valid severity types
  const validSeverityTypes = ["error", "info", "success", "warning"];
  // Check if the current toaster.type is valid for the Alert component
  const isValidSeverity = validSeverityTypes.includes(toaster.type);

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleToastClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      open={toaster.show}
      autoHideDuration={3000}
      onClose={handleToastClose}
      action={action}
      TransitionComponent={Slide}
      className="bl"
    >
      {toaster.show && isValidSeverity ? (
        <Alert
          onClose={handleToastClose} 
          severity={toaster.type} 
          variant="filled" 
          sx={{ width: "100%" }} 
        >
          {toaster.message}
        </Alert>
      ) : null}
    </Snackbar>
  );
};
