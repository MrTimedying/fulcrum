import React from "react";
import { Snackbar, IconButton, Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEditorContext } from "./editorContext";

export const Toaster = () => {
  const {toastPayload, toastIsOpen, setToastIsOpen} = useEditorContext();  
  
  

  const handleToastClose = (reason) => {
    if (reason === "clickaway") {
        return;
    }
    setToastIsOpen(false);
  }




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
      open={toastIsOpen}
      autoHideDuration={3000}
      onClose={handleToastClose}
      message={toastPayload.message}
      action={action}
      TransitionComponent={Slide}
    />
  );
};
