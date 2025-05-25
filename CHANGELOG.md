# Changelog - Fulcrum App

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
- [Various fixes were implemented but specific details not provided in the context]

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