import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import the Link component
import MyDropdown from "./menu";
import useFlowStore from "../state/flowState.js";
import { FiSettings } from "react-icons/fi";
import OptionsModal from "./OptionsModal";

function Sidebar({ handleEditPatient }) {
  // const [clientList, setClientList] = useState([]);
  const [filteredClientList, setFilteredClientList] = useState([]);
  const [query, setQuery] = useState("");
  const [fetchingSwitch, setFetchingSwitch] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    age: "",
    gender: "",
    bmi: "",
    height: "",
    weight: "",
    status: "",
  });
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const clientList = useFlowStore((state) => state.patients);
  const { patientId, setPatientId, setTrailingPatientId } = useFlowStore();

  const handleListParsing = (event) => {
    
    const inputValue = event.target.value;
    setQuery(inputValue);
    const searchWords = inputValue.trim().toLowerCase().split(/\s+/);

    const containsWord = (word, value) => {
      const fullText =
        `${value.name} ${value.surname} ${value.status}`.toLowerCase();
      return fullText.includes(word);
    };

    const filteredList = Object.entries(clientList).filter(([_, value]) =>
      searchWords.every((word) => containsWord(word, value))
    );

    setFilteredClientList(filteredList);
  };

  const handleSelection = (chosenPatient) => {
    if (patientId === chosenPatient) {
      return setPatientId("");
    } else {
      return setPatientId(chosenPatient);
    }
  };

  const toggleOptionsModal = () => {
    setIsOptionsModalOpen(!isOptionsModalOpen);
  };

  return (
    <div
      className="h-full w-full bg-zinc-900 py-4 overflow-auto"
      style={{ borderRight: "solid 1px rgb(53 51 51)" }}
    >
      <div className="flex flex-row place-items-center gap-2">
        
          
          <MyDropdown
            formData={formData}
            setFormData={setFormData}
            setFetchingSwitch={setFetchingSwitch}
            handleEditPatient={handleEditPatient}
          />
        
        <button 
          onClick={toggleOptionsModal}
          className="p-2 rounded-full hover:bg-zinc-800 text-gray-400 hover:text-gray-200 transition-colors"
          title="Settings"
        >
          <FiSettings size={16} />
        </button>
      </div>
      <div className="flex flex-col h-5/6">
      <input
            type="text"
            placeholder="@ Search a patient"
            value={query}
            onChange={handleListParsing}
            className="text-neutral-600 bg-zinc-900 pl-2 font-sans text-base font-thin py-2 focus:outline-none"
          style={{ borderBottom: "solid 1px #1c1c1c" }}
          />
        <ul
          className="bg-zinc-900 py-3 rounded-lg mt-2 h-full overflow-y-auto"
        >
          {(query ? filteredClientList : Object.entries(clientList)).map(
            ([key, value]) => (
              <li
                key={key}
                className={`${
                  patientId === key
                    ? "text-stone-200 px-2 h-5 text-xs bg-zinc-700 bg-opacity-50 transition-all duration-1000 hover:bg-slate-600 "
                    : "text-stone-200 px-2 h-5 text-xs hover:bg-slate-500"
                }`}
                onClick={() => handleSelection(key)}
              >
                <Link to={patientId === key ? "/" : `/patients/${key}`}>
                  {value.name} {value.surname}
                </Link>
              </li>
            )
          )}
          {query && filteredClientList.length === 0 && (
            <li className="text-stone-200">No results found for "{query}"</li>
          )}
        </ul>
      </div>
      
      {/* Options Modal */}
      <OptionsModal 
        isOpen={isOptionsModalOpen} 
        onClose={() => setIsOptionsModalOpen(false)} 
      />
    </div>
  );
}

export default Sidebar;
