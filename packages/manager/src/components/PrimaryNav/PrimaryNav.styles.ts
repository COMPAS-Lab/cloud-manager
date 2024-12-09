import { Box, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { Link } from 'react-router-dom';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { Accordion } from 'src/components/Accordion';
import { Divider } from 'src/components/Divider';
import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/SideMenu';

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  height: '100%',
  margin: 0,
  minHeight: 64,
  padding: 0,
  [theme.breakpoints.up('md')]: {
    minHeight: 80,
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: 72,
  },
  fadeContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 90px)',
    width: '100%',
  },
  logoItem: {
    display: 'flex',
    alignItems: 'center',
    // padding: '12px 12px 0 14px',
    position: 'relative',
    '& svg': {
      maxWidth: theme.spacing(3) + 91,
    },
  },
  logoCollapsed: {
    background: theme.bg.primaryNavPaper,
    height: 48,
    width: 100,
    position: 'absolute',
    top: 12,
    left: 48,
  },
  '&:hover, &:focus': {
    textDecoration: 'none',
  },
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  minWidth: SIDEBAR_WIDTH,
  padding: '7px 16px',
  position: 'relative',
  ...(props.isActiveLink && {
    backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
  }),
  ...(props.isCollapsed && {
    backgroundImage: 'none',
  }),
}));

export const StyledPrimaryLinkBox = styled(Box, {
  label: 'StyledPrimaryLinkBox',
  shouldForwardProp: omittedProps(['isCollapsed']),
})<{ isCollapsed: boolean }>(({ theme, ...props }) => ({
  alignItems: 'center',
  color: theme.tokens.color.Neutrals.White,
  display: 'flex',
  fontFamily: 'LatoWebBold',
  fontSize: '0.875rem',
  justifyContent: 'space-between',
  transition: theme.transitions.create(['color', 'opacity']),
  width: '100%',
  ...(props.isCollapsed && {
    opacity: 0,
  }),
}));

export const StyledAccordion = styled(Accordion, {
  label: 'StyledAccordion',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveProductFamily']),
})<{ isActiveProductFamily: boolean; isCollapsed: boolean }>(
  ({ theme, ...props }) => ({
    '& h3': {
      '& p': {
        color: '#B8B8B8',
        transition: theme.transitions.create(['opacity']),
        ...(props.isCollapsed && {
          opacity: 0,
        }),
      },
      // product family icon
      '& svg': {
        color: props.isActiveProductFamily ? '#00B159' : theme.color.grey4,
        height: 20,
        marginRight: 14,
        transition: theme.transitions.create(['color']),
        width: 20,
      },
      alignItems: 'center',
      display: 'flex',
      fontSize: '0.7rem',
      letterSpacing: '1px',
      lineheight: 20,
      padding: '0 10px',
      textTransform: 'uppercase',
    },
    '.MuiAccordionDetails-root': {
      padding: 0,
    },
    '.MuiButtonBase-root, MuiAccordionSummary-root': {
      '.Mui-expanded': {
        alignItems: 'center',
        maxHeight: '42px',
        minHeight: '42px',
      },
      maxHeight: '42px',
      minHeight: '42px',
      paddingLeft: 4,
      svg: {
        fill: theme.tokens.color.Neutrals.White,
        stroke: 'transparent',
      },
    },
    backgroundColor: theme.name === 'dark' ? theme.bg.appBar : 'transparent',
  })
);
