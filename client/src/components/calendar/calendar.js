import React, {useState} from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import CustomEvent from './CustomEvent';
import  DayView  from './DayView';
import BasicMenu from './menu';
import { useEditorContext } from '../editor/editorContext';
import { useUpdateEffect } from './utils';



const CalendarDash = ({patientID}) => {
  const [dayData, setDayData] = useState({});
  // eslint-disable-next-line
  const { events, setEvents } = useEditorContext();

  useUpdateEffect(() => {
    setEvents([]);
  }, [patientID]);

  
  const getEventStyle = (event) => {
    let backgroundColor = '';
    let customClassName = '';

    if (event.interventionName !== undefined) {
      customClassName = 'intervention'
      backgroundColor = '#6c5b7c'; // Intervention color
    } else if (event.phasename !== undefined) {
      customClassName = 'phase'
      backgroundColor = '#c06c84'; // Phase color
    } else if (event.phaseID !== undefined && event.microID !== undefined && event.wodID === undefined) {
      customClassName = 'microcycle'
      backgroundColor = '#f67280'; // Phase and micro with no wod color
    } else if (event.phaseID !== undefined && event.microID !== undefined && event.wodID !== undefined) {
      customClassName = 'wod'
      backgroundColor = '#f8b595'; // Phase, micro, and wod color
    } else {
      backgroundColor = '#ad3171'; // Default color
    }

    return {
      className: customClassName,
      style:  {
        backgroundColor,
        borderRadius: '5px',
        padding: '5px 5px',
        color: 'white',
        border: 'none',
        textAlign: 'left',
        },
      }
    }
  
  
  const title = (events !== null && events.length > 0 ? events.find(event => event.interventionName) : {interventionName: "No Intervention Selected"});
  

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

  const DayViewInjector = (props) => {
    return <DayView {...props} selectedEvent={dayData} />;
 };

 DayViewInjector.title = DayView.title;
 

  return (
    <div className='flex flex-col items-center' style={{ height: '900px' }}>
      <BasicMenu patientID={patientID} />
      <h1 className="justify-self-center text-xl font-mono text-slate-300 h-6">{title.interventionName}</h1>
      <Calendar
        localizer={localizer}
        events={events}
        defaultDate={new Date(2024,1,1)}
        startAccessor={(event) => new Date(event.start)}
        endAccessor={(event) => new Date(event.end)}  
        eventPropGetter={getEventStyle}
        onSelectEvent={(event) => setDayData(event)}
        views={{ month: true, day: DayViewInjector }}
        style={{ margin: '10px', width: '90%', height: '90%' }}
        components={{
          event: CustomEvent
        }}
        
      />
    </div>
  );
};

export default CalendarDash;


