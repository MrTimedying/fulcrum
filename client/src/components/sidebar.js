import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import the Link component
import MyDropdown from "./menu";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

function Sidebar({ patientID, setPatientID }) {
  const [clientList, setClientList] = useState([]);
  const [filteredClientList, setFilteredClientList] = useState([]);
  const [query, setQuery] = useState("");
  const [patientSelected, setPatientSelected] = useState(1);
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

  useEffect(() => {
    api.get('/api/patients')
      .then(function (response) {
        setClientList(response.data);
        setFilteredClientList(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [clientList, filteredClientList]);

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
    const patientID = selectedClient.ID;
    setPatientID(patientID);
    
    setPatientSelected(patientID === patientSelected ? 0 : patientID);
  };
  
  
  

  return (
    <div className="w-1/5 bg-stone-800 border-r-stone-900 border-r-4 p-4 h-full">
      <div className="flex flex-row justify-between">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleListParsing}
        />
        <MyDropdown patientID={patientID} formData={formData} setFormData={setFormData} />
      </div>
      <div className="flex flex-col">
        <h2 className="text-stone-400 mt-5 text-m font-cursive">Patients List</h2>
        <ul>
          {filteredClientList.map((client) => (
            <li key={client.ID} className={` ${patientSelected === client.ID ? 'text-slate-600 text-s' : 'text-stone-200 text-xs '} `} onClick={() => handleSelection(client)}>
              {/* Create a Link for each patient */}
              <Link to={`/patients/${client.ID}`}>
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
