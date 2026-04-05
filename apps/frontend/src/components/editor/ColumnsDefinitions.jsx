import React from "react";
import {IndeterminateCheckbox} from "./IndeterminateCheckbox"; // Assume you have this component
import EditableCell from "./EditableCell"; // Assume you have this component
import { formatDuration, parseDuration } from "./customEditors";


// Display formatter and value parser if you ever need to remember for the duration field.

export function ResistanceTrainingColumns(updateExerciseData) {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
            "aria-label": "Select all rows",
          }}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
            "aria-label": `Select row ${row.index + 1}`,
          }}
        />
      ),
      size: 40,
    },
    // Editable Data Columns
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit exercise name for row ${info.row.index + 1}`}
        />
      ),
      minSize: 70,
    },
    {
      accessorKey: "sets",
      header: "Number of sets",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="number"
          ariaLabel={`Edit sets for row ${info.row.index + 1}`}
        />
      ),
      size: 70,
    },
    {
      accessorKey: "reps",
      header: "Rep Schema",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit reps for row ${info.row.index + 1}`}
        />
      ),
      size: 120,
    },
    {
      accessorKey: "intensity type",
      header: "Intensity type",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit intensity type for row ${info.row.index + 1}`}
        />
      ),
      size: 70,
    },
    {
      accessorKey: "intensity",
      header: "Intensity Schema",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit intensity for row ${info.row.index + 1}`}
        />
      ),
      size: 120,
    },
  ];
}

export function DurationTrainingColumns(updateExerciseData) {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
            "aria-label": "Select all rows",
          }}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
            "aria-label": `Select row ${row.index + 1}`,
          }}
        />
      ),
      size: 40,
    },
    // Editable Data Columns
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit exercise name for row ${info.row.index + 1}`}
        />
      ),
      minSize: 70,
    },
    {
      accessorKey: "duration",
      header: "Duration Schema",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit sets for row ${info.row.index + 1}`}
        />
      ),
      size: 70,
    },
    {
      accessorKey: "reps",
      header: "Rep Schema",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit reps for row ${info.row.index + 1}`}
        />
      ),
      size: 120,
    },
    {
      accessorKey: "intensity type",
      header: "Intensity type",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit intensity type for row ${info.row.index + 1}`}
        />
      ),
      size: 70,
    },
    {
      accessorKey: "intensity",
      header: "Intensity Schema",
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateExerciseData}
          dataType="exercise"
          inputType="text"
          ariaLabel={`Edit intensity for row ${info.row.index + 1}`}
        />
      ),
      size: 120,
    },
  ];
}
