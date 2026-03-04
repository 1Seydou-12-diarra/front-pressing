import { createTheme, alpha } from '@mui/material/styles';

// ─────────────────────────────────────────────────────────────
//  PALETTE — Couleurs du Pressing
// ─────────────────────────────────────────────────────────────
const COLORS = {
  // Bleu marine professionnel — couleur principale
  navy:        '#1A2B4A',
  navyLight:   '#2C4270',
  navyDark:    '#0F1A2E',

  // Or chaud — accent premium
  gold:        '#C9952A',
  goldLight:   '#E8B84B',
  goldDark:    '#A07820',

  // Blanc cassé / lin — fond propre
  linen:       '#FAF8F5',
  linenDark:   '#F0EDE8',

  // Gris ardoise — texte secondaire
  slate:       '#4A5568',
  slateLight:  '#718096',
  slateLighter:'#A0AEC0',

  // États sémantiques
  success:     '#2E7D54',
  successBg:   '#EBF5EE',
  warning:     '#B45309',
  warningBg:   '#FEF3C7',
  error:       '#B91C1C',
  errorBg:     '#FEE2E2',
  info:        '#1D4ED8',
  infoBg:      '#DBEAFE',
};

// ─────────────────────────────────────────────────────────────
//  THÈME PRINCIPAL
// ─────────────────────────────────────────────────────────────
const theme = createTheme({

  // ── Palette ──────────────────────────────────────────────
  palette: {
    mode: 'light',

    primary: {
      main:        COLORS.navy,
      light:       COLORS.navyLight,
      dark:        COLORS.navyDark,
      contrastText: '#FFFFFF',
    },

    secondary: {
      main:        COLORS.gold,
      light:       COLORS.goldLight,
      dark:        COLORS.goldDark,
      contrastText: '#FFFFFF',
    },

    success: {
      main:        COLORS.success,
      light:       COLORS.successBg,
      contrastText: '#FFFFFF',
    },

    warning: {
      main:        COLORS.warning,
      light:       COLORS.warningBg,
      contrastText: '#FFFFFF',
    },

    error: {
      main:        COLORS.error,
      light:       COLORS.errorBg,
      contrastText: '#FFFFFF',
    },

    info: {
      main:        COLORS.info,
      light:       COLORS.infoBg,
      contrastText: '#FFFFFF',
    },

    background: {
      default: COLORS.linen,
      paper:   '#FFFFFF',
    },

    text: {
      primary:   COLORS.navy,
      secondary: COLORS.slate,
      disabled:  COLORS.slateLighter,
    },

    divider: COLORS.linenDark,

    // Tokens personnalisés accessibles via theme.palette.pressing.*
    // (nécessite augmentation de type — voir bas du fichier)
    pressing: {
      navy:          COLORS.navy,
      gold:          COLORS.gold,
      linen:         COLORS.linen,
      slate:         COLORS.slate,
      navyAlpha10:   alpha(COLORS.navy, 0.1),
      navyAlpha20:   alpha(COLORS.navy, 0.2),
      goldAlpha15:   alpha(COLORS.gold, 0.15),
    },
  } as any,

  // ── Typographie ──────────────────────────────────────────
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  500,
    fontWeightBold:    700,

    h1: {
      fontFamily:   '"Playfair Display", Georgia, serif',
      fontSize:     '2.5rem',
      fontWeight:   700,
      lineHeight:   1.2,
      color:        COLORS.navy,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily:   '"Playfair Display", Georgia, serif',
      fontSize:     '2rem',
      fontWeight:   700,
      lineHeight:   1.25,
      color:        COLORS.navy,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily:   '"Playfair Display", Georgia, serif',
      fontSize:     '1.5rem',
      fontWeight:   600,
      lineHeight:   1.3,
      color:        COLORS.navy,
    },
    h4: {
      fontFamily:   '"DM Sans", sans-serif',
      fontSize:     '1.25rem',
      fontWeight:   600,
      lineHeight:   1.35,
      color:        COLORS.navy,
    },
    h5: {
      fontFamily:   '"DM Sans", sans-serif',
      fontSize:     '1.1rem',
      fontWeight:   600,
      lineHeight:   1.4,
      color:        COLORS.navy,
    },
    h6: {
      fontFamily:   '"DM Sans", sans-serif',
      fontSize:     '1rem',
      fontWeight:   600,
      lineHeight:   1.4,
      color:        COLORS.navy,
    },
    subtitle1: {
      fontSize:      '0.95rem',
      fontWeight:    500,
      lineHeight:    1.5,
      color:         COLORS.slate,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize:      '0.85rem',
      fontWeight:    500,
      lineHeight:    1.5,
      color:         COLORS.slateLight,
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize:   '0.9375rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color:      COLORS.slate,
    },
    body2: {
      fontSize:   '0.875rem',
      fontWeight: 400,
      lineHeight: 1.57,
      color:      COLORS.slateLight,
    },
    button: {
      fontSize:      '0.875rem',
      fontWeight:    600,
      letterSpacing: '0.04em',
      textTransform: 'none' as const,
    },
    caption: {
      fontSize:      '0.75rem',
      fontWeight:    400,
      lineHeight:    1.5,
      color:         COLORS.slateLighter,
      letterSpacing: '0.03em',
    },
    overline: {
      fontSize:      '0.7rem',
      fontWeight:    600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      color:         COLORS.gold,
    },
  },

  // ── Shape ────────────────────────────────────────────────
  shape: {
    borderRadius: 10,
  },

  // ── Shadows personnalisées ────────────────────────────────
  shadows: [
    'none',
    `0 1px 3px ${alpha(COLORS.navy, 0.08)}, 0 1px 2px ${alpha(COLORS.navy, 0.04)}`,
    `0 3px 6px ${alpha(COLORS.navy, 0.08)}, 0 2px 4px ${alpha(COLORS.navy, 0.05)}`,
    `0 6px 12px ${alpha(COLORS.navy, 0.08)}, 0 3px 6px ${alpha(COLORS.navy, 0.05)}`,
    `0 8px 16px ${alpha(COLORS.navy, 0.08)}, 0 4px 8px ${alpha(COLORS.navy, 0.05)}`,
    `0 10px 20px ${alpha(COLORS.navy, 0.08)}, 0 5px 10px ${alpha(COLORS.navy, 0.05)}`,
    `0 12px 24px ${alpha(COLORS.navy, 0.08)}, 0 6px 12px ${alpha(COLORS.navy, 0.05)}`,
    `0 14px 28px ${alpha(COLORS.navy, 0.09)}, 0 7px 14px ${alpha(COLORS.navy, 0.05)}`,
    `0 16px 32px ${alpha(COLORS.navy, 0.09)}, 0 8px 16px ${alpha(COLORS.navy, 0.05)}`,
    `0 18px 36px ${alpha(COLORS.navy, 0.09)}, 0 9px 18px ${alpha(COLORS.navy, 0.05)}`,
    `0 20px 40px ${alpha(COLORS.navy, 0.10)}, 0 10px 20px ${alpha(COLORS.navy, 0.06)}`,
    `0 22px 44px ${alpha(COLORS.navy, 0.10)}, 0 11px 22px ${alpha(COLORS.navy, 0.06)}`,
    `0 24px 48px ${alpha(COLORS.navy, 0.10)}, 0 12px 24px ${alpha(COLORS.navy, 0.06)}`,
    `0 26px 52px ${alpha(COLORS.navy, 0.11)}, 0 13px 26px ${alpha(COLORS.navy, 0.06)}`,
    `0 28px 56px ${alpha(COLORS.navy, 0.11)}, 0 14px 28px ${alpha(COLORS.navy, 0.06)}`,
    `0 30px 60px ${alpha(COLORS.navy, 0.11)}, 0 15px 30px ${alpha(COLORS.navy, 0.07)}`,
    `0 32px 64px ${alpha(COLORS.navy, 0.12)}, 0 16px 32px ${alpha(COLORS.navy, 0.07)}`,
    `0 34px 68px ${alpha(COLORS.navy, 0.12)}, 0 17px 34px ${alpha(COLORS.navy, 0.07)}`,
    `0 36px 72px ${alpha(COLORS.navy, 0.12)}, 0 18px 36px ${alpha(COLORS.navy, 0.07)}`,
    `0 38px 76px ${alpha(COLORS.navy, 0.13)}, 0 19px 38px ${alpha(COLORS.navy, 0.07)}`,
    `0 40px 80px ${alpha(COLORS.navy, 0.13)}, 0 20px 40px ${alpha(COLORS.navy, 0.08)}`,
    `0 42px 84px ${alpha(COLORS.navy, 0.13)}, 0 21px 42px ${alpha(COLORS.navy, 0.08)}`,
    `0 44px 88px ${alpha(COLORS.navy, 0.14)}, 0 22px 44px ${alpha(COLORS.navy, 0.08)}`,
    `0 46px 92px ${alpha(COLORS.navy, 0.14)}, 0 23px 46px ${alpha(COLORS.navy, 0.08)}`,
    `0 48px 96px ${alpha(COLORS.navy, 0.15)}, 0 24px 48px ${alpha(COLORS.navy, 0.09)}`,
  ],

  // ── Transitions ──────────────────────────────────────────
  transitions: {
    duration: {
      shortest:      150,
      shorter:       200,
      short:         250,
      standard:      300,
      complex:       375,
      enteringScreen:225,
      leavingScreen: 195,
    },
  },

  // ── Surcharge des composants ──────────────────────────────
  components: {

    // ── CssBaseline — reset global ──────────────────────────
    MuiCssBaseline: {
      styleOverrides: `

        *, *::before, *::after {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background-color: ${COLORS.linen};
          color: ${COLORS.slate};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${COLORS.linenDark};
        }
        ::-webkit-scrollbar-thumb {
          background: ${alpha(COLORS.navy, 0.25)};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${alpha(COLORS.navy, 0.4)};
        }
      `,
    },

    // ── Button ──────────────────────────────────────────────
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '9px 20px',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.03em',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${COLORS.navyLight} 0%, ${COLORS.navy} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyDark} 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(COLORS.navy, 0.35)}`,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.goldDark} 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(COLORS.gold, 0.4)}`,
          },
        },
        outlinedPrimary: {
          borderColor: alpha(COLORS.navy, 0.35),
          '&:hover': {
            borderColor: COLORS.navy,
            backgroundColor: alpha(COLORS.navy, 0.04),
          },
        },
        textPrimary: {
          '&:hover': {
            backgroundColor: alpha(COLORS.navy, 0.05),
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '0.9375rem',
        },
        sizeSmall: {
          padding: '6px 14px',
          fontSize: '0.8125rem',
        },
      },
    },

    // ── Card ────────────────────────────────────────────────
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${COLORS.linenDark}`,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.09)}`,
          },
        },
      },
    },

    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px 12px',
        },
        title: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          fontSize: '1rem',
          color: COLORS.navy,
        },
        subheader: {
          fontSize: '0.8125rem',
          color: COLORS.slateLight,
          marginTop: 2,
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },

    // ── Paper ───────────────────────────────────────────────
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 14,
        },
        outlined: {
          borderColor: COLORS.linenDark,
        },
      },
    },

    // ── TextField / Input ────────────────────────────────────
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          transition: 'box-shadow 0.2s ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(COLORS.navy, 0.5),
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(COLORS.navy, 0.1)}`,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.navy,
              borderWidth: 1.5,
            },
          },
          '&.Mui-error': {
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(COLORS.error, 0.1)}`,
            },
          },
        },
        notchedOutline: {
          borderColor: COLORS.linenDark,
        },
        input: {
          fontSize: '0.9rem',
          padding: '10px 14px',
          '&::placeholder': {
            color: COLORS.slateLighter,
            opacity: 1,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: COLORS.slateLight,
          '&.Mui-focused': {
            color: COLORS.navy,
          },
        },
      },
    },

    // ── Select ──────────────────────────────────────────────
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    // ── Chip ────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.8rem',
          height: 26,
        },
        colorPrimary: {
          backgroundColor: alpha(COLORS.navy, 0.1),
          color: COLORS.navy,
          '&:hover': {
            backgroundColor: alpha(COLORS.navy, 0.18),
          },
        },
        colorSecondary: {
          backgroundColor: alpha(COLORS.gold, 0.12),
          color: COLORS.goldDark,
        },
        colorSuccess: {
          backgroundColor: COLORS.successBg,
          color: COLORS.success,
        },
        colorWarning: {
          backgroundColor: COLORS.warningBg,
          color: COLORS.warning,
        },
        colorError: {
          backgroundColor: COLORS.errorBg,
          color: COLORS.error,
        },
      },
    },

    // ── Table ───────────────────────────────────────────────
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${COLORS.linenDark}`,
          boxShadow: 'none',
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.linen,
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: COLORS.slateLight,
            borderBottom: `2px solid ${COLORS.linenDark}`,
            padding: '12px 16px',
            whiteSpace: 'nowrap',
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: alpha(COLORS.navy, 0.03),
          },
          '&:last-child .MuiTableCell-body': {
            borderBottom: 'none',
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.linenDark}`,
          padding: '12px 16px',
          fontSize: '0.875rem',
          color: COLORS.slate,
        },
        body: {
          color: COLORS.slate,
        },
      },
    },

    // ── AppBar ──────────────────────────────────────────────
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: COLORS.navy,
          borderBottom: `1px solid ${alpha('#FFFFFF', 0.08)}`,
          backdropFilter: 'blur(8px)',
        },
        colorPrimary: {
          background: `linear-gradient(135deg, ${COLORS.navyDark} 0%, ${COLORS.navy} 100%)`,
        },
      },
    },

    // ── Drawer / Sidebar ─────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: COLORS.navy,
          color: '#FFFFFF',
          borderRight: 'none',
          boxShadow: `4px 0 20px ${alpha(COLORS.navy, 0.3)}`,
        },
      },
    },

    // ── ListItem (sidebar navigation) ───────────────────────
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '10px 14px',
          color: alpha('#FFFFFF', 0.75),
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha('#FFFFFF', 0.08),
            color: '#FFFFFF',
          },
          '&.Mui-selected': {
            backgroundColor: alpha(COLORS.gold, 0.2),
            color: COLORS.goldLight,
            '&:hover': {
              backgroundColor: alpha(COLORS.gold, 0.28),
            },
            '& .MuiListItemIcon-root': {
              color: COLORS.goldLight,
            },
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: alpha('#FFFFFF', 0.6),
          minWidth: 38,
        },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.9rem',
          fontWeight: 500,
        },
      },
    },

    // ── Tabs ────────────────────────────────────────────────
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.linenDark}`,
        },
        indicator: {
          backgroundColor: COLORS.gold,
          height: 2.5,
          borderRadius: '2px 2px 0 0',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          color: COLORS.slateLight,
          minHeight: 44,
          padding: '10px 18px',
          '&.Mui-selected': {
            color: COLORS.navy,
            fontWeight: 600,
          },
          '&:hover': {
            color: COLORS.navy,
            opacity: 1,
          },
        },
      },
    },

    // ── Dialog ──────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: `0 24px 64px ${alpha(COLORS.navy, 0.2)}`,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 700,
          fontSize: '1.25rem',
          color: COLORS.navy,
          padding: '24px 28px 12px',
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 28px',
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 20px',
          gap: 8,
        },
      },
    },

    // ── Alert ───────────────────────────────────────────────
    MuiAlert: {
      defaultProps: {
        variant: 'filled',
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        filledSuccess: {
          backgroundColor: COLORS.success,
        },
        filledWarning: {
          backgroundColor: COLORS.warning,
        },
        filledError: {
          backgroundColor: COLORS.error,
        },
        filledInfo: {
          backgroundColor: COLORS.info,
        },
        standardSuccess: {
          backgroundColor: COLORS.successBg,
          color: COLORS.success,
          '& .MuiAlert-icon': { color: COLORS.success },
        },
        standardWarning: {
          backgroundColor: COLORS.warningBg,
          color: COLORS.warning,
          '& .MuiAlert-icon': { color: COLORS.warning },
        },
        standardError: {
          backgroundColor: COLORS.errorBg,
          color: COLORS.error,
          '& .MuiAlert-icon': { color: COLORS.error },
        },
        standardInfo: {
          backgroundColor: COLORS.infoBg,
          color: COLORS.info,
          '& .MuiAlert-icon': { color: COLORS.info },
        },
      },
    },

    // ── Badge ───────────────────────────────────────────────
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          fontSize: '0.65rem',
        },
        colorSecondary: {
          backgroundColor: COLORS.gold,
          color: '#FFFFFF',
        },
      },
    },

    // ── Tooltip ─────────────────────────────────────────────
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: COLORS.navyDark,
          fontSize: '0.78rem',
          fontWeight: 500,
          borderRadius: 6,
          padding: '6px 10px',
          boxShadow: `0 4px 12px ${alpha(COLORS.navy, 0.3)}`,
        },
        arrow: {
          color: COLORS.navyDark,
        },
      },
    },

    // ── Pagination ──────────────────────────────────────────
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&.Mui-selected': {
            backgroundColor: COLORS.navy,
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: COLORS.navyLight,
            },
          },
        },
      },
    },

    // ── Avatar ──────────────────────────────────────────────
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.9rem',
        },
        colorDefault: {
          backgroundColor: alpha(COLORS.navy, 0.12),
          color: COLORS.navy,
        },
      },
    },

    // ── Divider ─────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: COLORS.linenDark,
        },
      },
    },

    // ── Skeleton ────────────────────────────────────────────
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },
      styleOverrides: {
        root: {
          backgroundColor: alpha(COLORS.navy, 0.06),
          '&::after': {
            background: `linear-gradient(90deg, transparent, ${alpha(COLORS.navy, 0.04)}, transparent)`,
          },
        },
      },
    },

    // ── LinearProgress ──────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: alpha(COLORS.navy, 0.08),
        },
        barColorPrimary: {
          background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.gold})`,
        },
      },
    },

    // ── Fab ─────────────────────────────────────────────────
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: `0 4px 14px ${alpha(COLORS.navy, 0.3)}`,
        },
        primary: {
          background: `linear-gradient(135deg, ${COLORS.navyLight}, ${COLORS.navy})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyDark})`,
          },
        },
      },
    },

    // ── IconButton ──────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: alpha(COLORS.navy, 0.06),
          },
        },
        colorPrimary: {
          color: COLORS.navy,
        },
      },
    },

    // ── Breadcrumbs ─────────────────────────────────────────
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
        },
        ol: {
          flexWrap: 'nowrap',
          alignItems: 'center',
        },
        separator: {
          color: COLORS.slateLighter,
          margin: '0 6px',
        },
        li: {
          '& a': {
            color: COLORS.slateLight,
            textDecoration: 'none',
            fontWeight: 500,
            '&:hover': {
              color: COLORS.navy,
              textDecoration: 'underline',
            },
          },
          '&:last-child': {
            color: COLORS.navy,
            fontWeight: 600,
          },
        },
      },
    },

    // ── Menu ────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${COLORS.linenDark}`,
          boxShadow: `0 8px 24px ${alpha(COLORS.navy, 0.12)}`,
          marginTop: 4,
        },
        list: {
          padding: '6px',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '8px 12px',
          gap: 10,
          color: COLORS.slate,
          '&:hover': {
            backgroundColor: alpha(COLORS.navy, 0.05),
            color: COLORS.navy,
          },
          '&.Mui-selected': {
            backgroundColor: alpha(COLORS.navy, 0.08),
            color: COLORS.navy,
            fontWeight: 600,
          },
        },
      },
    },

    // ── Switch ──────────────────────────────────────────────
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 6,
        },
        track: {
          borderRadius: 10,
          backgroundColor: COLORS.slateLighter,
          opacity: 1,
        },
        thumb: {
          boxShadow: `0 1px 3px ${alpha(COLORS.navy, 0.2)}`,
        },
        colorPrimary: {
          '&.Mui-checked': {
            color: '#FFFFFF',
            '& + .MuiSwitch-track': {
              backgroundColor: COLORS.navy,
              opacity: 1,
            },
          },
        },
      },
    },

    // ── Stepper ─────────────────────────────────────────────
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: COLORS.slateLighter,
          '&.Mui-active': {
            color: COLORS.navy,
          },
          '&.Mui-completed': {
            color: COLORS.success,
          },
        },
      },
    },

    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: '0.875rem',
          '&.Mui-active': {
            fontWeight: 600,
            color: COLORS.navy,
          },
          '&.Mui-completed': {
            color: COLORS.success,
          },
        },
      },
    },
  },
});

export default theme;

// ─────────────────────────────────────────────────────────────
//  AUGMENTATION DE TYPE — accès à theme.palette.pressing
// ─────────────────────────────────────────────────────────────
declare module '@mui/material/styles' {
  interface Palette {
    pressing: {
      navy:        string;
      gold:        string;
      linen:       string;
      slate:       string;
      navyAlpha10: string;
      navyAlpha20: string;
      goldAlpha15: string;
    };
  }
  interface PaletteOptions {
    pressing?: {
      navy?:        string;
      gold?:        string;
      linen?:       string;
      slate?:       string;
      navyAlpha10?: string;
      navyAlpha20?: string;
      goldAlpha15?: string;
    };
  }
}