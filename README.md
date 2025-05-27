# Fulcrum Version 0.12.0-alpha

[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

Fulcrum is a management software designed for movement science experts. It enables the creation of detailed patient profiles with anamnestic, sociodemographical, and ICF-related data. Users can create various types of interventions (educational, rehabilitative, sportive) and visualize both profiles and interventions using interactive flow diagrams. A key feature is the comprehensive data analysis layer, providing visualizations and insights into exercise data across different periodization levels (Session, Micro, Phase, Intervention).

### What it does

1. Creation of a person's profile, including anamnestic informations, sociodemographical details and several ICF related data;
2. Creation of interventions that range from educational, rehabilitative and sportive;
3. A profile dashboard which includes an up to standard ICF approach, displaying goals, time frames and a summary sheet of functionings with relevant categories and items from the framework;
4. Allows for fast creation, logical overview through flow diagram of both the profile and the intervention;
5. Provides comprehensive data analysis and visualization for exercise data at different periodization levels (Session, Micro, Phase, and Intervention).

### What's my goal

Creating a management solution that will allow to switfly create, compare and analyze data on single persons, multiple or groups or teams and produce document outputs that can be shared among different professional that contribute to the overall wellbeing and success in the field of movement.

### Data Analysis Features

The application now includes a robust data analysis layer that provides visualizations at different periodization tiers:

1. **Session Level Analysis**: Visualize raw exercise data within a single training session, including bar charts for exercise parameters and pie charts for tag distribution.

2. **Micro Level Analysis**: Track trends and progression across multiple sessions within a microcycle (typically a week), with line charts for exercise progression and bar charts for weekly volume summaries.

3. **Phase Level Analysis**: View aggregated trends across several microcycles within a training phase, including line charts for phase progression and area charts for cumulative volume.

4. **Intervention Level Analysis**: Get a macro-level view of the entire training journey with long-term trend analysis and phase comparisons.

### Roadmap

The app has implemented many of its core functionalities. There are still some features that need to be enhanced:

1. Implementing a sound local storage management that doesn't uniquely relies on Zustand;
2. Enhancing the data analysis module with more advanced visualization options and export capabilities;
3. Implementing a full profile export to PDF formatted in LaTeX;

