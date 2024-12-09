import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import Button from 'src/components/Button';
/* -- Clanode Change -- */
// import CheckBox from 'src/components/CheckBox';
/* -- Clanode Change End -- */
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import SSHKeyCreationDrawer from 'src/features/Profile/SSHKeys/SSHKeyCreationDrawer';
import { truncateAndJoinList } from 'src/utilities/stringUtils';

/* -- Clanode Change -- */
import FormControlLabel from 'src/components/core/FormControlLabel';
import Radio from 'src/components/core/Radio';
/* -- Clanode Change End -- */

export const MAX_SSH_KEYS_DISPLAY = 100;

const useStyles = makeStyles()((theme: Theme) => ({
  cellCheckbox: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  /* -- Clanode Change -- */
  radioButton: {
    marginLeft: theme.spacing(2),
    width: 50,
  },
  /* -- Clanode Change End -- */
  cellUser: {
    width: '30%',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  userWrapper: {
    alignItems: 'center',
    display: 'inline-flex',
    marginTop: theme.spacing(0.5),
  },
}));

interface Props {
  authorizedUsers: string[];
  disabled?: boolean;
  setAuthorizedUsers: (usernames: string[]) => void;
}

const UserSSHKeyPanel = (props: Props) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const { authorizedUsers, disabled, setAuthorizedUsers } = props;

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState<boolean>(
    false
  );

  const pagination = usePagination(1);

  const { data: profile } = useProfile();

  const isRestricted = profile?.restricted ?? false;

  // For non-restricted users, this query data will be used to render options
  const {
    data: users,
    error: accountUsersError,
    isLoading: isAccountUsersLoading,
  } = useAccountUsers(
    {
      params: {
        page: pagination.page,
        page_size: pagination.pageSize,
      },
    }
    // { ssh_keys: { '+neq': null } }
  );

  // Restricted users can't hit /account/users.
  // For restricted users, we assume that they can only choose their own SSH keys,
  // so we use this query to get them so we can display their labels.
  // Notice how the query is only enabled when the user is restricted.
  // Also notice this query usually requires us to handle pagination, BUT,
  // because we truncate the results, we don't need all items.
  const {
    data: sshKeys,
    error: sshKeysError,
    isLoading: isSSHKeysLoading,
  } = useSSHKeysQuery({}, {}, isRestricted);

  const sshKeyLabels = sshKeys?.data.map((key) => key.label) ?? [];
  const sshKeyTotal = sshKeys?.results ?? 0;

  const onToggle = (username: string) => {
    if (authorizedUsers.includes(username)) {
      // Remove username
      setAuthorizedUsers(authorizedUsers.filter((u) => u !== username));
    } else {
      setAuthorizedUsers([...authorizedUsers, username]);
    }
  };

  const isLoading = isRestricted ? isSSHKeysLoading : isAccountUsersLoading;
  const error = isRestricted ? sshKeysError : accountUsersError;

  /* -- Clanode Change -- */
  const [selectedSSHKey, setSelectedSSHKey] = React.useState<string>();

  const handleKeySelected = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
    result: boolean
  ) => {
    usersWithKeys
      .find((user) => user.keys[0] === key)
      ?.onSSHKeyChange(e, result);
    setSelectedSSHKey(key);
  };
  /* -- Clanode Change End -- */
  const handleKeyAddSuccess = (key: string) => {
    onKeyAddSuccess();
    setSuccess(true);
    setDrawerOpen(false);
    setSelectedSSHKey(key);
  };

  const handleOpenDrawer = () => {
    setSuccess(false);
    setDrawerOpen(true);
  };

  const usersWithKeys = users
    ? users.filter((thisUser) => thisUser.keys.length > 0)
    : [];

  React.useEffect(() => {
    usersWithKeys
      .find((user) => user.keys[0] === selectedSSHKey)
      ?.onSSHKeyChange({} as React.ChangeEvent<HTMLInputElement>, true);
  }, [usersWithKeys]);

  return (
    <React.Fragment>
      <Typography className={classes.title} variant="h2">
        SSH Keys
      </Typography>
      <Table spacingBottom={16}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.cellCheckbox} />
            <TableCell className={classes.cellUser}>User</TableCell>
            <TableCell>SSH Keys</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error ? (
            <TableRowError colSpan={12} message={error} />
          ) : usersWithKeys.length > 0 ? (
            /* -- Clanode Change -- */
            usersWithKeys.map(
              (
                { gravatarUrl, keys, onSSHKeyChange, selected, username },
                idx
              ) => (
                <TableRow
                  key={idx}
                  data-qa-ssh-public-key
                  data-testid="ssh-public-key"
                >
                  <TableCell className={classes.cellCheckbox}>
                    <FormControlLabel
                      value={keys[0]}
                      label={''}
                      control={
                        <Radio
                          className={classes.radioButton}
                          checked={selected && selectedSSHKey === keys[0]}
                          onChange={(e, result) => {
                            handleKeySelected(e, keys[0], result);
                          }}
                          disabled={disabled}
                        />
                      }
                      data-qa-radio={''}
                    />
                  </TableCell>
                  <TableCell className={classes.cellUser}>
                    <div className={classes.userWrapper}>
                      <img
                        src={gravatarUrl}
                        className={classes.gravatar}
                        alt={username}
                      />
                      {username}
                    </div>
                  </TableCell>
                  <TableCell>
                    {truncateAndJoinList(keys, MAX_SSH_KEYS_DISPLAY)}
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            /*usersWithKeys.map(
              ({ gravatarUrl, keys, onSSHKeyChange, selected, username }) => (
                <TableRow
                  key={username}
                  data-qa-ssh-public-key
                  data-testid="ssh-public-key"
                >
                  <TableCell className={classes.cellCheckbox}>
                    <CheckBox
                      disabled={disabled}
                      checked={selected}
                      onChange={onSSHKeyChange}
                      inputProps={{
                        'aria-label': `Enable SSH for ${username}`,
                      }}
                    />
                  </TableCell>
                  <TableCell className={classes.cellUser}>
                    <div className={classes.userWrapper}>
                      <img
                        src={gravatarUrl}
                        className={classes.gravatar}
                        alt={username}
                      />
                      {username}
                    </div>
                  </TableCell>
                  <TableCell>
                    {truncateAndJoinList(keys, MAX_SSH_KEYS_DISPLAY)}
                  </TableCell>
                </TableRow>
              )
            )*/
            /* -- Clanode Change End -- */
            <TableRowEmptyState
              colSpan={12}
              message={"You don't have any SSH keys available."}
            />
          )}
        </TableBody>
      </Table>
      {!isRestricted && (
        <PaginationFooter
          count={users?.results ?? 0}
          eventCategory="SSH Key Users Table"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      )}
      <Button
        buttonType="outlined"
        disabled={disabled}
        onClick={() => setIsCreateDrawerOpen(true)}
      >
        Add an SSH Key
      </Button>
      <CreateSSHKeyDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
      />
    </React.Fragment>
  );
};

export default React.memo(UserSSHKeyPanel);
