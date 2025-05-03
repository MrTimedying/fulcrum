import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import the Link component
import MyDropdown from "./menu";
import useFlowStore from "../state/flowState.js";

function Sidebar() {
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

  return (
    <div
      className="w-1/5 bg-neutral-800 py-4 h-full min-w-80"
      style={{ borderRight: "solid 1px rgb(53 51 51)" }}
    >
      <div className="flex flex-row flex-wrap items-center pb-2">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleListParsing}
          className="rounded-full bg-zinc-900 text-gray-200"
          style={{ minWidth: "150px", paddingLeft: "15px", margin: "5px" }}
        />
        <MyDropdown
          formData={formData}
          setFormData={setFormData}
          setFetchingSwitch={setFetchingSwitch}
        />
      </div>
      <div className="flex flex-col h-5/6">
        <h2
          className="text-slate-300 bg-zinc-900 pl-2 font-bold font-sans text-base py-2"
          style={{ borderBottom: "solid 1px #1c1c1c" }}
        >
          Patients List
        </h2>
        <ul
          className="bg-zinc-900 py-3 rounded-lg mt-2 mx-2 h-full"
          style={{ borderBottom: "solid 2px rgb(53 51 51)" }}
        >
          {(query ? filteredClientList : Object.entries(clientList)).map(
            ([key, value]) => (
              <li
                key={key}
                className={`${
                  patientId === key
                    ? "text-stone-200 px-2 h-5 text-xs bg-zinc-600 hover:bg-slate-500 "
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
    </div>
  );
}

export default Sidebar;
