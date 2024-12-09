import { Store, applyMiddleware, combineReducers, createStore } from 'redux';

import { State as AuthState } from 'src/store/authentication';
import authentication, {
  defaultState as authenticationDefaultState,
} from 'src/store/authentication/authentication.reducer';
import globalErrors, {
  State as GlobalErrorState,
  defaultState as defaultGlobalErrorState,
} from 'src/store/globalErrors';
import longview, {
  State as LongviewState,
  defaultState as defaultLongviewState,
} from 'src/store/longview/longview.reducer';
import longviewStats, {
  State as LongviewStatsState,
  defaultState as defaultLongviewStatsState,
} from 'src/store/longviewStats/longviewStats.reducer';

import mockFeatureFlags, {
  MockFeatureFlagState,
  defaultMockFeatureFlagState,
} from './mockFeatureFlags';
import pendingUpload, {
  State as PendingUploadState,
  defaultState as pendingUploadState,
} from './pendingUpload';
import preferences, {
  defaultState as preferencesState,
  State as PreferencesState,
} from './preferences/preferences.reducer';
import { initReselectDevtools } from './selectors';
import vlans, {
  defaultState as defaultVLANState,
  State as VlanState,
} from './vlans/vlans.reducer';

/* -- Clanode Change -- */
import firewallEvents from 'src/store/firewalls/firewalls.events';
/* -- Clanode Change End -- */

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
initReselectDevtools();

/**
 * Default State
 */
const __resourcesDefaultState = {
  accountManagement: defaultAccountManagementState,
  images: defaultImagesState,
  kubernetes: defaultKubernetesState,
  managed: defaultManagedState,
  managedIssues: defaultManagedIssuesState,
  nodePools: defaultNodePoolsState,
  linodes: defaultLinodesState,
  linodeConfigs: defaultLinodeConfigsState,
  linodeDisks: defaultLinodeDisksState,
  nodeBalancerConfigs: defaultNodeBalancerConfigState,
  nodeBalancers: defaultNodeBalancerState,
  notifications: notificationsDefaultState,
  types: defaultTypesState,
  volumes: defaultVolumesState,
  vlans: defaultVLANState,
};

export interface ResourcesState {
  accountManagement: AccountManagementState;
  images: ImagesState;
  kubernetes: KubernetesState;
  managed: ManagedState;
  managedIssues: ManagedIssuesState;
  nodePools: KubeNodePoolsState;
  linodes: LinodesState;
  linodeConfigs: LinodeConfigsState;
  linodeDisks: LinodeDisksState;
  nodeBalancerConfigs: NodeBalancerConfigsState;
  nodeBalancers: NodeBalancersState;
  notifications: NotificationsState;
  types: TypesState;
  volumes: VolumesState;
  vlans: VlanState;
}

export interface ApplicationState {
  authentication: AuthState;
  globalErrors: GlobalErrorState;
  longviewClients: LongviewState;
  longviewStats: LongviewStatsState;
  mockFeatureFlags: MockFeatureFlagState;
  pendingUpload: PendingUploadState;
}

export const defaultState: ApplicationState = {
  authentication: authenticationDefaultState,
  globalErrors: defaultGlobalErrorState,
  longviewClients: defaultLongviewState,
  longviewStats: defaultLongviewStatsState,
  mockFeatureFlags: defaultMockFeatureFlagState,
  pendingUpload: pendingUploadState,
};

/**
 * Reducers
 */
const reducers = combineReducers<ApplicationState>({
  authentication,
  globalErrors,
  longviewClients: longview,
  longviewStats,
  mockFeatureFlags,
});

const enhancers = compose(
  applyMiddleware(
    thunk,
    combineEventsMiddleware(
      linodeEvents,
      longviewEvents,
      imageEvents,
      nodeBalancerEvents,
      nodeBalancerConfigEvents,
      volumeEvents,
      diskEvents,
      linodeConfigEvents,
      /* -- Clanode Change -- */
      firewallEvents
      /* -- Clanode Change End -- */
    )
  ),
  reduxDevTools ? reduxDevTools() : (f: any) => f
) as any;

export type ApplicationStore = Store<ApplicationState>;
