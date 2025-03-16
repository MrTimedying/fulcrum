import React from 'react';

const CustomToolbar = (props) => {
  const { onNavigate, label, view, views, onView } = props;

  const goToBack = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const goToCurrent = () => {
    onNavigate('TODAY');
  };

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button onClick={goToBack} className="rbc-btn rbc-btn-back" style={{backgroundColor: '#f345456'}}>
          Back
        </button>
        <button onClick={goToCurrent} className="rbc-btn rbc-btn-today">
          Today
        </button>
        <button onClick={goToNext} className="rbc-btn rbc-btn-next">
          Next
        </button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        {views.map((viewName) => (
          <button
            key={viewName}
            type="button"
            onClick={() => onView(viewName)}
            className={`rbc-btn ${view === viewName ? 'rbc-active' : ''}`}
          >
            {viewName}
          </button>
        ))}
      </span>
    </div>
  );
};

export default CustomToolbar;
