import {useEffect, useRef } from 'react';
  

export const useUpdateEffect = (effect, dependencies) => {
    const isFirstMount = useRef(true);
    const prevDeps = useRef(dependencies);
  
    useEffect(() => {
      const isDepsChanged = dependencies.some((dep, i) => dep !== prevDeps.current[i]);
      if (isFirstMount.current || isDepsChanged) {
        if (isFirstMount.current) {
          isFirstMount.current = false;
        } else {
          effect();
        }
        prevDeps.current = dependencies;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies); 
  };