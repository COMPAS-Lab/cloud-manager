import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Toggle from 'src/components/Toggle';
import localStorageContainer from 'src/containers/localStorage.container';
import { NodeBalancerGettingStarted, NodeBalancerReference } from 'src/documentation';
import { ApplicationState } from 'src/store';
import { withNodeBalancerActions, WithNodeBalancerActions } from 'src/store/nodeBalancer/nodeBalancer.containers';
import { nodeBalancersWithConfigs } from 'src/store/nodeBalancer/nodeBalancer.selectors';
import { sendEvent } from 'src/utilities/analytics';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import ListGroupedNodeBalancers from './ListGroupedNodeBalancers';
import ListNodeBalancers from './ListNodeBalancers';
import NodeBalancersLandingEmptyState from './NodeBalancersLandingEmptyState';

type ClassNames =
  | 'root'
  | 'title'
  | 'nodeStatus'
  | 'nameCell'
  | 'nodeStatus'
  | 'transferred'
  | 'ports'
  | 'ip'
  | 'tagGroup';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  nameCell: {
    width: '15%',
    minWidth: 150,
  },
  nodeStatus: {
    width: '10%',
    minWidth: 100,
  },
  transferred: {
    width: '10%',
    minWidth: 100,
  },
  ports: {
    width: '10%',
    minWidth: 50,
  },
  ip: {
    width: '30%',
    minWidth: 200,
  },
  tagGroup: {
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing.unit - 2,
  }
});

interface DeleteConfirmDialogState {
  open: boolean;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
}

interface State {
  deleteConfirmDialog: DeleteConfirmDialogState;
  selectedNodeBalancerId?: number;
}

type CombinedProps =
  & WithNodeBalancerActions
  & LocalStorageProps
  & WithNodeBalancers
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>
  & SetDocsProps;

export class NodeBalancersLanding extends React.Component<CombinedProps, State> {
  static eventCategory = `nodebalancers landing`;

  static defaultDeleteConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
  };

  state: State = {
    deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
  };

  static docs = [
    NodeBalancerGettingStarted,
    NodeBalancerReference,
  ];

  toggleDialog = (nodeBalancerId: number) => {
    this.setState({
      selectedNodeBalancerId: nodeBalancerId,
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        open: !this.state.deleteConfirmDialog.open,
      },
    });
  }

  onSubmitDelete = () => {
    const { deleteNodeBalancer } = this.props;
    const { selectedNodeBalancerId } = this.state;

    if (!selectedNodeBalancerId) {
      return;
    }

    this.setState({
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    deleteNodeBalancer({ nodeBalancerId: selectedNodeBalancerId })
      .then((response) => {
        this.setState({
          deleteConfirmDialog: {
            open: false,
            submitting: false,
          },
        });
      })
      .catch((err) => {
        const apiError = path<Linode.ApiFieldError[]>(['response', 'data', 'error'], err);

        return this.setState({
          deleteConfirmDialog: {
            ...this.state.deleteConfirmDialog,
            submitting: false,
            errors: apiError
              ? apiError
              : [{ field: 'none', reason: 'Unable to complete your request at this time.' }],
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  render() {
    const {
      classes,
      history,
      nodeBalancersCount,
      nodeBalancersLoading,
      nodeBalancersData,
      nodeBalancersError,
      groupByTag,
      toggleGroupByTag,
    } = this.props;

    const {
      deleteConfirmDialog: {
        open: deleteConfirmAlertOpen,
      },
    } = this.state;

    if (nodeBalancersError) {
      return <RenderError />;
    }

    if (nodeBalancersLoading) {
      return <LoadingState />;
    }

    if (nodeBalancersCount === 0) {
      return <NodeBalancersLandingEmptyState />
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="NodeBalancers" />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography role="header" variant="h1" data-qa-title className={classes.title}>
              NodeBalancers
            </Typography>
          </Grid>
          <Grid item>
            <FormControlLabel
              className={classes.tagGroup}
              label="Group by Tag:"
              control={
                <Toggle
                  className={(groupByTag ? ' checked' : ' unchecked')}
                  onChange={(e, checked) => toggleGroupByTag(checked)}
                  checked={groupByTag} />
              }
            />
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end" style={{ width: 'auto' }}>
              <Grid item>
                <AddNewLink
                  onClick={() => history.push('/nodebalancers/create')}
                  label="Add a NodeBalancer"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <OrderBy data={Object.values(nodeBalancersData)} order={'desc'} orderBy={`label`}>
          {({ data: orderedData, handleOrderChange, order, orderBy }) => {
            const props = {
              data: orderedData,
              handleOrderChange,
              order,
              orderBy,
              toggleDialog: this.toggleDialog,
            };
            return groupByTag
              ? <ListGroupedNodeBalancers {...props} />
              : <ListNodeBalancers {...props} />
          }}
        </OrderBy>
        <ConfirmationDialog
          onClose={this.closeConfirmationDialog}
          title="Confirm Deletion"
          error={(this.state.deleteConfirmDialog.errors || []).map(e => e.reason).join(',')}
          actions={this.renderConfirmationDialogActions}
          open={deleteConfirmAlertOpen}
        >
          <Typography>Are you sure you want to delete your NodeBalancer?</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderConfirmationDialogActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          type="cancel"
          onClick={this.closeConfirmationDialog}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          data-qa-confirm-cancel
          onClick={this.onSubmitDelete}
          type="secondary"
          destructive
          loading={this.state.deleteConfirmDialog.submitting}
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  }

  closeConfirmationDialog = () => this.setState({
    deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
  });

};

const styled = withStyles(styles);

interface NodeBalancerWithConfigs extends Linode.NodeBalancer {
  configs: Linode.NodeBalancerConfig[];
}

interface WithNodeBalancers {
  nodeBalancersCount: number;
  nodeBalancersData: NodeBalancerWithConfigs[];
  nodeBalancersError?: Error;
  nodeBalancersLoading: boolean;
}

type LocalStorageProps = LocalStorageState & LocalStorageUpdater;

interface LocalStorageState {
  groupByTag: boolean;
}

interface LocalStorageUpdater {
  toggleGroupByTag: (checked: boolean) => Partial<LocalStorageState>;
  [key: string]: (...args: any[]) => Partial<LocalStorageState>;
}


const withLocalStorage = localStorageContainer<LocalStorageState, LocalStorageUpdater, {}>(
  (storage) => {
    return {
      groupByTag: storage.groupNodeBalancersByTag.get(),
    }
  },
  (storage) => ({
    toggleGroupByTag: (state) => (checked: boolean) => {
      storage.groupNodeBalancersByTag.set(checked ? 'true' : 'false');

      sendEvent({
        category: NodeBalancersLanding.eventCategory,
        action: 'group by tag',
        label: String(checked),
      });

      return {
        ...state,
        groupByTag: checked,
      }
    },
  }),
);

export const enhanced = compose<CombinedProps, {}>(
  connect((state: ApplicationState) => {
    const { __resources } = state;
    const { nodeBalancers, nodeBalancerConfigs, nodeBalancerConfigNodes } = __resources
    const { error, items, loading: nodeBalancersLoading } = nodeBalancers;
    const { loading: nodeBalancersConfigsLoading } = nodeBalancerConfigs;
    const { loading: nodeBalancerConfigNodesLoading } = nodeBalancerConfigNodes;

    return {
      nodeBalancersCount: items.length,
      nodeBalancersData: nodeBalancersWithConfigs(__resources),
      nodeBalancersError: error,
      nodeBalancersLoading: nodeBalancersLoading
        || nodeBalancersConfigsLoading
        || nodeBalancerConfigNodesLoading,
    };
  }),
  withLocalStorage,
  styled,
  withRouter,
  withNodeBalancerActions,
  SectionErrorBoundary,
  setDocs(NodeBalancersLanding.docs),
);

export default enhanced(NodeBalancersLanding);

const LoadingState = () => {
  return <CircleProgress />;
}

const RenderError = () => {
  return <ErrorState
    errorText="There was an error loading your NodeBalancers. Please try again later."
  />
}
