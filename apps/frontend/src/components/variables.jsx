
import EditableCell from "./editor/EditableCell";

// Factory function for Profile templates
export const getProfileComposerTemplates = (updateDataFunction) => ({
  profile: [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "surname",
      accessorKey: "surname",
      header: "Surname",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "age",
      accessorKey: "age",
      header: "Age",
      size: 100,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="number"
          valueParser={(value) => parseInt(value, 10) || 0} // Parse to integer
        />
      ),
    },
    {
      id: "gender",
      accessorKey: "gender",
      header: "Gender",
      size: 100,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "height",
      accessorKey: "height",
      header: "Height",
      size: 100,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="number"
          valueParser={(value) => parseFloat(value) || 0} // Parse to float
        />
      ),
    },
    {
      id: "weight",
      accessorKey: "weight",
      header: "Weight",
      size: 100,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="number"
          valueParser={(value) => parseFloat(value) || 0} // Parse to float
        />
      ),
    },
  ],
  record: [
    {
      id: "type",
      accessorKey: "type",
      header: "Type",
      size: 100,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "code",
      accessorKey: "code",
      header: "Code",
      size: 100,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 200,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
  ],
});

// Factory function for Editor templates
export const getEditorComposerTemplates = (updateDataFunction) => ({
  intervention: [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "type",
      accessorKey: "type",
      header: "Type",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 200,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "global",
      accessorKey: "global",
      header: "Global",
      size: 100,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "service",
      accessorKey: "service",
      header: "Service",
      size: 100,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
  ],
  phase: [
    {
      id: "scope",
      accessorKey: "scope",
      header: "Scope",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
  ],
  micro: [
    {
      id: "scope",
      accessorKey: "scope",
      header: "Scope",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
  ],
  session: [
    {
      id: "scope",
      accessorKey: "scope",
      header: "Scope",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 150,
      cell: (info) => (
        <EditableCell
          initialValue={info.getValue()}
          rowId={info.row.original.id}
          columnId={info.column.id}
          updateDataFunction={updateDataFunction}
          dataType="node"
          displayFormatter={(value) => String(value ?? '')}
          inputType="text"
          valueParser={(value) => value} // Keep as string
        />
      ),
    },
  ],
});
