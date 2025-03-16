import React, { Fragment, useState } from "react";
import "./custom-calendar-styles.scss";
import { Tab } from "@headlessui/react";
import Editor from "./editor/editor";
import CalendarDash from "./calendar/calendar";
import { EditorContextProvider } from "./editor/editorContext";
import Profile from "./icf-dashboard/profile";
import FormatIndentDecreaseRoundedIcon from '@mui/icons-material/FormatIndentDecreaseRounded';
import FormatIndentIncreaseRoundedIcon from '@mui/icons-material/FormatIndentIncreaseRounded';

function MainBody({ patientID }) {
  /* let { ID } = useParams(); */
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Calendar');
  

  function tabStructure() {
    return (
      <Tab.Group as="div" className="flex flex-col h-full w-full">
        <div className="grid grid-cols-11 h-14 bg-zinc-850 w-full mb-2">
        <div style={{width: "600px"}} className="bg-zinc-900 rounded-full h-12 flex flex-row items-center place-self-center ml-36 col-span-10">
          <Tab.List className="flex mx-auto h-auto text-xs">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  onClick={() => setSelectedTab('Calendar')}
                  className={`rounded-full my-2 ${
                    selected
                      ? "mx-2 bg-sky-950 text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                      : "mx-2 bg-zinc-700 text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                  }`}
                >
                  Calendar
                </button>
              )}
            </Tab>

            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  onClick={() => setSelectedTab('Profile')}
                  className={`rounded-full my-2 ${
                    selected
                      ? "mx-2 bg-sky-950 text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                      : "mx-2 bg-zinc-700 text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                  }`}
                >
                  ICF Profile
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  onClick={() => setSelectedTab('Editor')}
                  className={`rounded-full my-2 ${
                    selected
                      ? "mx-2 bg-sky-950 text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                      : "mx-2 bg-zinc-700 text-gray-300 hover:text-white py-2 px-4 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                  }`}
                >
                  Intervention Editor
                </button>
              )}
            </Tab>
          </Tab.List>
        </div>
{ selectedTab === 'Editor'    ?   <button
                  id="createPhase"
                  className="bg-zinc-900 hover:bg-black/30 text-slate-300 w-16 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  { isExpanded ? < FormatIndentIncreaseRoundedIcon /> : < FormatIndentDecreaseRoundedIcon /> }  
                </button> : null}
                </div> 
        <Tab.Panels className="h-full overflow-y-auto">
          <Tab.Panel key="calendar">
            <CalendarDash patientID={patientID} />
          </Tab.Panel>
          <Tab.Panel key="icfProfile">
            <Profile patientID={patientID} />
          </Tab.Panel>
          <Tab.Panel key="internvetionEditor" className="h-full">
            <Editor patientID={patientID} isExpanded={isExpanded} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    );
  }

  // Check if there's an ID in the URL
  if (patientID) {
    // Fetch patient data and display patient-specific content
    return (
      <div className="w-4/5 bg-neutral-800  p-4 h-full" style={{borderLeft: "solid 2px #1c1c1c"}}>
        <EditorContextProvider>{tabStructure()}</EditorContextProvider>
      </div>
    );
  } else {
    // Display a message when no patient is selected
    return (
      <div className="w-4/5 flex items-center justify-center text-stone-400 bg-neutral-800  p-4 h-full" style={{borderLeft: "solid 2px #1c1c1c"}}>
        Select a patient to view their information.
      </div>
    );
  }
}

export default MainBody;
