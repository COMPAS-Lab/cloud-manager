import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Button } from 'src/components/Button/Button';
import { SvgIcon } from 'src/components/SvgIcon';

const useStyles = makeStyles()((theme: Theme) => ({
  active: {
    color: '#1f64b6',
  },
  disabled: {
    '& $icon': {
      borderColor: '#939598',
      color: '#939598',
    },
    color: '#939598',
    pointerEvents: 'none',
  },
  icon: {
    '& .border': {
      transition: 'none',
    },
    color: 'inherit',
    fontSize: 18,
    marginRight: theme.spacing(0.5),
    transition: 'none',
  },
  label: {
    position: 'relative',
    top: -1,
    whiteSpace: 'nowrap',
  },
  left: {
    left: `-${theme.spacing(1.5)}`,
  },
  linkWrapper: {
    '&:hover, &:focus': {
      textDecoration: 'none',
    },
    display: 'flex',
    justifyContent: 'center',
  },
  root: {
    '&:focus': { outline: '1px dotted #999' },
    '&:hover': {
      '& .border': {
        color: theme.palette.primary.light,
      },
      backgroundColor: 'transparent',
      color: theme.palette.primary.light,
    },
    alignItems: 'flex-start',
    borderRadius: theme.tokens.borderRadius.None,
    cursor: 'pointer',
    display: 'flex',
    margin: `0 ${theme.spacing(1)} 2px 0`,
    minHeight: 'auto',
    padding: theme.spacing(1.5),
    transition: 'none',
  },
}));

export interface Props {
  SideIcon: React.ComponentClass | typeof SvgIcon;
  active?: boolean;
  children?: string;
  className?: string;
  disabled?: boolean;
  hideText?: boolean;
  left?: boolean;
  onClick?: () => void;
  text: string;
  title: string;
  to?: string;
  hideText?: boolean;
  /* -- Clanode Change -- */
  hide?: boolean;
  /* -- Clanode Change -- */
}

export const IconTextLink = (props: Props) => {
  const { classes, cx } = useStyles();
  const {
    SideIcon,
    active,
    className,
    disabled,
    hideText,
    left,
    onClick,
    text,
    title,
    to,
    hideText,
    hide,
  } = props;
  /* -- Clanode Change -- */
  if (hide) return null;
  /* -- Clanode Change End -- */

  return (
    <ConditionalWrapper
      condition={to !== undefined && !disabled}
      wrapper={(children) => (
        <Link className={classes.linkWrapper} to={to as string}>
          {children}
        </Link>
      )}
    >
      <Button
        className={classNames(
          {
            [classes.root]: true,
            [classes.disabled]: disabled === true,
            [classes.active]: active === true,
            [classes.left]: left === true,
            iconTextLink: true,
          },
          className
        )}
        title={title}
        onClick={onClick}
        data-qa-icon-text-link={title}
        disableRipple
      >
        <SideIcon className={`${classes.icon} ${hideText === true && 'm0'}`} />
        <span
          className={classNames({
            [classes.label]: true,
            ['visually-hidden']: hideText,
          })}
        >
          {text}
        </span>
      </Button>
    </ConditionalWrapper>
  );
};

export default withStyles(styles)(IconTextLink);
