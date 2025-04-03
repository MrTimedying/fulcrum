import React, { useEffect, useState } from "react";
import { ReactTabulator } from "react-tabulator";
import "tabulator-tables/dist/css/tabulator.min.css";
import useTransientStore from "../../state/transientState";
import useFlowStore from "../../state/flowState"; // Tabulator CSS

export const Composer = () => {

  const { columnsLayout } = useFlowStore();
  

  const handleCellEdited = (cell) => {
    const updatedData = rowsData.map((row) =>
      row.id === cell.getData().id
        ? { ...row, [cell.getField()]: cell.getValue() }
        : row
    );
    setRowsData(updatedData);
  };

  console.log("Passed Columns to Tabulator:", columnsLayout);

  return (
    <div className="flex flex-col h-screen p-4 bg-zinc-900 text-white">
      <div className="flex-grow" style={{ height: "calc(100vh - 100px)", background: "#27272a" }}>
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
