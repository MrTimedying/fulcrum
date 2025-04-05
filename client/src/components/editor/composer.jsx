import React from "react";

import { ReactTabulator } from "react-tabulator";

import "tabulator-tables/dist/css/tabulator.min.css";

import useFlowStore from "../../state/flowState";

export const Composer = () => {
  const { columnsLayout, selectedNodeId, nodes, setNodes } = useFlowStore();

  // Retrieve the data of the selected node
  const rowsData = (() => {
    const selectedNode = nodes.find((node) => node.id === selectedNodeId.id);

    if (!selectedNode) {
      console.error("No node found for the selectedNodeId:", selectedNodeId);
      return [];
    }

    return [selectedNode.data];
  })();

  // Separate data specifically for exercises (if present)
  const exercisesData = (() => {
    const selectedNode = nodes.find((node) => node.id === selectedNodeId.id);

    if (!selectedNode || !selectedNode.exercises) {
      return [];
    }

    return selectedNode.data.exercises; // Returns the exercises array
  })();

  console.log("Rows Data:", rowsData);
  console.log("Exercises Data:", exercisesData);
  console.log("Nodes:", nodes);

  // Handle cell edits for node data
  const handleNodeDataEdit = (cell) => {
    const field = cell.getField();
    const value = cell.getValue();

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNodeId.id
          ? {
              ...node,
              data: { ...node.data, [field]: value }, // Update `data` property immutably
            }
          : node
      )
    );
  };

  // Handle cell edits for exercise data
  const handleExerciseDataEdit = (cell) => {
    const field = cell.getField(); // Get the edited field (e.g., name, reps)
    const value = cell.getValue(); // Get the new value from the cell
    const rowData = cell.getData(); // Get the full row of the cell being edited
  
    // Update the node structure immutably
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNodeId.id
          ? {
              ...node,
              // Update the 'data' object immutably
              data: {
                ...node.data,
                exercises: node.data.exercises.map((exercise) =>
                  exercise.id === rowData.id
                    ? { ...exercise, [field]: value } // Update the specific exercise immutably
                    : exercise
                ),
              },
            }
          : node // Keep other nodes unchanged
      )
    );
  };
  

  // Predefined columns for the exercises table
  const exercisesColumns = [
    { title: "Exercise ID", field: "id" },
    { title: "Exercise Name", field: "name", editor: "input" },
    { title: "Duration", field: "duration", editor: "input" },
    { title: "Repetitions", field: "reps", editor: "number" },
    { title: "Intensity", field: "intensity", editor: "input" },
  ];

  return (
    <div className="flex flex-col h-screen p-4 bg-zinc-900 text-white">
      <div
        className="flex-grow"
        style={{ height: "calc(100vh - 100px)", background: "#27272a" }}
      >
        {/* Main Tabulator */}
        <ReactTabulator
          data={rowsData}
          columns={columnsLayout}
          layout="fitData" // Adjust columns automatically
          cellEdited={handleNodeDataEdit} // Notify cell edits for the `data` property
        />

        {/* Conditional Tabulator for 'session' nodes */}
        {selectedNodeId.type === "session" && (
          <ReactTabulator
            data={exercisesData} // Use the exercises array as the data source
            columns={exercisesColumns} // Predefined columns for exercises
            layout="fitData"
            selectableRows= {true} // Adjust columns automatically
            cellEdited={handleExerciseDataEdit} // Notify cell edits for `exercises` property
          />
        )}
      </div>
    </div>
  );
};

export default Composer;
