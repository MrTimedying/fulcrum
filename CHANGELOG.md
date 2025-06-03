# Changelog - Fulcrum App

## 1.1.0 - [Current Date]

### Features

#### Layouting Improvements:
- Enhanced vertical stacking of nodes by order in `stackSessionNodes`.
- Added horizontal stacking of nodes by order in `hybridLayout` for LR direction.

#### Profile Enhancements:
- Implemented the ICF sets and ICF modal composer in the Profile section.

#### Bulk Edit Modal:
- Implemented the Bulk Node Data Modal with editable properties filtered per node type (excluding ID, color, order).
- Integrated a tag system using Material UI components and validation.

### Fixes

#### UI/UX Fixes:
- Disabled/greyed out the ICF Templater button in the Editor tab with an appropriate tooltip.

## 1.0.1 - 2025-05-30

### Features

#### ICFSetsModal Improvements:
- Refactored ICFSetsModal component for better state management
- Moved selection controls to footer for better UX
- Improved field buttons visibility and interaction

### Fixes
- Fixed reference errors in ICFSetsModal component
- Resolved issues with record selection and set creation
- Improved error handling for single-element set prevention
- Fixed state management between parent and child components

## 1.0.0 - 2025-05-19

### Features

#### Nodes Styling:
- Adjusted the menu opening logic.
- Added feature to change color in Profile Nodes.

#### ExerciseModal Enhancements:
- Added checkboxes for single or multiple selection in containers.
- Implemented quick assignment of values to multiple fields across selected containers.

#### Value Assignment Across Trees:
- Implemented quick selection and value assignment across exercises from a specific vertical.
- Added handling for numerical values, including setting values, increment/decrement, array values, and total count display.

#### ORDER Feature:
- Implemented the ORDER feature for relative node positioning.
- Nodes are assigned the last order number upon connection to a parent.
- Disconnecting and reconnecting from a parent readjusts the order without affecting children.

### Fixes

#### Np Form Styling:
- Adjusted the styling, icons, and appearance of the options menu in the sidebar.
- Ensured the new patient form resets after submission.
- Updated Formik warnings to use the Toaster.
- Fixed the close button error in the new patient form.

#### Modal Graphics:
- Updated the graphics for the Test modal.
- Updated the graphics for the Template modal.

- Fixed the duration validation schema and input in `ExerciseModal.jsx`.
- Fixed exercise templates in `ExerciseModal` not being persistent state.
- Fixed the NpForm modal taking the data of the currently selected patient when creating a new patient.

## 0.12.0 - 24/05/2025

### Features

#### Data Analysis Layer:
- Implemented comprehensive data analysis visualization components for different node types
- Added support for visualizing exercise data at Session, Micro, Phase, and Intervention levels
- Implemented bar charts for comparing exercise volumes and tag-based filtering
- Added pie charts for visualizing exercise distribution by tags
- Implemented data parsing for variant exercise parameters (reps, duration, intensity)

#### Nodes Styling:
- Added feature to change color in Profile Nodes

### Fixes
- Fixed the interactivity button not working with the standard Controls native component
- Fixed layout size and icons

## 0.11.0 - 19/05/2025

### Features

#### Exercise Editor Improvements:
- Upgraded the exercise editor to template exercises (without data)
- Adjusted the layout of the inner dropdown
- Added functionality to delete exercise templates
- Made the dropdown more informative

#### Layout Improvements:
- Implemented the layouting feature for creating the most stacked possible positioning
- Implemented split pane vision for the sidebar and mainbody

### Fixes
- Fixed the issue with pasteNodesEdges logic not populating contextualMemory correctly
- Fixed the paste functionality for CTRL-V key combination
- Removed copy-paste functionality for Intervention nodes
- Improved the UI sidebar and mainbody colors and dimensions
- Fixed the appearance of the DateModal

## 0.10.0 - 17/05/2025

### Features

#### Menu and Controls Overhaul:
- Massive overhaul of the menu and contextual controls
- Changed the appearance of Profile and Editor tabs
- Implemented a custom component to replace the React Flow Controls menu
- Added base functionalities from the original controls
- Transported all contextual actions (templater, date, etc.) into a compact menu in Controls

### Fixes
- Fixed the interactivity button not working with the standard Controls native component, now it works with the custom implementation;
- Fixed layout size and icons;

## 0.9.1 - 14/05/2025

### Features

#### Layouting features:
- Changed Dagree for Elkjs and added more vertical space and more order;

### Fixes

- Templating menu now can be opened even without a node being selected, the save feature is just disabled;
- Fixed the bug of "undo" reverting eventually to an empty state;
- Better handling of the position of the paste functionality in the React flow diagram;

## 0.9.0 - 11/05/2025

### Features

#### Layouting features:

- Two buttons for horizontal and vertical layouting just implemented;

#### Functionalities:

- Completely overhauled the logic for exercises annotation, not using a table/data grid anymore;
- Input fields are now composible and are opinionated;
- The name of the field is standard, but the name of the exercise container is modifiable;
- Each field has it's own validation schema;

- Added the tag field in the exercise annotation editor;


### Fixes

- Nodes have titles that are clearly visible;
- Search bar now is working again after the overhaul of the patient data form;
- Visually adjusted the menu in the sidebar, which is now consistent visually at different resolutions;
- Fixed the side effect in the exercise annotation editor;

## 0.8.0 - 25/04/2025

### Features

#### CRUD operations:
- Inserted copy/paste operations for single nodes;
- Inserted keyboard shortcuts CTRL + C, V, Z, X;
- Created undo/redo operation for at least 10 attempts;

### Fixes
- Removed names from Micro, Phases and Sessions in the layout;
- Made the three placeholder nodes in Profile not inspectable;
- Adjusted the Test Schedule Modal to update node data;
- Added a textual score field to the Test Schedule Modal;
- Adjusted the analysis part of the templater before saving;
- Fixed the intensity placeholder in the exercise table being textual when the cell is number type;
- Clarified the rational of the test category property in the test scheduling module;
- Ensured Intervention menu tool works even without a node selected;
- Cleaned the date prop for Session nodes when nodes and edges are refactored in copy/paste;

## 0.7.0 - 21/04/2025

### Features

#### Test Data Handling:
- Added a separate modal for Test data in the Session Node;
- Implemented a contextual menu for modal opening;
- Addressed how the intensity field should be handled;

### Fixes
- Adjusted node data appearance in the composer, made them editable and removed id from visible columns;
- Fixed caret not visible (styling issue);
- Switched from react-tabulator to Tanstack table;
- Fixed cells in the table not being editable;
- Fixed exercises editor generating 1 random row (optional);
- Adjusted Profile base data handling: profile node is not editable, editing is done during patient creation or data is inherited;
- Ensured every cell starts with a base value to prevent controlled/uncontrolled bug;
- Fixed excessive zoom in when creating the first Editor node;
- Adjusted the Editor part of the cell data overhaul;

## 0.6.0 - 18/04/2025

### Features

#### Selection and CRUD:
- Implemented multiple selection tool;
- Disabled tools when multiple nodes are selected;
- Implemented CRUD operations on multiple selection;
- Created the selection menu;
- Updated the PaneMenu to handle Paste selection method when cached multiple selection is populated;
- Added a command to clear/dump selection;
- Implemented zoom in with right click on a node to open a modal with content;
- Allowed output of specific or exclusion of specific props in the inspector;
- Put the inspector also in the Profile side;
- Added actual nodes in the Profile for each dimension;

#### Composer and Templating:
- Separated the logic of different Composer versions based on the node;
- Decided if Templater makes sense or if templating from selection with simplified logic should be allowed;

### Fixes
- Calendar tool can only be opened if it is a session node;
- Session node is now templatable;
- Fixed the React Flow component having a top margin and being skewed;
- Made the viewport more zoomable;
- Fixed the paste option from multiselection tool offsetting too much;
- Content in the nodes is now hidden if overflown;

## 0.5.0 - 14/04/2025

### Features

#### Templating and Calendar:
- Implemented templating function for nodes (single and parent nodes);
- Limited templating feature to editor and only to Phases and Microcycles;
- Ensured templating functionalities do not bypass other editor limitations;
- Implemented Calendar feature to select and attach date to selected node;
- Ensured Templater empties or deletes the date prop for templated nodes;

### Fixes
- Save/Load intervention button now fires warning when Profile node is selected;
- Closing the app now triggers a save state for the specific patient/tab;
- Solved same key issue in templater and potentially same id for nodes and edges;
- Fixed load offsetting the position of nodes and edges to prevent complete overlap;

## 0.4.0 - 09/04/2025

### Features

- Implemented multiple interventions per patients with save and load functionalities;

### Fixes
- Fixed the "blocked aria hidden" bug;
- Fixed the error "React modal cannot register modal instance that is already open";
- Fixed the Composer not updating the nodes right away by moving editing state logic to Zustand store;
- Adjusted placeholder nodes for the profile so they cannot be opened in the composer;
- Prevented opening the composer without a node selected;
- Fixed phases rows not being modifiable and throwing errors;
- Reset the selected node Id when switching tabs or patients;
- Removed the selectedNodeId logic as it's obsolete with Zustand;
- Removed selectedNodeId from the Profile Editor;
- Fixed the layout of the composer adjusting to the Tabulator width;
- Fixed dragging a node also selecting it but not acting as selected;
- Ensured default tab is Profile when switching patients/tabs;
- Fixed trailing for node to involve column layout of the Composer;

## 0.3.0 - 03/04/2025

### Features

#### Profile Tab Overhaul:
- Changed the Profile Tab into a React Flow and completely overhauled its logic;
- Allowed multiple test nodes;
- Allowed multiple entries for each of the various dimensions;
- Added a contextual menu to the Pane of the Profile;
- Contextual menu can initialize the Profile (creates profile node with child nodes);
- Contextual menu can add test nodes;

#### Quality of Life:
- Added possibility to edit the exercise prop of the Session node;
- Implemented conditional Tabulators in Composer based on the presence of the "exercise prop";
- Added a button to put multiple rows in;
- Added the datepicker to the Session node;
- Shared dates among all datepickers;
- Divided concerns for the flowStore depending on tab selection and patientID;
- Adjusted distribution of state logic between a persistentStore and flowStore;

### Fixes
- Adjusted the exercise prop in the Session node to be passed as a nested data object prop;
- Fixed the delete patient and edit patient buttons in the Np Form;
- Ensured editorState and profileState are initialized at switchTab and switchPatient and cleared at unmounting;
- Put profileStates and editorStates inside the persistentStore, with saving logic in flowStore;
- Ensured initialization and deletion of states are handled in persistentStore;

## 0.2.0 - 29/05/2024

### Version Updates

- Completely switched from Redux Toolkit to Zustand;
- Created a tab interface for patient data;
- Switched from CRA to Vite as a comprehensive framework;

### Patches Updates

- Fixed Patternizer in Micro Editor not showing days of single microcycle when intervention is loaded;

### Tweaks and fixes

- Ensured calendar always shows the current day date;
- Fixed funky query in the sidebar search;

## 0.1.0 - 09/12/2023

### Version Updates

- Implemented a state peeker for the patternizer in Editor/MicroEditor;
- Changed how patterns for wod days are implemented to have a different pattern for EACH microcycle in Editor/MicroEditor/Patternizer;
- Ensured a toast popup notification appears whenever a contextual action button or state data is created in Editor;

### Patches Updates

- Fixed the timeline composer purging the list each time it commits the string;
- Implemented a default pattern in the patternizer in Editor/MicroEditor;
- Fixed the Reset button throwing an error in Editor/InterventionEditor;
- Ensured submitting over already submitted data overwrites existing data in Editor;
- Fixed data duplication when an intervention is saved with the same name in Editor;

### Tweaks and fixes

- Prevented weeks of the intervention from going below 0;
- Ensured Composer can open only if the MicroData state variable is not null or undefined;
- Adjusted the style of the containers of the various sub editors to display the embellishment like the sidebar in Editor/Style;
- Fixed the Commit String button being slightly offset by the "Name" field warning in Editor/WodEditor/Composer;
- Vastly adjusted the height of the calendar;
- Adjusted the contextual buttons "Today/Back/Next" in Calendar to remove white background property after selection;
- Removed the wod days input in Editor/microEditor/Patternizer as it is assumed by the day pattern;