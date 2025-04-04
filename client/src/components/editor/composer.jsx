import React, { useEffect, useState } from "react";
import { ReactTabulator } from "react-tabulator";
import "tabulator-tables/dist/css/tabulator.min.css";

import useTransientStore from "../../state/transientState";
import useFlowStore from "../../state/flowState";

export const Composer = () => {
  const { columnsLayout, selectedNodeId, nodes, setNodes } = useFlowStore();

  // Retrieve the data of the selected node
  const rowsData = (() => {
    // Find the selected node by matching its `id` with `selectedNodeId`
    const selectedNode = nodes.find((node) => node.id === selectedNodeId.id);
  
    // If no node is found, return an empty array
    if (!selectedNode) {
      console.error("No node found for the selectedNodeId:", selectedNodeId);
      return [];
    }
  
    // Transform the `data` object of the selected node into a single-row array
    return [selectedNode.data];
  })();

  console.log("Rows Data:", rowsData);
  console.log("Nodes", nodes);

  // Handle edits in the Tabulator table and update nodes
  const handleCellEdited = (cell) => {
    const updatedData = rowsData.map((row) =>
      row.id === cell.getData().id
        ? { ...row, [cell.getField()]: cell.getValue() } // Update the specific field
        : row
    );

    // Update the specific node's data within Zustand state
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: updatedData } // Update the `data` of the target node
          : node
      )
    );
  };

  console.log("Passed Columns to Tabulator:", columnsLayout);

  return (
    <div className="flex flex-col h-screen p-4 bg-zinc-900 text-white">
      <div
        className="flex-grow"
        style={{ height: "calc(100vh - 100px)", background: "#27272a" }}
      >
        <ReactTabulator
          data={rowsData}
          columns={columnsLayout}
          layout="fitDataFill" // Adjust columns automatically
          cellEdited={handleCellEdited} // Capture edits
        />
      </div>
    </div>
  );
};

export default Composer;
