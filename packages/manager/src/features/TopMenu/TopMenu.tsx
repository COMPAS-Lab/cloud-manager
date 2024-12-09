import { Box, IconButton } from '@linode/ui';
import MenuIcon from '@mui/icons-material/Menu';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Toolbar from 'src/components/core/Toolbar';
import Typography from 'src/components/core/Typography';
import AddNewMenu from './AddNewMenu'; /*
import Community from './Community';
import Help from './Help';
*/ /* -- Clanode Change End -- */
/* -- Clanode Change -- */ import NotificationButton from './NotificationButton';
import SearchBar from './SearchBar';
import TopMenuIcon from './TopMenuIcon';
import UserMenu from './UserMenu';
import ProjectMenu from './ProjectMenu';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    height: 50,
    color: theme.palette.text.primary,
    backgroundColor: theme.bg.bgPaper,
    position: 'relative',
    paddingRight: '0 !important',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  toolbar: {
    padding: 0,
    height: `50px !important`,
    width: '100%',
  },
  communityIcon: {
    [theme.breakpoints.down(370)]: {
      ...theme.visually.hidden,
    },
  },
}));

interface Props {
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  username: string;
}

/**
 * - Items presented in the top navigation are considered universally important and should be available regardless of any particular task.
 * - The number of items should be limited. In the future, **Help & Support** could become a drop down with links to **Community**, **Guides**, and etc.
 */
export const TopMenu = React.memo((props: TopMenuProps) => {
  const { desktopMenuToggle, isSideMenuOpen, openSideMenu, username } = props;

  const { loggedInAsCustomer } = useAuthentication();

  const navHoverText = isSideMenuOpen
    ? 'Collapse side menu'
    : 'Expand side menu';

  return (
    <React.Fragment>
      {loggedInAsCustomer && (
        <Box bgcolor="pink" padding="1em" textAlign="center">
          <Typography
            color={(theme) => theme.tokens.color.Neutrals.Black}
            fontSize="1.2em"
          >
            You are logged in as customer: <strong>{username}</strong>
          </Typography>
        </Box>
      )}
      <AppBar data-qa-appbar>
        <Toolbar
          sx={(theme) => ({
            '&.MuiToolbar-root': {
              height: `50px`,
              padding: theme.spacing(0),
              width: '100%',
            },
          })}
          variant="dense"
        >
          <Hidden mdDown>
            <TopMenuTooltip title={navHoverText}>
              <IconButton
                aria-label="open menu"
                color="inherit"
                data-testid="open-nav-menu"
                onClick={desktopMenuToggle}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </TopMenuTooltip>
          </Hidden>
          <Hidden mdUp>
            <TopMenuTooltip title={navHoverText}>
              <IconButton
                aria-label="open menu"
                color="inherit"
                onClick={openSideMenu}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </TopMenuTooltip>
          </Hidden>
          <AddNewMenu />
          <SearchBar />
          {/* -- Clanode Change -- */
          /*
          <Help />
          <Community className={classes.communityIcon} />
          */
          /* -- Clanode Change -- */}
          <ProjectMenu />
          <NotificationButton />
          <UserMenu />
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
});
