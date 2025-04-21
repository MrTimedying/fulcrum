export const ProfileTemplates = {
  profile: [
    { title: "ID", field: "id", width: 100, editor: "textarea" },
    { title: "Name", field: "name", width: 150, editor: "textarea" },
    { title: "Surname", field: "surname", width: 150, editor: "textarea" },
    { title: "Age", field: "age", width: 100, editor: "number" },
    {
      title: "Gender",
      field: "gender",
      width: 100,
      editor: "select",
      editorParams: { options: ["Male", "Female", "Other"] },
    },
    { title: "Height", field: "height", width: 100, editor: "number" },
    { title: "Weight", field: "weight", width: 100, editor: "number" },
  ],
  record: [
    { title: "Type", field: "type", width: 100, editor: "textarea" },
    { title: "Code", field: "code", width: 100, editor: "textarea" },
    { title: "Description", field: "description", width: 200, editor: "textarea" },
  ]
};

export const EditorTemplates = {
  intervention: [
    { title: "ID", field: "id", width: 100, editor: "textarea" },
    { title: "Name", field: "name", width: 150, editor: "textarea" },
    { title: "Type", field: "type", width: 150, editor: "textarea" },
    {
      title: "Description",
      field: "description",
      width: 200,
      editor: "textarea",
    },
    { title: "Global", field: "global", width: 100, editor: "textarea" },
    { title: "Service", field: "service", width: 100, editor: "textarea" },
  ],
  phase: [
    { title: "ID", field: "id", width: 100 },
    { title: "Scope", field: "scope", width: 150, editor: "textarea" },
  ],
  micro: [
    { title: "ID", field: "id", width: 100 },
    { title: "Scope", field: "scope", width: 150, editor: "textarea" },
  ],
  session: [
    { title: "ID", field: "id", width: 100 },
    { title: "Scope", field: "scope", width: 150, editor: "textarea" },
  ],
};
