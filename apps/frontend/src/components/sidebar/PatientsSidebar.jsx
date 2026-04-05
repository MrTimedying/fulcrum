import React, { useState } from "react";
import { Link } from "react-router-dom";
import MyDropdown from "../menu";
import { usePatientStore } from "../../state/core/usePatientStore";
import { useNavigationStore } from "../../state/core/useNavigationStore";

const PatientsSidebar = ({ handleEditPatient }) => {
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

  const clientList = usePatientStore((state) => state.patients);
  const { patientId, setPatientId } = useNavigationStore();

  const handleListParsing = (event) => {
    const inputValue = event.target.value;
    setQuery(inputValue);
    const searchWords = inputValue.trim().toLowerCase().split(/\s+/);

    const containsWord = (word, value) => {
      const details = value.details || {};
      const fullText =
        `${details.name || ""} ${details.surname || ""} ${details.status || ""}`.toLowerCase();
      return fullText.includes(word);
    };

    const filteredList = Object.entries(clientList).filter(([_, value]) =>
      searchWords.every((word) => containsWord(word, value))
    );

    setFilteredClientList(filteredList);
  };

  const handleSelection = (chosenPatient) => {
    if (patientId === chosenPatient) {
      setPatientId("");
    } else {
      setPatientId(chosenPatient);
    }
  };

  return (
    <div
      className="h-full w-full bg-zinc-900 py-4 overflow-auto flex flex-col px-1"
    >
      <div className="flex flex-row place-items-center mb-2">
        <MyDropdown
          formData={formData}
          setFormData={setFormData}
          setFetchingSwitch={setFetchingSwitch}
          handleEditPatient={handleEditPatient}
        />
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
                  { (value.details?.name || value.details?.surname) ? `${value.details?.name} ${value.details?.surname}` : 'New Patient' }
                </Link>
              </li>
            )
          )}
          {query && filteredClientList.length === 0 && (
            <li className="text-stone-200 px-2 text-xs">No results found for "{query}"</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PatientsSidebar;
