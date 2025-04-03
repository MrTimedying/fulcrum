import React, { useEffect, useState } from "react";
import { ReactTabulator } from "react-tabulator";
import "tabulator-tables/dist/css/tabulator.min.css";
import useTransientStore from "../../state/transientState";
import useFlowStore from "../../state/flowState"; // Tabulator CSS

export const Composer = () => {

  const { data } = useTransientStore();
  const { columnsLayout } = useFlowStore();

  const handleCellEdited = (cell) => {
    const updatedData = data.map((row) =>
      row.id === cell.getData().id
        ? { ...row, [cell.getField()]: cell.getValue() }
        : row
    );
    setData(updatedData);
  };

  console.log("Passed Columns to Tabulator:", columnsLayout);

  return (
    <div className="flex flex-col h-screen p-4 bg-zinc-900 text-white">
      <div className="flex-grow" style={{ height: "calc(100vh - 100px)", background: "#27272a" }}>
        <ReactTabulator
          data={data}
          columns={columnsLayout}
          layout="fitDataFill" // Adjust columns automatically
          cellEdited={handleCellEdited} // Capture edits
        />
      </div>
    </div>
  );
};

export default Composer;
