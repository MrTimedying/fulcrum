import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import the Link component
import MyDropdown from "./menu";
import {useSelector} from 'react-redux';

function Sidebar({ patientID, setPatientID }) {
  const [clientList, setClientList] = useState([]);
  const [filteredClientList, setFilteredClientList] = useState([]);
  const [query, setQuery] = useState("");
  const [patientSelected, setPatientSelected] = useState('');
  const [fetchingSwitch, setFetchingSwitch] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    Surname: "",
    Age: "",
    Gender: "",
    BMI: "",
    Height: "",
    Weight: "",
    Status: "",
  });
  const patientValues = useSelector(state => state.patients);

  useEffect(() => {

    setClientList(patientValues);
    setFilteredClientList(patientValues);
    setFetchingSwitch(false);
  }, [fetchingSwitch, patientValues]);

  const handleListParsing = (event) => {
    const inputValue = event.target.value;
    setQuery(inputValue);
  
    const searchWords = inputValue.toLowerCase().split(' ');
  
    const filteredList = clientList.filter((client) =>
      searchWords.every((word) =>
        (client.Name.toLowerCase() + client.Surname.toLowerCase()).includes(word)
      )
    );
  
    setFilteredClientList(filteredList);
  };

  const handleSelection = (selectedClient) => {
    const patientID = selectedClient.id;
    setPatientID(patientID); // Core patient slection mechanism.
    console.log(patientID);
    console.log(selectedClient);
    
    setPatientSelected(patientID === patientSelected ? '' : patientID);
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
        <MyDropdown patientID={patientID} setPatientID={setPatientID} formData={formData} setFormData={setFormData} setFetchingSwitch={setFetchingSwitch} />
      </div>
      <div className="flex flex-col h-5/6">
        <h2 className="text-slate-300 bg-zinc-900 pl-2 text-m font-mono text-xs py-2" style={{borderBottom: "solid 1px #1c1c1c"}}>Patients List</h2>
        <ul className="bg-zinc-900 p-5 rounded-lg mt-2 mx-2 h-full" style={{borderBottom: "solid 2px rgb(53 51 51)"}}>
          {filteredClientList.map((client) => (
            <li key={client.id} className={` ${patientSelected === client.id ? 'text-slate-600 text-s' : 'text-stone-200 text-xs '} `} onClick={() => handleSelection(client)}>
              {/* Create a Link for each patient */}
              <Link to={patientSelected === client.id ? '/' : `/patients/${client.id}`}>
                {client.Name} {client.Surname}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
