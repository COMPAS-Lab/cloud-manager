import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { NavTabs } from 'src/components/NavTabs/NavTabs';

import type { NavTab } from 'src/components/NavTabs/NavTabs';

const SSHKeys = React.lazy(() => import('./SSHKeys'));
const Settings = React.lazy(
  () => import('./Settings')
); /*
const Referrals = React.lazy(() => import('./Referrals'));
const OAuthClients = React.lazy(() => import('./OAuthClients'));
const LishSettings = React.lazy(() => import('./LishSettings')); */
/* -- Clanode Change -- */ const DisplaySettings = React.lazy(
  () => import('./DisplaySettings')
); /* -- Clanode Change End -- */
/*
const AuthenticationSettings = React.lazy(
  () => import('./AuthenticationSettings')
);
const APITokens = React.lazy(() => import('./APITokens'));
*/ interface Props {
  toggleTheme: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const Profile: React.FC<CombinedProps> = (props) => {
  const {
    match: { url },
    toggleTheme,
  } = props;

  const tabs: NavTab[] = [
    {
      component: DisplaySettings,
      routeName: `${url}/display`,
      component: DisplaySettings,
    } /*
    {
      component: AuthenticationSettings,
      routeName: `${url}/auth`,
      title: 'Login & Authentication',
    },
    */ /* -- Clanode Change End -- */,
    /* -- Clanode Change -- */ {
      title: 'SSH Keys',
      routeName: `${url}/keys`,
      component: SSHKeys,
    } /*
    {
      component: LishSettings,
      routeName: `${url}/lish`,
      title: 'LISH Console Settings',
    },
    {
      component: APITokens,
      routeName: `${url}/tokens`,
      title: 'API Tokens',
    },
    {
      component: OAuthClients,
      routeName: `${url}/clients`,
      title: 'OAuth Apps',
    },
    {
      component: Referrals,
      routeName: `${url}/referrals`,
      title: 'Referrals',
    },
    */ /* -- Clanode Change End -- */,
    /* -- Clanode Change -- */ {
      title: 'My Settings',
      routeName: `${url}/settings`,
      title: 'My Settings',
    },
  ];

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="My Profile" />
      <LandingHeader removeCrumbX={1} title="My Profile" />
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};

export const ProfileLazyRoute = createLazyRoute('/profile')({
  component: Profile,
});
