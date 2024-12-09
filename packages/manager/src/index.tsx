import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { CookieWarning } from 'src/components/CookieWarning';
import { Snackbar } from 'src/components/Snackbar/Snackbar';
import { SplashScreen } from 'src/components/SplashScreen';
import 'src/exceptionReporting';
import Logout from 'src/layouts/Logout';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';

import { App } from './App';
import NullComponent from './components/NullComponent';
import { loadDevTools, shouldLoadDevTools } from './dev-tools/load';
import './index.css';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';
import { queryClientFactory } from './queries/base';
import { getRoot } from './utilities/rootManager';

const queryClient = queryClientFactory('longLived');
const store = storeFactory();

setupInterceptors(store);

const Lish = React.lazy(() => import('src/features/Lish'));
const App = React.lazy(() => import('./App'));
const Cancel = React.lazy(() => import('src/features/CancelLanding'));
const LoginPage = React.lazy(() => import('src/layouts/LoginPage'));
const LoginAsCustomerCallback = React.lazy(
  () => import('src/layouts/LoginAsCustomerCallback')
);
const OAuthPage = React.lazy(() => import('src/layouts/OAuthPage'));
const OAuthCallbackPage = React.lazy(() => import('src/layouts/OAuth'));

/*
 * Initialize Analytic and Google Tag Manager
 */
initAnalytics(isProductionBuild, GA_ID);

initTagManager(GTM_ID);

const renderNullAuth = () => <span>null auth route</span>;

const renderNull = () => <span>null route</span>;

const renderLish = () => (
  <LinodeThemeWrapper>{() => <Lish />}</LinodeThemeWrapper>
);

const renderApp = (props: RouteComponentProps) => (
  <QueryClientProvider client={queryClient}>
    <SplashScreen />
    <LinodeThemeWrapper>
      {(toggle) => (
        <SnackBar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          maxSnack={3}
          autoHideDuration={4000}
          data-qa-toast
          hideIconVariant={true}
        >
          <App
            toggleTheme={toggle}
            location={props.location}
            history={props.history}
          />
        </SnackBar>
      )}
    </LinodeThemeWrapper>
    <ReactQueryDevtools
      initialIsOpen={false}
      toggleButtonProps={{ style: { marginLeft: '3em' } }}
    />
  </QueryClientProvider>
);

const renderCancel = () => (
  <LinodeThemeWrapper>
    <Cancel />
  </LinodeThemeWrapper>
);

const renderAuthentication = () => (
  <React.Suspense fallback={<SplashScreen />}>
    <Switch>
      <Route path="/login" component={LoginPage} />
      {/* Route that makes GET request to server /oauth/callback */}
      <Route exact path="/oauth/authorize" component={OAuthPage} />
      <Route exact path="/oauth/callback" component={OAuthCallbackPage} />
      <Route exact path="/admin/callback" component={LoginAsCustomerCallback} />
      {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
      <Route exact path="/nullauth" render={renderNullAuth} />
      <Route exact path="/logout" component={Logout} />
      <Route exact path="/cancel" render={renderCancel} />
      <AuthenticationWrapper>
        <Switch>
          <Route path="/linodes/:linodeId/lish" render={renderLish} />
          <Route render={renderApp} />
        </Switch>
      </AuthenticationWrapper>
    </Switch>
  </React.Suspense>
);

// Thanks to https://kentcdodds.com/blog/make-your-own-dev-tools
//
// Load dev tools if need be.
loadDevTools(() => {
  ReactDOM.render(
    navigator.cookieEnabled ? (
      <Provider store={store}>
        <Router>
          <Switch>
            {/* A place to go that prevents the app from loading while injecting OAuth tokens */}
            <Route exact path="/null" render={renderNull} />
            <Route render={renderAuthentication} />
          </Switch>
        </Router>
      </Provider>
    ) : (
      <CookieWarning />
    ),
    document.getElementById('root') as HTMLElement
  );
});

if (module.hot && !isProductionBuild) {
  module.hot.accept();
}
