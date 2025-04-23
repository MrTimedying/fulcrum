import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel, // Optional: if you want sorting later
  flexRender,
} from "@tanstack/react-table";

import useFlowStore from "../../state/flowState"; // Keep Zustand store import
import { Close } from "@mui/icons-material";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { formatDuration } from "./customEditors"; // Keep for formatting

// Helper component for Indeterminate Checkbox (for select-all header)
function IndeterminateCheckbox({ indeterminate, className = "", ...rest }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean" && ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
}

export const Composer = ({ isComposerOpen, setIsComposerOpen }) => {
  const {
    columnsLayout, // Comes from Zustand store
    nodes,
    addExercise,
    updateNodeData,
    updateExerciseData,
    deleteExercises,
  } = useFlowStore();

  // Log the raw columnsLayout from the store FIRST
  console.log(
    "Raw columnsLayout from store:",
    JSON.stringify(columnsLayout, null, 2)
  );

  // State for TanStack Table row selection (Exercises Table)
  const [rowSelection, setRowSelection] = useState({});

  const selectedNode = nodes.find((node) => node.selected);

  // --- Data Preparation ---
  const nodeDetailsData = useMemo(
    () => (selectedNode ? [{ ...selectedNode.data }] : []),
    [selectedNode]
  );

  const exercisesData = useMemo(
    () =>
      selectedNode?.data.exercises
        ? selectedNode.data.exercises.map((exercise) => ({ ...exercise }))
        : [],
    [selectedNode?.data?.exercises]
  );

  // Handle delete button click using TanStack Table's selection state
  const handleDeleteClick = () => {
    const selectedRowsData = exercisesTable
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    if (selectedRowsData.length > 0) {
      const selectedExerciseIds = selectedRowsData.map((row) => row.id);
      deleteExercises(selectedExerciseIds);
      setRowSelection({}); // Reset selection state
    } else {
      console.log("No rows selected for deletion.");
    }
  };

  // --- TanStack Column Definitions ---

  // Columns for Node Details table
  // --- TanStack Column Definitions ---

  // Columns for Node Details table
  const nodeDetailsColumns = useMemo(() => {
    // Ensure columnsLayout is an array
    if (!Array.isArray(columnsLayout)) {
        // This warning is okay if columnsLayout isn't ready yet, but it shouldn't persist
        console.warn("columnsLayout provided to Composer is not an array during render:", columnsLayout);
        return [];
    }

    // Map and validate the columns assuming they are already in (or close to) TanStack format
    return columnsLayout.map(col => {
        // Basic validation: Is it an object? Does it have an accessorKey or an id? Does it have a header?
        if (!col || typeof col !== 'object' || (!col.accessorKey && !col.id) || typeof col.header === 'undefined') {
            // Log the specific invalid structure found if it doesn't meet basic TanStack needs
            console.warn("Skipping invalid structure for TanStack column in columnsLayout (expected object with accessorKey/id and header):", col);
            return null; // Skip this invalid column definition
        }

        // The column definition from the store looks usable.
        // Ensure it has a definite 'id'. If not present, derive from accessorKey.
        // Ensure a basic 'cell' renderer exists if one wasn't provided.
        return {
            ...col, // Spread all valid properties from the store object (like size, custom cell renderers)
            id: col.id || String(col.accessorKey), // Ensure 'id' exists and is a string, use accessorKey as fallback
            accessorKey: col.accessorKey || col.id, // Ensure accessorKey exists if possible
            // Provide a default string cell renderer only if none exists on 'col'
            cell: col.cell || (info => String(info.getValue() ?? '')),
            // Ensure size is a number if it exists, otherwise TanStack might complain
            size: typeof col.size === 'number' ? col.size : undefined,
        };
    }).filter(Boolean); // Filter out any null entries from invalid structures

}, [columnsLayout]); // Re-run only if columnsLayout changes

  // Columns for the Exercises table (includes selection)
  const exercisesColumns = useMemo(
    () => [
      // Selection Column - THIS IS THE LIKELY CULPRIT IF nodeDetailsColumns are OK
      {
        id: "select", // Explicit ID is CORRECTLY provided
        header: (
          { table } // NON-STRING HEADER
        ) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
              className:
                "form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out bg-zinc-700 border-zinc-600 focus:ring-blue-500",
            }}
          />
        ),
        cell: (
          { row } // Cell rendering a component is fine
        ) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
              className:
                "form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out bg-zinc-700 border-zinc-600 focus:ring-blue-500",
            }}
          />
        ),
        size: 40,
      },
      // Data Columns - These have string headers, ID will be inferred from accessorKey
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
        minSize: 150,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: (info) => formatDuration(info.getValue()),
        size: 120,
      },
      {
        accessorKey: "sets",
        header: "Sets",
        cell: (info) => info.getValue(),
        size: 70,
      },
      {
        accessorKey: "reps",
        header: "Reps",
        cell: (info) => info.getValue(),
        size: 70,
      },
      {
        accessorKey: "intensity",
        header: "Intensity",
        cell: (info) => info.getValue(),
        size: 100,
      },
    ],
    []
  ); // Definition is static

  // Log the exercisesColumns (will only run once unless dependencies change, which they don't here)
  console.log(
    "Processed exercisesColumns:",
    JSON.stringify(exercisesColumns, null, 2)
  );

  // --- TanStack Table Instances ---

  // Instance for Node Details Table
  const nodeDetailsTable = useReactTable({
    data: nodeDetailsData,
    columns: nodeDetailsColumns, // Uses the processed columns
    getCoreRowModel: getCoreRowModel(),
    // Add other options like sorting if needed
  });

  // Instance for Exercises Table
  const exercisesTable = useReactTable({
    data: exercisesData,
    columns: exercisesColumns, // Uses the statically defined columns
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Optional
  });


  const defaultModalConfig = {
    width: 800,
    height: 600,
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 400 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 - 300 : 0,
  };

  const renderTable = (
    tableInstance,
    placeholderText = "No data available."
  ) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-300 border-collapse">
        <thead className="text-xs text-gray-400 uppercase bg-zinc-800 sticky top-0 z-10">
          {/* ERROR LIKELY HAPPENS AROUND HERE when getHeaderGroups is called */}
          {tableInstance.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-4 py-3 border-b border-zinc-700 whitespace-nowrap"
                  style={{
                    width:
                      header.getSize() !== 150 ? header.getSize() : undefined,
                  }}
                >
                  {/* flexRender handles string or function/component headers */}
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-zinc-900">
          {tableInstance.getRowModel().rows.length > 0 ? (
            tableInstance.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-zinc-800 hover:bg-zinc-700 ${
                  row.getIsSelected?.() ? "bg-zinc-700" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={tableInstance.getAllColumns().length}
                className="text-center py-10 text-gray-500"
              >
                {placeholderText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // --- Component Render ---
  // ... (JSX remains largely the same)
  return (
    <Modal
      isOpen={isComposerOpen}
      onRequestClose={() => setIsComposerOpen(false)}
      aria={{
        labelledby: "intervention-management-title",
        describedby: "intervention-management-description",
      }}
      style={{
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
      }}
    >
      {" "}
      <Rnd
        default={defaultModalConfig}
        minWidth={600}
        minHeight={400}
        bounds="window"
        dragHandleClassName="modal-handle"
      >
        <div className="w-full h-full bg-zinc-900 text-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="modal-handle bg-zinc-800 px-4 py-3 flex justify-between items-center cursor-move flex-shrink-0">
            <h3 className="text-gray-200 font-medium text-lg">
              Composer{" "}
              {selectedNode
                ? `- ${selectedNode.data?.label || "Edit Node"}`
                : ""}
            </h3>
            <button
              onClick={() => setIsComposerOpen(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Close Composer"
            >
              <Close />
            </button>
          </div>
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-900">
            {/* --- Node Details Table --- */}
            {selectedNode && nodeDetailsColumns.length > 0 ? (
              renderTable(nodeDetailsTable, "Node details not available.")
            ) : !selectedNode ? (
              <p className="text-gray-500 text-center py-10">
                Select a node to see details.
              </p>
            ) : null}

            {/* --- Conditional Exercises Section --- */}
            {selectedNode?.type === "session" && (
              <>
                <hr className="border-gray-700" />
                <div className="space-y-4">
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <button
                      className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors shadow"
                      onClick={addExercise}
                    >
                      Add Exercise
                    </button>
                    <button
                      className={`text-sm font-medium py-1.5 px-3 rounded transition-colors shadow ${
                        Object.keys(rowSelection).length === 0
                          ? "bg-red-800 opacity-60 cursor-not-allowed text-gray-300"
                          : "bg-red-600 hover:bg-red-500 text-white"
                      }`}
                      onClick={handleDeleteClick}
                      disabled={Object.keys(rowSelection).length === 0}
                    >
                      Delete Selected ({Object.keys(rowSelection).length})
                    </button>
                  </div>

                  {/* Exercises Table Render */}
                  {/* This is where renderTable gets called for exercisesTable */}
                  {renderTable(
                    exercisesTable,
                    "No exercises yet. Click 'Add Exercise'."
                  )}
                </div>
              </>
            )}

            {/* Informational Message */}
            {selectedNode &&
              selectedNode.type !== "session" &&
              nodeDetailsData.length > 0 && (
                <p className="text-gray-500 text-center py-4">
                  This node type does not have exercises.
                </p>
              )}
          </div>{" "}
          {/* End Content Area */}
        </div>{" "}
        {/* End Outer container */}
      </Rnd>
    </Modal>
  );
};

export default Composer;
