import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as R from 'ramda';



const CalendarDash = ({events}) => {
  
  // Importing data from the intervention 

  
  let events_array = R.clone(events);

  const locales = {
    "en-US": require("date-fns")
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
  });

  return (
    <div style={{ height: '900px' }}>
      <Calendar
        localizer={localizer}
        events={events_array}
        defaultDate={new Date(2024,1,1)}
        startAccessor={(event) => new Date(event.start)}
        endAccessor={(event) => new Date(event.end)}  
        style={{ margin: '50px' }}
      />
    </div>
  );
};

export default CalendarDash;


