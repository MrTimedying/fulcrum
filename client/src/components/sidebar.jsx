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
  const {patientId, setPatientId, setTrailingPatientId} = useFlowStore();

  const handleListParsing = (event) => {
    const inputValue = event.target.value;
    setQuery(inputValue);
  
    const searchWords = inputValue.toLowerCase().split(' ');
  
    const containsWord = (word, value) => {
      const name = value?.name?.toLowerCase() || '';
      const surname = value?.surname?.toLowerCase() || '';
      return (name + surname).includes(word);
    };    
  
    const filteredList = Object.entries(clientList)
      .filter(([_, value]) => 
        searchWords.every(word => containsWord(word, value)) 
      );

    console.log(clientList); // Inspect the entire client list
    console.log(filteredList);
  
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
    <div className="w-1/5 bg-neutral-800 py-4 h-full min-w-80" style={{borderRight: "solid 1px rgb(53 51 51)"}}>
      <div className="flex flex-row flex-wrap items-center pb-2" >
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleListParsing}
          className="rounded-full bg-zinc-900 text-gray-200"
          style={{minWidth: "150px", paddingLeft: "15px", margin: "5px"}}
        />
        <MyDropdown formData={formData} setFormData={setFormData} setFetchingSwitch={setFetchingSwitch} />
      </div>
      <div className="flex flex-col h-5/6">
        <h2 className="text-slate-300 bg-zinc-900 pl-2 text-m font-mono text-xs py-2" style={{borderBottom: "solid 1px #1c1c1c"}}>Patients List</h2>
        <ul className="bg-zinc-900 p-5 rounded-lg mt-2 mx-2 h-full" style={{borderBottom: "solid 2px rgb(53 51 51)"}}>
          
          {filteredClientList.length === 0 ? 
          Object.entries(clientList).map(([key,value]) => (
            <li key={key} className={` ${patientId === key ? 'text-slate-600 text-s' : 'text-stone-200 text-xs '} `} onClick={() => handleSelection(key)}>
              {/* Create a Link for each patient */}
              <Link to={patientId === key ? '/' : `/patients/${key}`}>
                {value.name} {value.surname}
              </Link>
            </li>
          )) : 
          query !== '' ? (<li>No results found for "{query}"</li>) 
          :
          filteredClientList.map(([key,value]) => (
            <li key={key} className={` ${patientId === key ? 'text-slate-600 text-s' : 'text-stone-200 text-xs '} `} onClick={() => handleSelection(key)}>
              {/* Create a Link for each patient */}
              <Link to={patientId === key ? '/' : `/patients/${key}`}>
                {value.name} {value.surname}
              </Link>
            </li>
          ))  }
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
