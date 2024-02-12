import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Composer } from "./composer";
import  Resume  from "./resume";
import Timeline from "./timeline";
import  axios  from "axios";


const api = axios.create({
  baseURL: "http://localhost:8080",
});

const Profile = ({patientID}) => {
  const [bodystructures, setBodyStructures] = useState([]);
  const [activities_participation, setActivitiesParticipation] = useState([]);
  const [environmental_factors, setEnvironmentalFactors] = useState([]);
  const [personal_factors, setPersonalFactors] = useState([]);
  const [isOpenComposer, setIsOpenComposer] =useState(false);
  const [tableData, setTableData] = useState([]);
  const [itemSelected, setItemSelected] = useState([]);
  const [itemEdit, setItemEdit] = useState([]);
  const [cards, setCards] = useState([]);

  console.log("Profile Component Rendered");

  useEffect(() => {
    const fetchingProfileData = () => {
      api.get(`api/profile?name=${patientID}`)
        .then(function (response) {
          const profileData = response.data;
  
          setCards(profileData.timeline);
          setBodyStructures(profileData.body);
          setActivitiesParticipation(profileData.activities);
          setEnvironmentalFactors(profileData.environment);
          setPersonalFactors(profileData.personal);
        })
        .catch(function (error) {
          // Handle the error, e.g., log it or set default values
          console.log(error);
  
          // Set default values or clear the state
          setCards([]);
          setBodyStructures([]);
          setActivitiesParticipation([]);
          setEnvironmentalFactors([]);
          setPersonalFactors([]);
        });
    };
  
    fetchingProfileData();
    // eslint-disable-next-line
  }, [patientID]);


  const updatingProfileData = () => {

    const values = {
      ID: patientID,
      timeline: JSON.stringify(cards),
      body: JSON.stringify(bodystructures),
      activities: JSON.stringify(activities_participation),
      environment: JSON.stringify(environmental_factors),
      personal: JSON.stringify(personal_factors)
    };

    api
    .post("api/profile", values)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });

  };

  const deleteProfile = (ID) => {

    api
    .delete(`api/profile?ID=${ID}`)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    })

  };

  const selectionSetter = (item) => {
    setItemSelected(item.category); 
    setItemEdit(item);
    console.log(itemSelected);
  }; 

  const EditItemHandler = (item) => {
    console.log(item);
    const newRow = item;
    setTableData([...tableData, newRow]);  
    setIsOpenComposer(true);

  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

  console.log('Droppable ID:', result.destination.droppableId);
  console.log('Source Index:', result.source.index);
  console.log('Destination Index:', result.destination.index);

    let updatedItems;

    switch (result.destination.droppableId) {
      case 'bodystructures':
        updatedItems = Array.from(bodystructures);
        break;
      case 'activities_participation':
        updatedItems = Array.from(activities_participation);
        break;
      case 'environmental_factors':
        updatedItems = Array.from(environmental_factors);
        break;
      case 'personal_factors':
        updatedItems = Array.from(personal_factors);
        break;
      default:
        return;
    }

    const [movedItem] = updatedItems.splice(result.source.index, 1);
    updatedItems.splice(result.destination.index, 0, movedItem);

    switch (result.destination.droppableId) {
      case 'bodystructures':
        setBodyStructures(updatedItems);
        break;
      case 'activities_participation':
        setActivitiesParticipation(updatedItems);
        break;
      case 'environmental_factors':
        setEnvironmentalFactors(updatedItems);
        break;
      case 'personal_factors':
        setPersonalFactors(updatedItems);
        break;
      default:
        return;
    }
  };

  return (
    <div className="icf-profile">
      <Resume
        patientID = {patientID} />
      <Timeline cards={cards} setCards={setCards} />
      <Composer
          setBodyStructures={setBodyStructures}
          setActivitiesParticipation={setActivitiesParticipation}
          setEnvironmentalFactors={setEnvironmentalFactors}
          setPersonalFactors={setPersonalFactors}
          isOpenComposer={isOpenComposer}
          setIsOpenComposer={setIsOpenComposer}
          tableData={tableData}
          setTableData={setTableData}
          
        />
        <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={() => EditItemHandler(itemEdit)}>Edit Item</button>
      
      <div className="icf-droppables grid grid-cols-4 gap-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="bodystructures" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="icf-column"
              >
                <h3 className="text-slate-300 font-mono bg-zinc-900 p-2 rounded-t-lg">Body and Structures</h3>
                {bodystructures.map((item, index) => (
                  <Draggable key={item.category} draggableId={item.category} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`icf-item bg-white p-2 mb-2 text-slate-300 font-mono rounded ${itemSelected === item.category? 'bg-zinc-600' : 'bg-zinc-800'}`}
                        onClick={() => selectionSetter(item)}
                      >
                        {item.category} - {item.label} - {item.score}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          </DragDropContext>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="activities_participation" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="icf-column"
              >
                <h3 className="text-slate-300 font-mono bg-zinc-900 p-2 rounded-t-lg">Activities and Participation</h3>
                {activities_participation.map((item, index) => (
                  <Draggable key={item.category} draggableId={item.category} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`icf-item bg-white p-2 mb-2 text-slate-300 font-mono rounded ${itemSelected === item.category? 'bg-zinc-600' : 'bg-zinc-800'}`}
                        onClick={() => selectionSetter(item)}
                      >
                        {item.category} - {item.label} - {item.score}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          </DragDropContext>
        <DragDropContext onDragEnd={onDragEnd}> 
          <Droppable droppableId="environmental_factors" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="icf-column"
              >
                <h3 className="text-slate-300 font-mono bg-zinc-900 p-2 rounded-t-lg">Environmental Factors</h3>
                {environmental_factors.map((item, index) => (
                  <Draggable key={item.category} draggableId={item.category} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`icf-item bg-white p-2 mb-2 text-slate-300 font-mono rounded ${itemSelected === item.category? 'bg-zinc-600' : 'bg-zinc-800'}`}
                        onClick={() => selectionSetter(item)}
                      >
                        {item.category} - {item.label} - {item.score}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          </DragDropContext>
        <DragDropContext onDragEnd={onDragEnd}>  
          <Droppable droppableId="personal_factors" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="icf-column"
                
              >
                <h3 className="text-slate-300 font-mono bg-zinc-900 p-2 rounded-t-lg">Personal Factors</h3>
                {personal_factors.map((item, index) => (
                  <Draggable key={item.category} draggableId={item.category} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`icf-item bg-white p-2 mb-2 text-slate-300 font-mono rounded ${itemSelected === item.category? 'bg-zinc-600' : 'bg-zinc-800'}`}
                        onClick={() => selectionSetter(item)}
                      >
                        {item.category} - {item.label} - {item.score}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          </DragDropContext>
        </div>
        <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={updatingProfileData}>Save Profile</button>
        <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={deleteProfile(patientID)}>Delete Profile</button>
    </div>
  );
};

export default Profile;
