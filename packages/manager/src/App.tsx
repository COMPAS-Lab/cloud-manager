import '@reach/tabs/styles.css';
import { ErrorBoundary } from '@sentry/react';
import * as React from 'react';

import {
  DocumentTitleSegment,
  withDocumentTitleProvider,
} from 'src/components/DocumentTitle';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';

import { SplashScreen } from './components/SplashScreen';
import { GoTo } from './GoTo';
import { useAdobeAnalytics } from './hooks/useAdobeAnalytics';
import { useInitialRequests } from './hooks/useInitialRequests';
import { useNewRelic } from './hooks/useNewRelic';
import { usePendo } from './hooks/usePendo';
import { MainContent } from './MainContent';
import { useEventsPoller } from './queries/events/events';
// import { Router } from './Router';
import { useSetupFeatureFlags } from './useSetupFeatureFlags';

// Ensure component's display name is 'App'
export const App = () => <BaseApp />;

const BaseApp = withDocumentTitleProvider(
  withFeatureFlagProvider(() => {
    const { isLoading } = useInitialRequests();

    const { areFeatureFlagsLoading } = useSetupFeatureFlags();

    if (isLoading || areFeatureFlagsLoading) {
      return <SplashScreen />;
    }

    return (
      <ErrorBoundary fallback={<TheApplicationIsOnFire />}>
        {/** Accessibility helper */}
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <div hidden>
          <span id="new-window">Opens in a new window</span>
          <span id="external-site">Opens an external site</span>
          <span id="external-site-new-window">
            Opens an external site in a new window
          </span>
        </div>
        <GoTo open={this.state.goToOpen} onClose={this.goToClose} />
        {/** Update the LD client with the user's id as soon as we know it */}
        <IdentifyUser />
        <DocumentTitleSegment segment="Clanode Manager" />
        {this.props.featureFlagsLoading ? null : (
          <MainContent
            history={this.props.history}
            location={this.props.location}
            toggleTheme={toggleTheme}
            appIsLoading={this.props.appIsLoading}
            isLoggedInAsCustomer={this.props.isLoggedInAsCustomer}
          />
        )}
      </React.Fragment>
    );
  }
}

interface StateProps {
  linodes: Linode[];
  images?: Image[];
  types?: string[];
  regions?: Region[];
  documentation: Linode.Doc[];
  isLoggedInAsCustomer: boolean;
  linodesLoading: boolean;
  linodesError?: APIError[];
  volumesError?: APIError[];
  nodeBalancersError?: APIError[];
  imagesError?: APIError[];
  bucketsError?: APIError[];
  notificationsError?: APIError[];
  typesError?: APIError[];
  regionsError?: APIError[];
  appIsLoading: boolean;
  euuid?: string;
  featureFlagsLoading: boolean;
}

const mapStateToProps: MapState<StateProps, Props> = (state) => ({
  linodes: Object.values(state.__resources.linodes.itemsById),
  linodesError: path(['read'], state.__resources.linodes.error),
  imagesError: path(['read'], state.__resources.images.error),
  notificationsError: state.__resources.notifications.error,
  typesError: state.__resources.types.error,
  documentation: state.documentation,
  isLoggedInAsCustomer: pathOr(
    false,
    ['authentication', 'loggedInAsCustomer'],
    state
  ),
  linodesLoading: state.__resources.linodes.loading,
  nodeBalancersError: path(['read'], state.__resources.nodeBalancers.error),
  appIsLoading: state.initialLoad.appIsLoading,
  featureFlagsLoading: state.featureFlagsLoad.featureFlagsLoading,
});

export const connected = connect(mapStateToProps);

export default compose(
  connected,
  withDocumentTitleProvider,
  withSnackbar,
  withFeatureFlagProvider,
  withFeatureFlagConsumer
)(App);

export const hasOauthError = (...args: (Error | APIError[] | undefined)[]) => {
  return args.some((eachError) => {
    const cleanedError: string | JSX.Element = pathOr(
      '',
      [0, 'reason'],
      eachError
    );
    return typeof cleanedError !== 'string'
      ? false
      : cleanedError.toLowerCase().includes('oauth');
  });
};
