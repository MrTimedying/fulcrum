---
Author: Antonio Logarzo
Date: 2025-05-24
---
Based on this, the primary quantitative data points directly available for visualization from a single exercise instance are:

- `sets`
- `reps_constant`
- `duration_constant`
- `intensity_number`

The `_variant` and `_string` subtypes (`reps_variant`, `duration_variant`, `intensity_string`) and `tags` contain valuable information but would require **parsing** to extract numerical data (e.g., parsing "10, 8, 6" from `reps_variant` into an array of numbers, or extracting "8" from "RPE 8" in `intensity_string`). `intensity_type` provides context for `intensity_number` or `intensity_string`.

Now let's look at graphical insights for each periodization tier:

1. **Session Level (Contains a set of exercises)**
    
    - **Nature of Data:** Raw data points (`sets`, `reps_constant`, `duration_constant`, `intensity_number`) for each _specific exercise instance_ performed in that session. Multiple exercise instances exist within one session.
    - **Goal:** Visualize the composition and execution details of a single training session. Compare parameters _between exercises_ performed in this session.
    - **Potential Graphical Insights:**
        - **Bar Charts per Exercise:** As implemented in the refactored Inspector, show a bar for each numerical field (`sets`, `reps_constant`, `duration_constant`, `intensity_number`) for a _single exercise_ within the session. This provides a quick overview of the key parameters for that specific exercise instance.
            - _Example:_ For a "Bench Press" instance, bars showing "Sets: 3", "Reps: 8", "Intensity: 100 (kg)".
        - **Summary Table/List:** A simple, clear list or table of each exercise in the session, displaying the value for each relevant field. This is often the most direct way to present the raw data for a single session's exercises.
        - **Pie Chart (if tags/types are parsed):** Visualize the proportion of the session dedicated to different exercise categories (e.g., "Upper Body Push", "Lower Body Pull") based on parsed tags or `intensity_type`.
2. **Micro Level (Contains exercises from multiple sessions)**
    
    - **Nature of Data:** Data for exercises performed _repeatedly_ across several sessions within a microcycle (typically a week). Aggregation across sessions is needed for a given exercise or exercise category.
    - **Goal:** Track trends, progression, volume accumulation, and consistency for specific exercises or movement patterns _over the duration of the microcycle_.
    - **Potential Graphical Insights:**
        - **Line Charts (Exercise Progression):** Plot `reps_constant`, `intensity_number`, or a calculated metric like `sets * reps_constant` (volume per set, if weight isn't a factor or `intensity_number` represents weight) for a _specific exercise_ across each session it was performed in the microcycle. This shows week-to-week progression or consistency.
            - _Example:_ Line chart showing `intensity_number` (weight) for "Squat" across three sessions in the week.
        - **Bar Chart (Weekly Volume/Intensity Summary):** Aggregate a metric (e.g., total sets, total reps, average intensity) for specific exercises or exercise categories (`tags`) _summed across the microcycle_. Compare these aggregated values between exercises or categories.
            - _Example:_ Bar chart comparing total weekly volume (`sets * reps_constant`) for "Bench Press", "Overhead Press", and "Incline Dumbbell Press".
        - **Stacked Bar Chart (Training Stress Distribution):** If `intensity_type` can be categorized (e.g., "Strength", "Hypertrophy", "Power"), show the proportion of weekly sets or volume dedicated to each category over the microcycle.
3. **Phases Level (Contains exercises from micro and sessions)**
    
    - **Nature of Data:** Data for exercises across several microcycles within a longer training phase (e.g., a mesocycle, typically 3-6 weeks). Data needs to be aggregated at the micro or weekly level and then viewed across these aggregated periods.
    - **Goal:** Show overall trends, volume/intensity modulation, and periodization strategy across the phase. Compare aggregated metrics _between microcycles_ within the phase.
    - **Potential Graphical Insights:**
        - **Line Charts (Phase Progression):** Plot weekly aggregated metrics (e.g., average weekly intensity, total weekly volume) for key exercises or exercise categories across the duration of the phase. This visualizes the intended (and executed) periodization strategy (e.g., linear progression of intensity, undulating volume).
            - _Example:_ Line chart showing total weekly sets for all "Lower Body" exercises across a 6-week phase.
        - **Area Chart (Cumulative Volume):** Visualize the running total of volume (e.g., sets x reps) over the course of the phase. This shows how volume accumulates.
        - **Bar Chart (Microcycle Comparison):** Compare average intensity, total volume, or frequency of specific exercises/categories _between_ each microcycle within the phase.
        - **Box Plots (Intensity/Volume Distribution):** Show the distribution (median, quartiles, range) of `intensity_number` or calculated volume for a specific exercise _within each microcycle_ of the phase. This highlights changes in the _spread_ of training load.
4. **Intervention Level (Contains all exercises)**
    
    - **Nature of Data:** All exercise data across the entire training plan, spanning multiple phases (e.g., a macrocycle, typically several months or a year). Highest level of aggregation is required.
    - **Goal:** Provide a macro-level view of the entire training journey. Show long-term trends, overall volume/intensity distribution, and compare performance/metrics _between phases_.
    - **Potential Graphical Insights:**
        - **Line Charts (Long-Term Trends):** Plot aggregated monthly or phase-level metrics (e.g., average monthly intensity, total monthly volume for specific lifts or categories) across the entire intervention. This highlights the overall trajectory of training.
            - _Example:_ Line chart showing 3-month rolling average of `intensity_number` for "Deadlift" over a year.
        - **Bar Chart (Phase Comparison):** Compare total volume or average intensity for key exercise categories or the overall training load _between each phase_ of the intervention.
        - **Stacked Bar Chart (Periodization Mix):** Show the proportion of total volume or sets dedicated to different training goals (`intensity_type` categories like Strength, Hypertrophy) _per phase_ or _per month_ across the entire intervention. This visualizes the periodization model.
        - **Heatmap (Frequency/Volume Calendar):** Visualize training frequency or total daily/weekly volume on a calendar view for the entire intervention. Provides a quick visual of consistency and load peaks/troughs.

In summary, the progression moves from displaying individual exercise parameters at the Session level, to tracking specific exercise trends over a week (Micro), to visualizing aggregated trends and periodization across several weeks (Phases), and finally to showing the overall training history and phase comparison over the entire plan (Intervention). The quantitative subtypes (`sets`, `reps_constant`, `duration_constant`, `intensity_number`) are fundamental to these visualizations, while parsing the `_variant`, `_string`, and `tags` subtypes unlocks deeper insights into specific repetition schemes, precise intensities (like RPE or percentage), and exercise categorization.