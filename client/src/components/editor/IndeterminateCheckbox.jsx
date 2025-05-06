import React from "react";

export function IndeterminateCheckbox({ indeterminate, className = "", ...rest }) {
    const ref = React.useRef(null);
  
    React.useEffect(() => {
      if (typeof indeterminate === "boolean" && ref.current) {
        ref.current.indeterminate = !rest.checked && indeterminate;
      }
    }, [ref, indeterminate, rest.checked]);
  
    return (
      <input
        type="checkbox"
        ref={ref}
        className={className + " cursor-pointer"}
        {...rest}
      />
    );
  }
  