import { useParams } from 'react-router-dom';

function PatientDashboard() {
  let { ID } = useParams(); // Access the patient's ID from the URL

  // Fetch and display data for the patient with the specified ID
  // You can use 'id' to fetch specific patient data

  return (
    <div>just a tryout</div>
  );
}

export default PatientDashboard;