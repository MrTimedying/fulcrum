import React from 'react';
import { useEditorContext } from '../editor/editorContext';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Button } from '@mui/material';
import * as R from 'ramda';
import './Calendar.css';

export default function BasicMenu({patientID}) {

  const { setEvents } = useEditorContext();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const getInterventionsForPatient = createSelector(
    state => state.intervention,
    (_, patientID) => patientID,
    (intervention, patientID) => intervention[patientID] || []
  );

  const interventionList = useSelector(state =>
    getInterventionsForPatient(state, patientID)
  );
  console.log(interventionList);

  function handleInterventionClick (e) {
    const index = e.currentTarget.getAttribute('data-interventionname');
    console.log(index);
    const singleIntervention = interventionList.find(item => item.intervention.interventionName === index);
    console.log(singleIntervention);
    const intervention = [singleIntervention.intervention];
    const phases = singleIntervention.phases;
    const micros = singleIntervention.micros;
    const wods = singleIntervention.wods;

    if (intervention && phases && micros && wods) {
        const events_array = R.pipe(
          R.concat(intervention),
          R.concat(phases),
          R.concat(micros),
          R.concat(wods),
          (arg) => arg.map((event,index) => {return {...event, id: index}})
        )([]);
        
        setEvents(events_array);
      } else {
        setEvents([]);
      }

  }

  return (
    <div className="absolute top-10 right-20">
      <Button
        id="calendar-load"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        Interventions
      </Button>
      <Menu
        id="calendar-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'calendar-load',
        }}
      >
        { interventionList && interventionList.length > 0 ? (interventionList.map((item,index) => 
        
        <MenuItem style={{fontSize:"12px"}} key={index} data-interventionname={item.intervention.interventionName} onClick={handleInterventionClick} >{item.intervention.interventionName}</MenuItem>
        
        )) : (<MenuItem style={{fontSize:"12px"}} disabled>No interventions saved</MenuItem>)}
      </Menu>
    </div>
  );
}