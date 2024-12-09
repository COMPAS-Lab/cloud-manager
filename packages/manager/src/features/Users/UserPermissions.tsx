import {
  getGrants,
  getUser,
  updateGrants,
  updateUser,
} from '@linode/api-v4/lib/account';
import { Box } from '@linode/ui';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { enqueueSnackbar } from 'notistack';
import { compose, flatten, lensPath, omit, set } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Notice } from 'src/components/Notice/Notice';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import { withFeatureFlags } from 'src/containers/flags.container';
import { withQueryClient } from 'src/containers/withQueryClient.container';
import { PARENT_USER, grantTypeMap } from 'src/features/Account/constants';
import { accountQueries } from 'src/queries/account/queries';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import {
  StyledCircleProgress,
  StyledDivWrapper,
  StyledFullAccountAccessToggleGrid,
  StyledHeaderGrid,
  StyledPaper,
  StyledPermPaper,
  StyledSelect,
  StyledUnrestrictedGrid,
} from './UserPermissions.styles';
import { UserPermissionsEntitySection } from './UserPermissionsEntitySection';

import type {
  GlobalGrantTypes,
  Grant,
  GrantLevel,
  GrantType,
  Grants,
  User,
} from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';
import type { QueryClient } from '@tanstack/react-query';
import type { Item } from 'src/components/EnhancedSelect/Select';
import type { WithFeatureFlagProps } from 'src/containers/flags.container';
import type { WithQueryClientProps } from 'src/containers/withQueryClient.container';
interface Props {
  accountUsername?: string;
  currentUsername?: string;
  queryClient: QueryClient;
}

interface TabInfo {
  showTabs: boolean;
  tabs: GrantType[];
}

interface State {
  errors?: APIError[];
  grants?: Grants;
  isSavingEntity: boolean;
  isSavingGlobal: boolean;
  loading: boolean;
  /* need this separated so we can show just the restricted toggle when it's in use */
  loadingGrants: boolean;
  originalGrants?: Grants /* used to implement cancel functionality */;
  restricted?: boolean;
  /* null needs to be a string here because it's a Select value */
  setAllPerm: 'null' | 'read_only' | 'read_write';
  /* Large Account Support */
  showTabs?: boolean;
  tabs?: GrantType[];
  userType: null | string;
}

type CombinedProps = Props & WithQueryClientProps & WithFeatureFlagProps;

class UserPermissions extends React.Component<CombinedProps, State> {
  state: State = {
    loadingGrants: false,
    loading: true,
    setAllPerm: 'null',
    saving: {
      global: false,
      entity: false,
    },
  };

  globalBooleanPerms = [
    'add_linodes',
    'add_nodebalancers',
    'add_longview',
    'longview_subscription',
    'add_domains',
    'add_stackscripts',
    'add_images',
    'add_volumes',
    'add_firewalls',
    'cancel_account',
  ];

  entityPerms = [
    'linode',
    'firewall',
    'stackscript',
    'image',
    'volume',
    'nodebalancer',
    'domain',
    'longview',
  ];

  getUserGrants = () => {
    const { username } = this.props;
    if (username) {
      getGrants(username)
        .then((grants) => {
          if (grants.global) {
            this.setState({
              grants,
              originalGrants: grants,
              loading: false,
              loadingGrants: false,
              restricted: true,
            });
          } else {
            this.setState({
              grants,
              loading: false,
              loadingGrants: false,
              restricted: false,
            });
          }
          if ((grants.global as any).manager_role) {
            this.setState({ restricted: false });
          } else {
            this.setState({ restricted: true });
          }
        })
        .catch((errResponse) => {
          this.setState({
            errors: getAPIErrorOrDefault(
              errResponse,
              'Unknown error occurred while fetching user permissions. Try again later.'
            ),
          });
          scrollErrorIntoView();
        });
    }
  };

  componentDidMount() {
    this.getUserGrants();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.username !== this.props.username) {
      this.getUserGrants();
    }
  }

  savePermsType = (type: string) => () => {
    this.setState({ errors: undefined });
    const { username, clearNewUser } = this.props;
    const { grants } = this.state;
    if (!username || !(grants && grants[type])) {
      return this.setState({
        errors: [
          {
            reason: `Can\'t set ${type} permissions at this time. Please try again later`,
          },
        ],
      });
    }

    clearNewUser();

    if (type === 'global') {
      this.setState(
        compose(
          set(lensPath(['success', 'global']), ''),
          set(lensPath(['saving', 'global']), true)
        )
      );
      updateGrants(username, { global: grants.global } as Partial<Grants>)
        .then((grantsResponse) => {
          this.setState(
            compose(
              set(lensPath(['grants', 'global']), grantsResponse.global),
              set(
                lensPath(['originalGrants', 'global']),
                grantsResponse.global
              ),
              set(
                lensPath(['success', 'global']),
                'Successfully updated global permissions'
              ) as () => Success,
              set(lensPath(['saving', 'global']), false)
            )
          );
        })
        .catch((errResponse) => {
          this.setState({
            errors: getAPIErrorOrDefault(
              errResponse,
              'Error while updating global permissions for this user. Please try again later.'
            ),
          });
          this.setState(set(lensPath(['saving', 'global']), false));
          scrollErrorIntoView();
        });
      return;
    }

    /* This is where individual entity saving could be implemented */
  };

  saveSpecificGrants = () => {
    this.setState({ errors: undefined });
    const { username } = this.props;
    const { grants } = this.state;
    if (!username || !grants) {
      return this.setState({
        errors: [
          {
            reason: `Can\'t set entity-specific permissions at this time. Please try again later`,
          },
        ],
      });
    }

    this.setState(
      compose(
        set(lensPath(['success', 'specific']), ''),
        set(lensPath(['saving', 'entity']), true)
      )
    );
    const requestPayload = omit(['global'], grants);
    updateGrants(username, requestPayload as Partial<Grants>)
      .then((grantsResponse) => {
        /* build array of update fns */
        let updateFns = this.entityPerms.map((entity) => {
          const lens = lensPath(['grants', entity]);
          const lensOrig = lensPath(['originalGrants', entity]);
          return [
            set(lens, grantsResponse[entity]),
            set(lensOrig, grantsResponse[entity]),
          ];
        });
        updateFns = flatten(updateFns);
        /* apply all of them at once */
        if (updateFns.length) {
          this.setState((compose as any)(...updateFns));
        }
        this.setState(
          compose(
            set(
              lensPath(['success', 'specific']),
              'Successfully updated entity-specific permissions'
            ),
            set(lensPath(['saving', 'entity']), false)
          )
        );
      })
      .catch((errResponse) => {
        this.setState({
          errors: getAPIErrorOrDefault(
            errResponse,
            'Error while updating entity-specific permissions for this user. Please try again later'
          ),
        });
        this.setState(set(lensPath(['saving', 'entity']), false));
        scrollErrorIntoView();
      });
  };

  cancelPermsType = (type: string) => () => {
    const { grants, originalGrants } = this.state;
    if (!grants || !originalGrants) {
      return;
    }

    if (type === 'global') {
      this.setState(set(lensPath(['grants', 'global']), originalGrants.global));
      return;
    }

    if (type === 'entity') {
      /* build array of update fns */
      const updateFns = this.entityPerms.map((entity) => {
        const lens = lensPath(['grants', entity]);
        return set(lens, originalGrants[entity]);
      });
      /* apply all of them at once */
      if (updateFns.length) {
        this.setState((compose as any)(...updateFns));
      }
      return;
    }
  };

  onChangeRestricted = () => {
    const { username } = this.props;
    const { restricted } = this.state;
    const email = username;
    this.setState({
      errors: [],
      loadingGrants: true,
    });
    if (username) {
      updateUser(username, { email, restricted })
        .then((user) => {
          this.setState({
            restricted: user.restricted,
          });
          // refresh the data on /account/users so it is accurate
          this.props.queryClient.invalidateQueries({
            queryKey: accountQueries.users._ctx.paginated._def,
          });
          // Update the user directly in the cache
          this.props.queryClient.setQueryData<User>(
            accountQueries.users._ctx.user(user.username).queryKey,
            user
          );
          // unconditionally sets this.state.loadingGrants to false
          this.getUserGrants();
          enqueueSnackbar('User permissions successfully saved.', {
            variant: 'success',
          });
        })
        .catch((errResponse) => {
          this.setState({
            errors: getAPIErrorOrDefault(
              errResponse,
              'Error when updating user restricted status. Please try again later.'
            ),
            loadingGrants: false,
          });
        });
    }
  };

  renderActions = (
    onConfirm: () => void,
    onCancel: () => void,
    loading: boolean
  ) => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          label: 'Save',
          loading,
          onClick: onConfirm,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Reset',
          onClick: onCancel,
        }}
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          paddingBottom: 0,
        })}
        alignItems="center"
        display="flex"
        justifyContent="flex-end"
      />
    );
  };

  renderBillingPerm = () => {
    const { grants, userType } = this.state;
    const isChildUser = userType === 'child';
    const isProxyUser = userType === 'proxy';

    if (!(grants && grants.global)) {
      return null;
    }

    return (
      <div className={classes.section} style={{ display: 'none' }}>
        <Grid container className={classes.section} data-qa-billing-section>
          <Grid item>
            <Typography variant="h3" data-qa-permissions-header="billing">
              Billing Access
            </Typography>
          </Grid>
        </Grid>
        <Grid
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            paddingBottom: 0,
          })}
          container
          spacing={2}
        >
          <SelectionCard
            checked={grants.global.account_access === null}
            onClick={this.billingPermOnClick(null)}
            data-qa-billing-access="None"
          />
          <SelectionCard
            checked={
              grants.global.account_access === 'read_only' ||
              (isChildUser && Boolean(this.state.grants?.global.account_access))
            }
            data-qa-billing-access="Read Only"
            disabled={isProxyUser}
            heading="Read Only"
            subheadings={['Can view invoices and billing info.']}
            checked={grants.global.account_access === 'read_only'}
            onClick={this.billingPermOnClick('read_only')}
            data-qa-billing-access="Read Only"
          />
          <SelectionCard
            checked={
              grants.global.account_access === 'read_write' && !isChildUser
            }
            subheadings={[
              'Can make payments, update contact and billing info, and will receive copies of all invoices and payment emails.',
            ]}
            checked={grants.global.account_access === 'read_write'}
            onClick={this.billingPermOnClick('read_write')}
            data-qa-billing-access="Read-Write"
          />
        </Grid>
      </StyledDivWrapper>
    );
  };

  renderBody = () => {
    const { accountUsername, currentUsername } = this.props;
    const { errors, restricted } = this.state;
    const hasErrorFor = getAPIErrorFor({ restricted: 'Restricted' }, errors);
    const generalError = hasErrorFor('none');
    const isProxyUser = this.state.userType === 'proxy';

    return (
      <ActionsPanel
        display="none"
        alignItems="center"
        justifyContent="flex-end"
        className={classes.section}
      >
        <Button buttonType="secondary" onClick={onCancel} data-qa-cancel>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={onConfirm}
          loading={loading}
          data-qa-submit
        >
          Save
        </Button>
      </ActionsPanel>
    );
  };

  renderGlobalPerms = () => {
    const { grants, isSavingGlobal } = this.state;
    if (
      this.state.userType === 'parent' &&
      !this.globalBooleanPerms.includes('child_account_access')
    ) {
      this.globalBooleanPerms.push('child_account_access');
    }
    return (
      <Paper
        className={classes.globalSection}
        data-qa-global-section
        style={{ display: 'none' }}
      >
        <Typography
          data-qa-permissions-header="Global Permissions"
          variant="body2"
        >
          Configure the specific rights and privileges this user has within the
          account.{<br />}Remember that permissions related to actions with the
          '$' symbol may incur additional charges.
        </Typography>
        <Grid
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            paddingBottom: 0,
          })}
          container
          spacing={2}
        >
          {grants &&
            grants.global &&
            this.globalBooleanPerms
              /**
               * filtering out cancel_account because we're not observing
               * this permission in Cloud or APIv4. Either the user is unrestricted
               * and can cancel the account or is restricted and cannot cancel.
               */
              .filter((eachPerm) => eachPerm !== 'cancel_account')
              .map((perm) =>
                this.renderGlobalPerm(perm, grants.global[perm] as boolean)
              )}
        </Grid>
        {this.renderBillingPerm()}
        {this.renderActions(
          this.savePermsType('global'),
          this.cancelPermsType('global'),
          isSavingGlobal
        )}
      </StyledPermPaper>
    );
  };

  entitySetAllTo = (entity: GrantType, value: GrantLevel) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return;
    }
    /* map entities to an array of state update functions */
    const updateFns = grants[entity].map((grant, idx) => {
      const lens = lensPath(['grants', entity, idx, 'permissions']);
      return set(lens, value);
    });
    /* compose all of the update functions and setState */
    if (updateFns.length) {
      this.setState((compose as any)(...updateFns));
    }
  };

  setGrantTo = (entity: string, idx: number, value: GrantLevel) => () => {
    const { grants } = this.state;
    if (!(grants && grants[entity])) {
      return;
    }
    this.setState(set(lensPath(['grants', entity, idx, 'permissions']), value));
  };

  renderEntitySection = (entity: GrantType) => {
    const { classes } = this.props;
    const { grants } = this.state;
    if (!(grants && grants[entity] && grants[entity].length)) {
      return null;
    }
    const entityGrants = grants[entity];

    const entityNameMap = {
      linode: 'Linodes',
      stackscript: 'StackScripts',
      image: 'Images',
      volume: 'Volumes',
      nodebalancer: 'NodeBalancers',
      domain: 'Domains',
      longview: 'Longview Clients',
      firewall: 'Firewalls',
    };

    return (
      <div key={entity} className={classes.section} style={{ display: 'none' }}>
        <Typography
          variant="h3"
          className={classes.tableSubheading}
          data-qa-permissions-header={entityNameMap[entity]}
        >
          {entityNameMap[entity]}
        </Typography>
        <Table
          aria-label="User Permissions"
          className={classes.grantTable}
          noBorder
        >
          <TableHead data-qa-table-head>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell padding="checkbox">
                {/* eslint-disable-next-line */}
                <label
                  className={classes.selectAll}
                  style={{ marginLeft: -35 }}
                >
                  None
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, null)}
                    value="null"
                    onChange={this.entitySetAllTo(entity, null)}
                    data-qa-permission-header="None"
                  />
                </label>
              </TableCell>
              <TableCell padding="checkbox">
                {/* eslint-disable-next-line */}
                <label
                  className={classes.selectAll}
                  style={{ marginLeft: -65 }}
                >
                  Read Only
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, 'read_only')}
                    value="read_only"
                    onChange={this.entitySetAllTo(entity, 'read_only')}
                    data-qa-permission-header="Read Only"
                  />
                </label>
              </TableCell>
              <TableCell padding="checkbox">
                {/* eslint-disable-next-line */}
                <label
                  className={classes.selectAll}
                  style={{ marginLeft: -73 }}
                >
                  Read-Write
                  <Radio
                    name={`${entity}-select-all`}
                    checked={this.entityIsAll(entity, 'read_write')}
                    value="read_write"
                    onChange={this.entitySetAllTo(entity, 'read_write')}
                    data-qa-permission-header="Read-Write"
                  />
                </label>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entityGrants.map((grant, idx) => {
              return (
                <TableRow key={grant.id} data-qa-specific-grant={grant.label}>
                  <TableCell className={classes.label} parentColumn="Label">
                    {grant.label}
                  </TableCell>
                  <TableCell parentColumn="None" padding="checkbox">
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === null}
                      value="null"
                      onChange={this.setGrantTo(entity, idx, null)}
                      data-qa-permission="None"
                    />
                  </TableCell>
                  <TableCell parentColumn="Read Only" padding="checkbox">
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === 'read_only'}
                      value="read_only"
                      onChange={this.setGrantTo(entity, idx, 'read_only')}
                      data-qa-permission="Read Only"
                    />
                  </TableCell>
                  <TableCell parentColumn="Read-Write" padding="checkbox">
                    <Radio
                      name={`${grant.id}-perms`}
                      checked={grant.permissions === 'read_write'}
                      value="read_write"
                      onChange={this.setGrantTo(entity, idx, 'read_write')}
                      data-qa-permission="Read-Write"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  setAllEntitiesTo = (e: Item) => {
    const value = e.value === 'null' ? null : e.value;
    this.entityPerms.map((entity: GrantType) =>
      this.entitySetAllTo(entity, value as GrantLevel)()
    );
    this.setState({
      setAllPerm: e.value as 'null' | 'read_only' | 'read_write',
    });
  };

  renderSpecificPerms = () => {
    const { grants, isSavingEntity, setAllPerm } = this.state;

    const permOptions = [
      { label: 'None', value: 'null' },
      { label: 'Read Only', value: 'read_only' },
      { label: 'Read Write', value: 'read_write' },
    ];

    const defaultPerm = permOptions.find((eachPerm) => {
      return eachPerm.value === setAllPerm;
    });

    return (
      <Paper
        className={classes.globalSection}
        data-qa-entity-section
        style={{ display: 'none' }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography
              data-qa-permissions-header="Specific Permissions"
              variant="h2"
            >
              Specific Permissions
            </Typography>
          </Grid>
          <Grid style={{ marginTop: 5 }}>
            <StyledSelect
              defaultValue={defaultPerm}
              id="setall"
              label="Set all permissions to:"
              isClearable={false}
              inline
              className={classes.setAll}
              noMarginTop
              onChange={this.setAllEntitiesTo}
              options={permOptions}
              small
            />
          </Grid>
        </Grid>
        <StyledDivWrapper>
          {this.state.showTabs ? (
            <Tabs>
              <TabList>
                {this.state.tabs?.map((entity) => (
                  <Tab key={`${entity}-tab`}>{grantTypeMap[entity]}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {this.state.tabs?.map((entity: GrantType, idx) => (
                  <SafeTabPanel index={idx} key={`${entity}-tab-content`}>
                    <UserPermissionsEntitySection
                      entity={entity}
                      entitySetAllTo={this.entitySetAllTo}
                      grants={this.state.grants?.[entity]}
                      key={entity}
                      setGrantTo={this.setGrantTo}
                    />
                  </SafeTabPanel>
                ))}
              </TabPanels>
            </Tabs>
          ) : (
            grants &&
            this.entityPerms.map((entity: GrantType) => (
              <UserPermissionsEntitySection
                entity={entity}
                entitySetAllTo={this.entitySetAllTo}
                grants={this.state.grants?.[entity]}
                key={entity}
                setGrantTo={this.setGrantTo}
                showHeading
              />
            ))
          )}
        </StyledDivWrapper>
        {this.renderActions(
          this.saveSpecificGrants,
          this.cancelPermsType('entity'),
          isSavingEntity
        )}
      </StyledPermPaper>
    );
  };

  renderUnrestricted = () => {
    return (
      <Paper className={classes.unrestrictedRoot}>
        <Typography data-qa-unrestricted-msg>
          This user has Member access to the account.
        </Typography>
      </Paper>
    );
  };

  renderBody = () => {
    const { classes, currentUser, username } = this.props;
    const { restricted, errors } = this.state;
    const hasErrorFor = getAPIErrorsFor({ restricted: 'Restricted' }, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {generalError && <Notice error text={generalError} spacingTop={8} />}
        <Grid container alignItems="center" style={{ width: 'auto' }}>
          <Grid item>
            <Typography
              className={classes.title}
              variant="h2"
              data-qa-restrict-access={restricted}
            >
              Manager Access:
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h2">{!restricted ? 'On' : 'Off'}</Typography>
          </Grid>
          <Grid item>
            <Toggle
              tooltipText={
                username === currentUser
                  ? 'You cannot restrict the current active user.'
                  : ''
              }
              disabled={username === currentUser}
              checked={!restricted}
              onChange={this.onChangeRestricted}
              className={classes.toggle}
            />
          </Grid>
        </Grid>
        {!restricted ? this.renderPermissions() : this.renderUnrestricted()}
      </React.Fragment>
    );
  };

  render() {
    const { loading } = this.state;
    const { currentUsername } = this.props;

    return (
      <div ref={this.formContainerRef}>
        <DocumentTitleSegment segment={`${currentUsername} - Permissions`} />
        {loading ? <CircleProgress /> : this.renderBody()}
      </div>
    );
  }
}

export default withQueryClient(withFeatureFlags(UserPermissions));
