import React, { useEffect, useState } from "react";
import "./viewer.css";
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

export const Viewer = ({ viewPhase, viewIntervention }) => {
  const [highlightPhase, setHighlightPhase] = useState(false);
  const [highlightIntervention, setHighlightIntervention] = useState(false);

  useEffect(() => {
    setHighlightPhase(true);
    console.log("Phase metadata updated:", viewPhase);

    const timeoutIdPhase = setTimeout(() => {
      setHighlightPhase(false);
    }, 300);

    return () => clearTimeout(timeoutIdPhase);
  }, [viewPhase]);

  useEffect(() => {
    setHighlightIntervention(true);
    console.log("Intervention metadata updated:", viewIntervention);

    const timeoutIdIntervention = setTimeout(() => {
      setHighlightIntervention(false);
    }, 300);

    return () => clearTimeout(timeoutIdIntervention);
  }, [viewIntervention]);

  return (
    <div>
      {viewIntervention && (
        <div className={`viewer ${highlightIntervention ? 'highlight-intervention' : 'downlight-intervention'}`}>
          <h2>Viewing Intervention:</h2>
          <JsonView src={viewIntervention} theme="atom" />
          {/* Render other properties of viewIntervention */}
        </div>
      )}
      {viewPhase && (
        <div className={`viewer ${highlightPhase ? 'highlight-phase' : 'downlight-phase'}`}>
          <h2>Viewing Phase:</h2>
          <JsonView src={viewPhase} theme="atom" />
          {/* Render other properties of viewPhase */}
        </div>
      )}
    </div>
  );
};
