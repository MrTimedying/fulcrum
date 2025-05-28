# Graphical Layout Specifications

Based on the styling observed in `sidebar.jsx`, `ExerciseModal.jsx`, and `editor.jsx`.

## General Theme

The components follow a dark, modern theme with subtle contrasts and interactive elements.

## Color Palette

*   **Backgrounds:**
    *   Primary: `#18181b` (zinc-900) - Dark background used for main panels (Sidebar, Editor).
    *   Secondary: `#27272a` (zinc-800, neutral-800) - Slightly lighter dark background used for containers, sections, and some interactive elements.
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

*   **Spacing:** Consistent use of spacing utilities (`p-`, `m-`, `py-`, `px-`, `gap-`, `space-y-`, `space-x-`) from potentially Tailwind CSS for padding, margins, and gaps between elements.
    *   Common padding/margins: `p-1`, `p-2`, `p-3`, `p-4`, `py-2`, `py-3`, `pb-2`.
    *   Common gaps: `gap-2`, `gap-3`, `gap-4`.
    *   Vertical spacing: `space-y-2`, `space-y-3`, `space-y-4`.
    *   Horizontal spacing: `space-x-2`, `space-x-3`.
*   **Dimensions:**
    *   Full width/height (`w-full`, `h-full`).
    *   Specific relative heights (`h-5/6`).
    *   Minimum widths (`minWidth: "150px"`).
*   **Layout Models:** Extensive use of Flexbox (`flex`, `flex-col`, `flex-row`, `items-center`, `justify-between`, `gap-`). Some use of relative positioning (`relative`) for elements like delete buttons within containers.
*   **Borders:**
    *   Thin solid borders (`solid 1px`) used for separation.
    *   Dashed borders (`border-dashed`) for add buttons or interactive areas.
    *   Rounded corners (`rounded`, `rounded-lg`, `rounded-md`, `rounded-full`).

## Typography

*   Font Family: `font-sans` is specified in `sidebar.jsx`.
*   Font Sizes: `text-xs`, `text-sm`, `text-base`, `text-lg`.
*   Font Weights: `font-thin`, `font-medium`, `font-semibold`.

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
*   **Editor:**
    *   Uses `react-flow` for the main canvas.
    *   Canvas has a dot background pattern.
    *   Nodes appear to have dark backgrounds (`rgba(28, 28, 28, 1)` specified in data templates) which aligns with the overall dark theme.
    *   Context menus (NodeMenu, PaneMenu, SelectionMenu) appear as overlays at click positions.
    *   Modals (`Inspector`, `TestModal`, `ExerciseModal`) are layered on top.

## Overall Direction

The graphical style aims for a clean, functional, and slightly technical look. The dark theme is dominant, with shades of gray and zinc providing structure and hierarchy. Interactivity is indicated through subtle background changes, border highlights, and clear text color changes on hover or selection. Borders and rounded corners are used consistently to define areas and elements. Spacing is managed using a utility-first approach, suggesting a consistent rhythm throughout the interface. 