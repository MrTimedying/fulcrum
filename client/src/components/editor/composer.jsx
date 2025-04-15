import React, { useState, useEffect } from "react";
import { ReactTabulator } from "react-tabulator";
import "tabulator-tables/dist/css/tabulator.min.css";
import useFlowStore from "../../state/flowState";
import { Close } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import Modal from "react-modal";
import { Rnd } from "react-rnd";

export const Composer = ({isComposerOpen, setIsComposerOpen}) => {
  const {
    columnsLayout,
    nodes,
    addExercise,
    updateNodeData,
    updateExerciseData,
    deleteExercises,
  } = useFlowStore();
  const [selectedRows, setSelectedRows] = useState([]);
  const selectedNode = nodes.find((node) => node.selected);

  // Create COPIES of the data, not references
  const rowsData = selectedNode ? [{ ...selectedNode.data }] : [];
  const exercisesData = selectedNode?.data.exercises
    ? selectedNode.data.exercises.map((exercise) => ({ ...exercise }))
    : [];

  // Handler for main node data edits
  const handleNodeDataEdit = (cell) => {
    console.log("Node data edit handler called!");
    const field = cell.getField();
    const value = cell.getValue();

    // THIS is now critical - we must update our state through proper channels
    updateNodeData(field, value);
  };

  // Handler for exercise data edits
  const handleExerciseDataEdit = (cell) => {
    console.log("Exercise data edit handler called!");
    const field = cell.getField();
    const value = cell.getValue();
    const rowData = cell.getData();

    // Critical to use our state update function
    updateExerciseData(rowData.id, field, value);
  };

  // Handle row selection for exercise table
  const handleRowSelected = (row) => {
    const rowData = row.getData();
    setSelectedRows((prev) => [...prev, rowData]);
  };

  // Handle row deselection for exercise table
  const handleRowDeselected = (row) => {
    const rowData = row.getData();
    setSelectedRows((prev) =>
      prev.filter((selected) => selected.id !== rowData.id)
    );
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    const selectedExerciseIds = selectedRows.map((row) => row.id);
    deleteExercises(selectedExerciseIds);
    setSelectedRows([]);
  };

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

  const modalStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 1000,
    },
    content: {
      background: "transparent",
      border: "none",
      padding: 0,
      inset: 0,
      overflow: "hidden",
    },
  };

  const defaultModalConfig = {
    width: 800,
    height: 600,
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 300,
  };

  return (
    <Modal
      isOpen={isComposerOpen}
      onRequestClose={() => setIsComposerOpen(false)}
      style={modalStyles}
      contentLabel="Composer Modal"
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={400}
        minHeight={300}
        bounds="window"
        dragHandleClassName="modal-handle"
      >
        <div className="w-full h-full bg-zinc-900 rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* Modal Header - Drag Handle */}
          <div className="modal-handle bg-zinc-800 px-4 py-3 flex justify-between items-center cursor-move">
            <h3 className="text-gray-200 font-medium">Composer</h3>
            <button
              onClick={() => setIsComposerOpen(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <Close />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex flex-col h-screen p-4 bg-zinc-900 text-white">
              <div
                className="flex-grow"
                style={{ height: "calc(100vh - 100px)", background: "#2D2D2D" }}
              >
                {/* Main Tabulator - now with proper data management */}
                <ReactTabulator
                  data={rowsData}
                  columns={columnsLayout}
                  layout="fitData"
                  events={{
                    cellEdited: handleNodeDataEdit,
                  }}
                  options={{
                    // IMPORTANT: This prevents Tabulator from automatically mutating your data
                    dataTree: false,
                    reactiveData: false,

                    // You can also add this to completely disable direct data mutation
                    // (but then your updateNodeData must manually refresh the table)
                    // mutability: false,
                  }}
                />

                <hr className="my-4 border-gray-700" />

                {/* Conditional Tabulator for 'session' nodes */}
                {selectedNode?.type === "session" && (
                  <>
                    <div className="flex justify-between mb-4">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        onClick={addExercise}
                      >
                        Add Exercise
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        onClick={handleDeleteClick}
                        disabled={selectedRows.length === 0}
                      >
                        Delete Selected Exercises
                      </button>
                    </div>
                    <ReactTabulator
                      data={exercisesData}
                      columns={exercisesColumns}
                      layout="fitData"
                      selectableRows={true}
                      events={{
                        rowSelected: handleRowSelected,
                        rowDeselected: handleRowDeselected,
                        cellEdited: handleExerciseDataEdit,
                      }}
                      options={{
                        history: true,
                        tooltips: true,
                        cellEditable: true,
                        // Prevent automatic data mutation
                        dataTree: false,
                        reactiveData: false,

                        // You can also add this to completely disable direct data mutation
                        // mutability: false,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Rnd>
    </Modal>
  );
};

export default Composer;
