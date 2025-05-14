# Changelog - Fulcrum App

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