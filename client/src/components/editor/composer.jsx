import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import EditableCell from "./EditableCell"; // Import updated EditableCell
import useFlowStore from "../../state/flowState";
import { Close } from "@mui/icons-material";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
 // Import both format and parse

// --- IndeterminateCheckbox component remains the same ---


export const Composer = ({ isComposerOpen, setIsComposerOpen }) => {
  const {
    columnsLayout,
    nodes,
    addExercise,
    updateNodeData,
    updateExerciseData,
    deleteExercises,
  } = useFlowStore();

  const [rowSelection, setRowSelection] = useState({});
  const selectedNode = nodes.find((node) => node.selected);

  // --- Data Preparation (remains the same) ---
  const nodeDetailsData = useMemo(
    () => (selectedNode ? [{ ...selectedNode.data }] : []),
    [selectedNode]
  );
  // const exercisesData = useMemo(
  //   () =>
  //     selectedNode?.data.exercises
  //       ? selectedNode.data.exercises.map((exercise) => ({ ...exercise }))
  //       : [],
  //   [selectedNode?.data?.exercises]
  // );

  // --- Delete Handler (remains the same) ---
   const handleDeleteClick = () => {
     const selectedRowsData = exercisesTable
       .getSelectedRowModel()
       .rows.map((row) => row.original);
     if (selectedRowsData.length > 0) {
       const selectedExerciseIds = selectedRowsData.map((row) => row.id);
       deleteExercises(selectedExerciseIds);
       setRowSelection({});
     } else {
       console.log("No rows selected for deletion.");
     }
   };

  // --- TanStack Column Definitions ---

  // --- Node Details Columns ---
  const nodeDetailsColumns = useMemo(() => {
    if (!Array.isArray(columnsLayout)) {
        console.warn("columnsLayout is not an array:", columnsLayout);
        return [];
    }
    return columnsLayout.map(col => {
        if (!col || typeof col !== 'object' || (!col.accessorKey && !col.id) || typeof col.header === 'undefined') {
            console.warn("Skipping invalid structure for TanStack column in columnsLayout:", col);
            return null;
        }
        const isEditable = ['label', 'description'].includes(col.accessorKey || col.id);
        // Determine input type for node details (likely 'text')
        const nodeInputType = 'text'; // Assuming label and description are text

        return {
            ...col,
            id: col.id || String(col.accessorKey),
            accessorKey: col.accessorKey || col.id,
            cell: isEditable
                ? (info) => (
                    <EditableCell
                        initialValue={info.getValue()}
                        rowId={selectedNode.id}
                        columnId={info.column.id}
                        updateDataFunction={updateNodeData}
                        dataType="node"
                        inputType={nodeInputType} // Pass input type
                        // No special parser needed for simple text node details
                    />
                  )
                : col.cell || (info => String(info.getValue() ?? '')),
            size: typeof col.size === 'number' ? col.size : undefined,
        };
    }).filter(Boolean);
  }, [columnsLayout, selectedNode?.id, updateNodeData]);


  // --- Exercises Columns ---



  // --- TanStack Table Instances (remain the same) ---
   const nodeDetailsTable = useReactTable({
     data: nodeDetailsData,
     columns: nodeDetailsColumns,
     getCoreRowModel: getCoreRowModel(),
   });



  // --- Default Modal Config (remains the same) ---
  const defaultModalConfig = {
    width: 800,
    height: 600,
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 400 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 - 300 : 0,
  };

  // --- Render Table Function (remains the same) ---
   const renderTable = (
     tableInstance,
     placeholderText = "No data available."
   ) => (
     <div className="overflow-x-auto">
       <table className="w-full text-sm text-left text-gray-300 border-collapse">
         <thead className="text-xs text-gray-400 uppercase bg-zinc-800 sticky top-0 z-10">
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

  // --- Component Render (remains the same) ---
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
                Composer {selectedNode ? `- ${selectedNode.data?.label || "Edit Node"}` : ""}
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
              {/* Node Details Table */}
              {selectedNode && nodeDetailsColumns.length > 0 ? (
                renderTable(nodeDetailsTable, "Node details not available.")
              ) : !selectedNode ? (
                <p className="text-gray-500 text-center py-10">
                  Select a node to see details.
                </p>
              ) : null}


           </div> {/* End Content Area */}
         </div> {/* End Outer container */}
       </Rnd>
     </Modal>
   );
};

export default Composer;
