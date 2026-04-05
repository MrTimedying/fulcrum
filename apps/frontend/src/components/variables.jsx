
import { InlineEdit } from "./editor/exercise_modal/InlineEdit";

// Factory function for Profile templates
export const getProfileComposerTemplates = (updateDataFunction) => ({
  profile: [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      size: 150,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("name", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "surname",
      accessorKey: "surname",
      header: "Surname",
      size: 150,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("surname", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "age",
      accessorKey: "age",
      header: "Age",
      size: 100,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("age", parseInt(value, 10) || 0, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "gender",
      accessorKey: "gender",
      header: "Gender",
      size: 100,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("gender", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "height",
      accessorKey: "height",
      header: "Height",
      size: 100,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("height", parseFloat(value) || 0, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "weight",
      accessorKey: "weight",
      header: "Weight",
      size: 100,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("weight", parseFloat(value) || 0, info.row.original.id)}
          displayClassName="text-[11px]"
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
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("type", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "code",
      accessorKey: "code",
      header: "Code",
      size: 100,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("code", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 200,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("description", value, info.row.original.id)}
          displayClassName="text-[11px]"
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
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("name", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "type",
      accessorKey: "type",
      header: "Type",
      size: 150,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("type", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 200,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("description", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "global",
      accessorKey: "global",
      header: "Global",
      size: 100,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("global", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "service",
      accessorKey: "service",
      header: "Service",
      size: 100,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("service", value, info.row.original.id)}
          displayClassName="text-[11px]"
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
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("scope", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 150,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("description", value, info.row.original.id)}
          displayClassName="text-[11px]"
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
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("scope", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 150,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("description", value, info.row.original.id)}
          displayClassName="text-[11px]"
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
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("scope", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Description",
      size: 150,
      cell: (info) => (
        <InlineEdit
          value={info.getValue()}
          onSave={(value) => updateDataFunction("description", value, info.row.original.id)}
          displayClassName="text-[11px]"
        />
      ),
    },
  ],
});
