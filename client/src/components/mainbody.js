import React, { Fragment, useState } from "react";
import { useParams } from "react-router-dom";
import "./custom-calendar-styles.scss";
import { Tab } from "@headlessui/react";
import  Editor from "./editor/editor";
import  CalendarDash from "./calendar/calendar";
import { EditorContextProvider } from "./editor/editorContext";
import Profile from "./icf-dashboard/profile";

function MainBody({ patientID }) {
  let { ID } = useParams();

  const [events, setEvents] = useState([]);
  

  

  function tabStructure() {
    return (
      <Tab.Group as="div" className="flex flex-col h-full w-full">
        <div className="bg-gray-800 rounded-t-lg h-30">
          <Tab.List className="flex w-2/3 mx-auto">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={
                    selected
                      ? "text-gray-300 bg-white hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                      : "text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                  }
                >
                  Calendar
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={
                    selected
                      ? "text-gray-300 bg-white hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                      : "text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                  }
                >
                  ICF Profile
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={
                    selected
                      ? "text-gray-300 bg-white hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                      : "text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                  }
                >
                  Intervention Editor
                </button>
              )}
            </Tab>
          </Tab.List>
        </div>
        <Tab.Panels className="h-full overflow-y-hidden">
          <Tab.Panel key="calendar"><CalendarDash patientID={patientID} events={events} /></Tab.Panel>
          <Tab.Panel key="icfProfile"><Profile patientID={patientID} /></Tab.Panel>
          <Tab.Panel key="internvetionEditor" className="h-full"><Editor key={ID} patientID={patientID} setEvents={setEvents} /></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    );
  }

  // Check if there's an ID in the URL
  if (ID) {
    // Fetch patient data and display patient-specific content
    return (
      <div className="w-4/5 bg-stone-800 border-l-2 border-stone-700 p-4 h-full">
        <EditorContextProvider>
          {tabStructure()}
        </EditorContextProvider>
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

