export const ProfileTemplates = {
  profile: [
    {
      id: "id", // Explicit ID
      accessorKey: "id",
      header: "ID",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "name", // Explicit ID
      accessorKey: "name",
      header: "Name",
      size: 150,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "surname", // Explicit ID
      accessorKey: "surname",
      header: "Surname",
      size: 150,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "age", // Explicit ID
      accessorKey: "age",
      header: "Age",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "gender", // Explicit ID
      accessorKey: "gender",
      header: "Gender",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "height", // Explicit ID
      accessorKey: "height",
      header: "Height",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "weight", // Explicit ID
      accessorKey: "weight",
      header: "Weight",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
  ],
  record: [
    {
      id: "type", // Explicit ID
      accessorKey: "type",
      header: "Type",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "code", // Explicit ID
      accessorKey: "code",
      header: "Code",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "description", // Explicit ID
      accessorKey: "description",
      header: "Description",
      size: 200,
      cell: info => String(info.getValue() ?? ''),
    },
  ]
};


export const EditorTemplates = {
  intervention: [
    {
      id: "id", // Explicit ID
      accessorKey: "id",
      header: "ID",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "name", // Explicit ID
      accessorKey: "name",
      header: "Name",
      size: 150,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "type", // Explicit ID
      accessorKey: "type",
      header: "Type",
      size: 150,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "description", // Explicit ID
      accessorKey: "description",
      header: "Description",
      size: 200,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "global", // Explicit ID
      accessorKey: "global",
      header: "Global",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "service", // Explicit ID
      accessorKey: "service",
      header: "Service",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
  ],
  phase: [
    {
      id: "id", // Explicit ID
      accessorKey: "id",
      header: "ID",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "scope", // Explicit ID
      accessorKey: "scope",
      header: "Scope",
      size: 150,
      cell: info => String(info.getValue() ?? ''),
    },
  ],
  micro: [
     {
      id: "id", // Explicit ID
      accessorKey: "id",
      header: "ID",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "scope", // Explicit ID
      accessorKey: "scope",
      header: "Scope",
      size: 150,
      cell: info => String(info.getValue() ?? ''),
    },
  ],
  session: [
     {
      id: "id", // Explicit ID
      accessorKey: "id",
      header: "ID",
      size: 100,
      cell: info => String(info.getValue() ?? ''),
    },
    {
      id: "scope", // Explicit ID
      accessorKey: "scope",
      header: "Scope",
      size: 150,
      cell: info => String(info.getValue() ?? ''),
    },
  ],
};

