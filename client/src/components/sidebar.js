import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // Your Express.js server's URL
});

function Sidebar() {
  const [clientList, setClientList] = useState([]); // State to store the list of clients

  useEffect(() => {
    // Fetch data from the server when the component mounts
    api.get('/api/endpointdb')
      .then(function (response) {
        // Set the fetched data in the state variable
        setClientList(response.data);
      })
      .catch(function (error) {
        // Handle error
        console.log(error);
      });
  }, []); // The empty dependency array makes this effect run only once on component mount

  return (
    <div className="w-1/5 bg-slate-900 p-4 h-full"> 
      <h2>Clients List</h2>
      <ul>
        {clientList.map((client) => (
          <li key={client.id}>{client.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;