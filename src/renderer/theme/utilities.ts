export const mixins = {
  cardContainer: () => ({
    backgroundColor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'var(--joy-radius-sm)',
  }),

  flexCenter: () => ({
    display: 'flex',
    alignItems: 'center',
  }),

  flexCenterVertical: () => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }),

  flexContainer: () => ({
    display: 'flex',
    minWidth: 0,
  }),

  // Hover highlight with proper text contrast
  hoverHighlight: () => ({
    '&:hover': {
      backgroundColor: 'var(--joy-palette-primary-500)',
      opacity: 0.08,
      '& .MuiTypography-root': {
        color: 'var(--joy-palette-text-primary)',
      },
      '& svg': {
        color: 'var(--joy-palette-text-primary)',
      },
    },
  }),

  borderDefault: () => ({
    border: '1px solid',
    borderColor: 'divider',
  }),

  stackHorizontal: () => ({
    display: 'flex',
    flexDirection: 'row',
  }),

  stackVertical: () => ({
    display: 'flex',
    flexDirection: 'column',
  }),

  centered: () => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  tableRow: () => ({
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
  }),

  tableRowHover: () => ({
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
    minWidth: 0,
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.12)',
    },
  }),

  // Table cells with minWidth: 0 to prevent flex overflow
  // This is critical for tables with fixed-width flex items
  tableCell: (align: 'left' | 'center' | 'right' = 'left') => ({
    padding: '12px',
    overflow: 'hidden',
    minWidth: 0,
    display: 'flex',
    justifyContent:
      align === 'center'
        ? 'center'
        : align === 'right'
          ? 'flex-end'
          : 'flex-start',
  }),

  tableHeaderCell: (align: 'left' | 'center' | 'right' = 'left') => ({
    padding: '12px',
    fontWeight: 600,
    color: 'text.primary',
    minWidth: 0,
    display: 'flex',
    justifyContent:
      align === 'center'
        ? 'center'
        : align === 'right'
          ? 'flex-end'
          : 'flex-start',
  }),

  tableCheckboxCell: () => ({
    flex: '0 0 5%',
    padding: '12px',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
  }),
};

export const modalSizes = {
  small: {
    minWidth: 400,
  },
  medium: {
    minWidth: 500,
    maxWidth: '80vw',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  large: {
    minWidth: 700,
    maxWidth: '90vw',
    maxHeight: '85vh',
  },
};

export const layoutTokens = {
  tableRowHeight: 52,
  tableHeaderHeight: 48,
  padding: '12px',
  paddingTop: 24,
  searchInputWidth: 300,
};
