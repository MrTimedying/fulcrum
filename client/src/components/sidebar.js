import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import the Link component

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
    <div className="w-1/5 bg-slate-900 p-4 h-full">
      <h2 className="text-rose-800 text-4xl font-cursive">Patients List</h2>
      <ul>
        {clientList.map((client) => (
          <li key={client.ID} className="text-white">
            {/* Create a Link for each patient */}
            <Link to={`/patients/${client.ID}`}>
              {client.Name} {client.Surname}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* function Sidebar() {
  const [message, setMessage] = useState(""); // State to store the test message

  useEffect(() => {
    api.get('/test')
      .then(function (response) {
        setMessage(response.data.message);
        console.log(response.data); // Log the data immediately after setting it
      })
      .catch(function (error) {
        // Handle error
        console.log(error);
      });
  }, []);

  return (
    <div className="w-1/5 bg-slate-900 p-4 h-full"> 
      <h2>Test Message</h2>
      <p>{message}</p>
    </div>
  );
} */



export default Sidebar;