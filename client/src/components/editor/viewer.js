import React, { useEffect, useState } from "react";
import "./viewer.css";
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';


export const Viewer = React.memo(({ viewWod, viewMicro, viewPhase, viewIntervention }) => {
  const [highlightPhase, setHighlightPhase] = useState(false);
  const [highlightIntervention, setHighlightIntervention] = useState(false);
  const [highlightMicro, setHighlightMicro] = useState(false);
  const [highlightWod, setHighlightWod] = useState(false);

  // useEffect for viewPhase
  useEffect(() => {
    setHighlightPhase(true);
    

    const timeoutIdPhase = setTimeout(() => {
      setHighlightPhase(false);
    }, 300);

    return () => clearTimeout(timeoutIdPhase);
  }, [viewPhase]);

  // useEffect for viewIntervention
  useEffect(() => {
    setHighlightIntervention(true);
    

    const timeoutIdIntervention = setTimeout(() => {
      setHighlightIntervention(false);
    }, 300);

    return () => clearTimeout(timeoutIdIntervention);
  }, [viewIntervention]);

  // useEffect for viewMicro
  useEffect(() => {
    setHighlightMicro(true);
    

    const timeoutIdMicro = setTimeout(() => {
      setHighlightMicro(false);
    }, 300);

    return () => clearTimeout(timeoutIdMicro);
  }, [viewMicro]);

  // useEffect for viewWod
  useEffect(() => {
    setHighlightWod(true);
    

    const timeoutIdWod = setTimeout(() => {
      setHighlightWod(false);
    }, 300);

    return () => clearTimeout(timeoutIdWod);
  }, [viewWod]);

  return (

    <div className="mx-2 ">
      {/* viewIntervention */}
      {viewIntervention && (
        <div className={`viewer ${highlightIntervention ? 'highlight-intervention' : 'downlight-intervention'}`}>
          <h2>Viewing Intervention:</h2>
          <JsonView src={viewIntervention} theme="atom" />
          {/* Render other properties of viewIntervention */}
        </div>
      )}

      {/* viewPhase */}
      {viewPhase && (
        <div className={`viewer ${highlightPhase ? 'highlight-phase' : 'downlight-phase'}`}>
          <h2>Viewing Phase:</h2>
          <JsonView src={viewPhase} theme="atom" />
          {/* Render other properties of viewPhase */}
        </div>
      )}

      {/* viewMicro */}
      {viewMicro && (
        <div className={`viewer ${highlightMicro ? 'highlight-micro' : 'downlight-micro'}`}>
          <h2>Viewing Micro:</h2>
          <JsonView src={viewMicro} theme="atom" />
          {/* Render other properties of viewMicro */}
        </div>
      )}

      {/* viewWod */}
      {viewWod && (
        <div className={`viewer ${highlightWod ? 'highlight-wod' : 'downlight-wod'}`}>
          <h2>Viewing Wod:</h2>
          <JsonView src={viewWod} theme="atom" />
          {/* Render other properties of viewWod */}
        </div>
      )}
    </div>
    
  );
});
