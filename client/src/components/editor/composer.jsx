import React, {useState} from "react";
import { ReactTabulator } from "react-tabulator";
import "tabulator-tables/dist/css/tabulator.min.css"; // Tabulator styles
import useFlowStore from "../../state/flowState";
import { v4 as uuidv4 } from "uuid";

export const Composer = () => {
  const { columnsLayout, selectedNodeId, nodes, setNodes } = useFlowStore();
  const [selectedRows, setSelectedRows] = useState([]);

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

    if (!selectedNode || !selectedNode.data.exercises) {
      return [];
    }

    return selectedNode.data.exercises; // Returns the exercises array
  })();


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

  // Add new exercise to the selected node
  const handleAddExercise = () => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNodeId.id
          ? {
              ...node,
              data: {
                ...node.data,
                exercises: [
                  ...node.data.exercises,
                  {
                    id: uuidv4(), // Generate a unique ID
                    name: "New Exercise", // Default values
                    duration: "0s",
                    reps: 0,
                    intensity: "low",
                  },
                ],
              },
            }
          : node // Keep other nodes unchanged
      )
    );
  };

  // Delete selected exercises from the selected node
  const handleDeleteExercises = () => {
    const selectedNode = nodes.find((node) => node.id === selectedNodeId.id);

    if (!selectedNode) {
      console.error("Node not found for deletion!");
      return;
    }

    const selectedExerciseIds = selectedRows.map((row) => row.id); 

    // Remove selected exercises from the node
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNodeId.id
          ? {
              ...node,
              data: {
                ...node.data,
                exercises: node.data.exercises.filter(
                  (exercise) => !selectedExerciseIds.includes(exercise.id)
                ),
              },
            }
          : node
      )
    );

    setSelectedRows([]); // Clear selected rows
  };

    // Handle row selection
    const handleRowSelected = (row) => {
      const rowData = row.getData(); // Get the data of the selected row
      setSelectedRows((prev) => [...prev, rowData]); // Add to selected rows
    };
  
    // Handle row deselection
    const handleRowDeselected = (row) => {
      const rowData = row.getData();
      setSelectedRows((prev) =>
        prev.filter((selected) => selected.id !== rowData.id) // Remove deselected row
      );
    };

  console.log("Selected Rows:", selectedRows);
  console.log("Exercises Data:", exercisesData);
  console.log("Selected node exercise data", nodes[selectedNodeId]?.data?.exercises);
  

  // Predefined columns for the exercises table
  const exercisesColumns = [
    {
      formatter: "rowSelection",
      titleFormatter: "rowSelection",
      hozAlign: "center",
      headerSort: false,
    },
    { title: "Exercise ID", field: "id", width: 150 },
    { title: "Exercise Name", field: "name", editor: "input" },
    { title: "Duration", field: "duration", editor: "input" },
    { title: "Repetitions", field: "reps", editor: "number", width: 150 },
    { title: "Intensity", field: "intensity", editor: "input" },
  ];

  return (
    <div className="flex flex-col h-screen p-4 bg-zinc-900 text-white">
      <div
        className="flex-grow"
        style={{ height: "calc(100vh - 100px)", background: "#2D2D2D" }}
      >
        {/* Main Tabulator */}
        <ReactTabulator
          data={rowsData} // Node-level general data
          columns={columnsLayout}
          layout="fitData" // Adjust columns automatically
          cellEdited={handleNodeDataEdit} // Notify cell edits for the `data` property
        />

        <hr className="my-4 border-gray-700" />

        <div className="flex justify-between mb-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleAddExercise}
          >
            Add Exercise
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            onClick={handleDeleteExercises}
          >
            Delete Selected Exercises
          </button>
        </div>

        {/* Conditional Tabulator for 'session' nodes */}
        {selectedNodeId.type === "session" && (
          <ReactTabulator
            data={exercisesData} // Use the exercises array as the data source
            columns={exercisesColumns} // Predefined columns for exercises
            layout="fitData"
            selectableRows={true} // Enable row selection
            cellEdited={handleExerciseDataEdit}
            events={{
              rowSelected: handleRowSelected, // Add row selection event
              rowDeselected: handleRowDeselected, // Add row deselection event
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default Composer;
