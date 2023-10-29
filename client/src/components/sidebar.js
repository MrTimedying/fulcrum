import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import the Link component
import MyDropdown from "./menu";
import MySearchbar from "./searchbar";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

function Sidebar() {
  const [clientList, setClientList] = useState([]);

  useEffect(() => {
    api.get('/api/patients')
      .then(function (response) {
        setClientList(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  return (
    <div className="w-1/5 bg-stone-800 border-r-stone-900 border-r-4 p-4 h-full">
      <div className="flex flex-row justify-between"><MySearchbar /><MyDropdown /></div>
      <div className="flex flex-col"><h2 className="text-stone-400 mt-5 text-m font-cursive">Patients List</h2>
      <ul>
        {clientList.map((client) => (
          <li key={client.ID} className="text-stone-200 text-xs">
            {/* Create a Link for each patient */}
            <Link to={`/patients/${client.ID}`}>
              {client.Name} {client.Surname}
            </Link>
          </li>
        ))}
      </ul></div>
    </div>
  );
}


export default Sidebar;