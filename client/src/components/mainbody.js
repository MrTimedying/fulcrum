import React from "react";
import { useParams } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import './custom-calendar-styles.scss';


function MainBody() {
  let { ID } = useParams();
  const localizer = momentLocalizer(moment); // or globalizeLocalizer

  const myEventsList = [
    {
      title: 'Event 1',
      start: new Date(2023, 9, 27, 10, 0),
      end: new Date(2023, 9, 27, 12, 0),
    },
    {
      title: 'Event 2',
      start: new Date(2023, 9, 28, 14, 0),
      end: new Date(2023, 9, 28, 16, 0),
    },
    // Add more events here
  ];

  const MyCalendar = (props) => (
    <div className="full-h">
      <Calendar
        localizer={localizer}
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );

  // Check if there's an ID in the URL
  if (ID) {
    // Fetch patient data and display patient-specific content
    return (
      <div className="w-4/5 bg-stone-800 border-l-2 border-stone-700 p-4 h-full">
        <MyCalendar/>
      </div>
    );
  } else {
    // Display a message when no patient is selected
    return (
      <div className="w-4/5 flex items-center justify-center text-stone-400 bg-stone-800 border-l-2 border-stone-700 p-4 h-full">
        Select a patient to view their information.
      </div>
    );
  }
}

export default MainBody;
