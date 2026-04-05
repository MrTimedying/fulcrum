import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import EditableCell from "./EditableCell";
import useFlowStore from "../../state/flowState";
import { IndeterminateCheckbox } from "./IndeterminateCheckbox";
import { ResistanceTrainingColumns, DurationTrainingColumns } from "./ColumnsDefinitions";

const SessionEditor = () => {
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

  // Filter for session node specifically if needed, but for now use selectedNode
  const isSessionNode = selectedNode?.type === "session";

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

  const handleDeleteClick = () => {
    const selectedRowsData = exercisesTable
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    if (selectedRowsData.length > 0) {
      const selectedExerciseIds = selectedRowsData.map((row) => row.id);
      deleteExercises(selectedExerciseIds);
      setRowSelection({});
    }
  };

  const nodeDetailsColumns = useMemo(() => {
    if (!Array.isArray(columnsLayout)) return [];
    return columnsLayout.map(col => {
      const isEditable = ['label', 'description', 'scope'].includes(col.accessorKey || col.id);
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
                inputType="text"
              />
            )
          : col.cell || (info => String(info.getValue() ?? '')),
      };
    }).filter(Boolean);
  }, [columnsLayout, selectedNode?.id, updateNodeData]);

  const exercisesColumns = useMemo(() => {
    if (!selectedNode) return [];
    // Basic heuristic for column selection
    return ResistanceTrainingColumns(updateExerciseData);
  }, [selectedNode, updateExerciseData]);

  const nodeDetailsTable = useReactTable({
    data: nodeDetailsData,
    columns: nodeDetailsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const exercisesTable = useReactTable({
    data: exercisesData,
    columns: exercisesColumns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderTable = (tableInstance, placeholderText = "No data available.") => (
    <div className="overflow-x-auto border border-zinc-800 rounded-lg">
      <table className="w-full text-sm text-left text-gray-300 border-collapse">
        <thead className="text-xs text-gray-400 uppercase bg-zinc-800 sticky top-0 z-10">
          {tableInstance.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 border-b border-zinc-700 whitespace-nowrap font-medium"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-zinc-900/50">
          {tableInstance.getRowModel().rows.length > 0 ? (
            tableInstance.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={tableInstance.getAllColumns().length} className="text-center py-12 text-zinc-500 italic">
                {placeholderText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
        <div className="p-4 bg-zinc-800/50 rounded-full">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        </div>
        <p className="text-lg font-medium">No session selected</p>
        <p className="text-sm">Select a session from the sidebar to start editing</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {selectedNode.data?.label || selectedNode.data?.scope || "Unnamed Session"}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Editing session node: {selectedNode.id}</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={addExercise}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
            >
                Add Exercise
            </button>
            <button 
                onClick={handleDeleteClick}
                disabled={Object.keys(rowSelection).length === 0}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-red-900/50 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium transition-colors border border-zinc-700"
            >
                Delete Selected
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Node Details Section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Session Details</h2>
          {renderTable(nodeDetailsTable, "Session details not available.")}
        </section>

        {/* Exercises Section */}
        <section className="flex flex-col h-full min-h-[400px]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">Exercises</h2>
          <div className="flex-1">
            {renderTable(exercisesTable, "No exercises added to this session.")}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SessionEditor;
