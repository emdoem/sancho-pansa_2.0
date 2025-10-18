# Design Recommendations

## Information Architecture:

    Three-level hierarchy: Library Management (top) → File Operations (middle) → Track Details (bottom)

    Keep critical actions no more than 2 clicks away from the main screen

    Use persistent sidebar navigation so users always know where they are

    ​

## Visual Hierarchy (since this is a utility tool):

    Data-dense tables are appropriate - DJs and music collectors expect to see lots of information

    Use color coding sparingly but meaningfully:

        Green badges for "verified unique"

        Orange/yellow for "potential duplicate"

        Red for "will be deleted"

    Typography: Monospace fonts for file paths, clear hierarchy for metadata

    ​

## Key UX Patterns:

    - Bulk operations: Always show count of selected items before destructive actions

    - Undo/history: Since you're modifying files, maintain a change log (especially for deleted files)

​    - Preview everything: Before renaming or deleting, show clear before/after

    - Progress feedback: File operations take time - show progress with ability to cancel
    ​
    - Validation: Before applying changes, run validation checks (e.g., "3 files will become orphaned")
