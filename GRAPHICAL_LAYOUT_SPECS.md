# Graphical Layout Specifications

Based on the styling observed in `sidebar.jsx`, `ExerciseModal.jsx`, `editor.jsx`, and `interventionModal.jsx`.

## General Theme

The components follow a dark, modern theme with subtle contrasts, tight spacing, and interactive elements, prioritizing focus on core content.

## Color Palette

*   **Backgrounds:**
    *   Primary: `#18181b` (zinc-900) - Dark background used for main panels (Sidebar, Editor), modal headers, and tab lists.
    *   Secondary: `#27272a` (zinc-800, neutral-800) - Slightly lighter dark background used for containers, sections, modal bodies, and some interactive elements.
    *   Tertiary: `#3f3f46` (zinc-700, neutral-700) - Used for selected states, borders, or darker interactive elements.
*   **Text:**
    *   Primary: `#e5e5e5` (stone-200, gray-200, gray-100) - Light text on dark backgrounds.
    *   Secondary: `#a1a1aa` (neutral-400, gray-400, gray-300, gray-500) - Slightly darker or less prominent text.
    *   Accents: `#71717a` (neutral-600, gray-600), `#52525b` (zinc-600) - Subtle text or border colors.
*   **Borders/Dividers:**
    *   Dark Lines: `rgb(53 51 51)`, `#1c1c1c`, `#27272a` (zinc-800), `#3f3f46` (zinc-700), `#52525b` (zinc-600), `#a3a3a3` (gray-400/50) - Used for separating sections and elements.
*   **Interactive Elements/States:**
    *   Hover/Active Backgrounds: `#3f3f46` (zinc-700), `#52525b` (slate-600/500), `#1f2937` (gray-700), `#2d3748` (gray-600)
    *   Success/Save: Green hues (`text-green-500`, `bg-green-100`/`800/50`, `border-green-200`/`700`)
    *   Error: Red hues (`text-red-500`, `bg-red-100`/`800/50`, `border-red-200`/`700`)
    *   Buttons/Controls: Blue hues for primary actions (`bg-blue-600`), gray/zinc for secondary.

## Layout and Dimensions

*   **Spacing:** Consistent use of spacing utilities (`p-`, `m-`, `py-`, `px-`, `gap-`, `space-y-`, `space-x-`) from potentially Tailwind CSS for padding, margins, and gaps between elements. Emphasis on tighter spacing for interactive elements like buttons and form fields.
    *   Common padding/margins: `p-1`, `p-2`, `p-3`, `p-4`, `py-2`, `py-3`, `pb-2`.
    *   Specific instances of larger padding like `p-6` for modal panels.
    *   Tight padding on input fields and some buttons: `px-2 py-1`.
    *   Common gaps: `gap-2`, `gap-3`, `gap-4`.
    *   Vertical spacing: `space-y-2`, `space-y-3`, `space-y-4`.
    *   Horizontal spacing: `space-x-2`, `space-x-3`.
*   **Dimensions:**
    *   Full width/height (`w-full`, `h-full`).
    *   Specific relative heights (`h-5/6`).
    *   Minimum widths (`minWidth: "150px"`).
*   **Layout Models:** Extensive use of Flexbox (`flex`, `flex-col`, `flex-row`, `items-center`, `justify-between`, `gap-`). Some use of Grid (`grid`, `grid-cols-`) for layout within components (e.g., node details table in InterventionModal). Some use of relative positioning (`relative`) for elements like delete buttons within containers.
*   **Borders:**
    *   Thin solid borders (`solid 1px`) used for separation.
    *   Dashed borders (`border-dashed`) for add buttons or interactive areas.
    *   Rounded corners (`rounded`, `rounded-lg`, `rounded-md`, `rounded-full`).

## Typography

*   Font Family: `font-sans` is specified in `sidebar.jsx`.
*   Font Sizes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`. Includes a very small custom size `text-[11px]` used for input fields and buttons to achieve a tighter look.
*   Font Weights: `font-thin`, `font-light`, `font-medium`, `font-semibold`. `font-thin` and `font-light` are used for titles and labels to give a modern feel.

## Component Specifics

*   **Sidebar:**
    *   Full height and width of its container.
    *   Right border for separation.
    *   Input fields with rounded corners and subtle focus outlines.
    *   List items with distinct hover and selected states using background colors and text color changes.
    *   Overflow handling (`overflow-auto`, `overflow-y-auto`) for lists.
*   **ExerciseModal:**
    *   Uses `react-modal` and `react-rnd` for a draggable, resizable modal overlay.
    *   Modal content has a dark background, rounded corners, and a shadow.
    *   Header with a `cursor-move` handle and close button.
    *   Internal layout uses Flexbox for column structure and spacing.
    *   Containers within the modal are visually grouped with borders and background colors.
    *   Fields within containers are laid out horizontally (`space-x-3 flex flex-row`).
    *   Clear visual indication for errors (red text, border colors).
    *   Transition effects (`transition-all duration-200`, `transition-colors duration-200`) are used for hover states and visibility changes.
    *   Animation (`AnimatePresence`, `motion.div`) for elements like the bulk edit form.
*   **InterventionModal:**
    *   Uses `react-modal` and `react-rnd` for a draggable, resizable modal overlay.
    *   Header uses `font-thin` and `text-xl` with `p-4` padding.
    *   Tab list uses `p-4` padding.
    *   Tab panels use `p-6` padding.
    *   Input fields use tight `px-2 py-1` padding and `text-[11px]` font size.
    *   Preview and saved interventions sections use `p-4` padding.
    *   Node detail table uses `grid grid-cols-4` and `p-2` padding with `text-xs`.
    *   Save button uses tight `px-2 py-1` padding and `text-[11px]` font size with `font-light`.
    *   Overall styling aligns with the dark theme, with specific attention to compact element styling.
*   **OptionsModal:**
    *   Uses `react-modal` for the modal overlay.
    *   Main content area has `bg-zinc-800` and `border border-zinc-700`.
    *   Sidebar uses `bg-zinc-900` and `border-r border-zinc-800`. Its navigation area has `p-1` padding.
    *   Sidebar header uses `font-light` and `text-lg` with `p-4` padding.
    *   Sidebar navigation buttons use `px-3 py-1` padding, `text-sm font-light`, `rounded-sm`, and distinct background colors for active (`bg-zinc-800`) and hover (`hover:bg-zinc-700`) states.
    *   Content header uses `font-light` and `text-lg` with `p-4` padding.
    *   Content sections use `p-6` padding.
    *   Input fields and select elements within content sections use `px-2 py-1` padding and `text-[11px]` font size with appropriate dark backgrounds and borders.
    *   Checkboxes use specific tailwind classes for color and shape.
    *   Buttons within content sections use varying padding (`py-2`, `px-4 py-2`) and font sizes (`text-sm`) with specific background and hover colors (`bg-zinc-700`, `bg-blue-600`, etc.) and `font-light` or `font-medium` weights.
    *   Status messages (checking, not-available, available, error) use specific text colors and font weights (`font-light`).
    *   Release notes section uses `p-3`, `bg-zinc-700`, `rounded-md`, `border border-zinc-600`, and `text-sm text-gray-400`.
    *   Overall styling is consistent with the dark theme, emphasizing clear sections and interactive elements with tighter spacing in the sidebar.
*   **Editor:**
    *   Uses `react-flow` for the main canvas.
    *   Canvas has a dot background pattern.
    *   Nodes appear to have dark backgrounds (`rgba(28, 28, 28, 1)` specified in data templates) which aligns with the overall dark theme.
    *   Context menus (NodeMenu, PaneMenu, SelectionMenu) appear as overlays at click positions.
    *   Modals (`Inspector`, `TestModal`, `ExerciseModal`, `InterventionModal`, `OptionsModal`) are layered on top.

## Overall Direction

The graphical style aims for a clean, functional, and slightly technical look with an emphasis on tight graphics and clear focus on interactive elements. The dark theme is dominant, with shades of gray and zinc providing structure and hierarchy. Interactivity is indicated through subtle background changes, border highlights, and clear text color changes on hover or selection. Borders and rounded corners are used consistently to define areas and elements. Spacing is managed using a utility-first approach, with specific instances of tighter padding and smaller font sizes for a more compact feel in components like the InterventionModal and the OptionsModal sidebar. 