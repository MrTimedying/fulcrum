import React from "react";
import { Snackbar, IconButton, Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useTransientStore from "../state/transientState";

export const Toaster = () => {
  const toaster = useTransientStore((state) => state.toaster);
  const setToaster = useTransientStore((state) => state.setToaster);
  
  const handleToastClose = (reason) => {
    if (reason === "clickaway") return;
    setToaster({ type: "", message: "", show: false });
  };
  




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
      message={toaster.message}
      action={action}
      TransitionComponent={Slide}
    />
  );
};
