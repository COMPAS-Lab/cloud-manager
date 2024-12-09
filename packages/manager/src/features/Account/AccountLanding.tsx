import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader, {
  LandingHeaderProps,
} from 'src/components/LandingHeader';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import TaxBanner from 'src/components/TaxBanner';
import { akamaiBillingInvoiceText } from 'src/features/Billing/billingUtils';
import { useAccount } from 'src/queries/account';
import Users from '../Users';
import { useProfile } from 'src/queries/profile';

const Billing = React.lazy(
  () => import('src/features/Billing')
); /*
const EntityTransfersLanding = React.lazy(
  () => import('src/features/EntityTransfers/EntityTransfersLanding')
);
const Users = React.lazy(() =>
  import('../Users/UsersLanding').then((module) => ({
    default: module.UsersLanding,
  }))
);
const GlobalSettings = React.lazy(() => import('./GlobalSettings'));
const MaintenanceLanding = React.lazy(
  () => import('./Maintenance/MaintenanceLanding')
);
*/ /* -- Clanode Change End -- */
/* -- Clanode Change -- */ const AccountLanding: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  /* -- Clanode Change -- */
  const { data: profile } = useProfile();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const sessionContext = React.useContext(switchAccountSessionContext);

  // const grantData = getGrantData();
  // const accountAccessGrant = grantData?.global?.account_access;
  // const readOnlyAccountAccess = accountAccessGrant === 'read_only';
  const isAkamaiAccount = account?.billing_source === 'akamai';
  /* -- Clanode Change End -- */

  const tabs = [
    {
      routeName: '/account/billing',
      title: 'Billing Info',
    },
    {
      routeName: '/account/users',
    } /*
    {
      routeName: '/account/service-transfers',
      title: 'Service Transfers',
    },
    {
      routeName: '/account/maintenance',
      title: 'Maintenance',
    },
    {
      routeName: '/account/settings',
      title: 'Settings',
    },
    */ /* -- Clanode Change End -- */,
    /* -- Clanode Change -- */
  ];

  const overrideWhitelist = [
    '/account/billing/make-payment',
    '/account/billing/add-payment-method',
    '/account/billing/edit',
  ];

  const handleAccountSwitch = () => {
    if (isParentTokenExpired) {
      return sessionContext.updateState({
        isOpen: true,
      });
    }

    setIsDrawerOpen(true);
  };

  const getDefaultTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    if (tabChoice < 0) {
      // Prevent redirect from overriding the URL change for `/account/billing/make-payment`, `/account/billing/add-payment-method`,
      // and `/account/billing/edit`
      if (!overrideWhitelist.includes(location.pathname)) {
        history.push('/account/billing');
      }

      // Redirect to the landing page if the path does not exist
      return 0;
    } else {
      return tabChoice;
    }
  };

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  /* -- Clanode Change -- */
  /*let*/ let idx = 0;

  // const isBillingTabSelected = location.pathname.match(/billing/);
  /* -- Clanode Change End -- */

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/account',
    },
  }; /*
  if (isBillingTabSelected) {
    landingHeaderProps.docsLabel = 'How Linode Billing Works';
    landingHeaderProps.docsLink =
      'https://techdocs.akamai.com/cloud-computing/docs/understanding-how-billing-works';
    landingHeaderProps.createButtonText = 'Make a Payment';
    if (!isAkamaiAccount) {
      landingHeaderProps.onButtonClick = () =>
        history.replace('/account/billing/make-payment');
    }
    landingHeaderProps.extraActions = canSwitchBetweenParentOrProxyAccount ? (
      <SwitchAccountButton
        onClick={() => {
          sendSwitchAccountEvent('Account Landing');
          handleAccountSwitch();
        }}
        data-testid="switch-account-button"
      />
    ) : undefined;
  }
  */ /* -- Clanode Change End -- */

  /* -- Clanode Change -- */ return (
    <React.Fragment>
      <DocumentTitleSegment segment="Account Settings" />
      <LandingHeader {...landingHeaderProps} />

      <Tabs index={getDefaultTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={idx}>
              <Billing />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <Users isRestrictedUser={profile?.restricted || false} />
            </SafeTabPanel>
            { /*
            <SafeTabPanel index={++idx}>
              <EntityTransfersLanding />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <MaintenanceLanding />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <GlobalSettings />
            </SafeTabPanel>
            */}
          </TabPanels>
        </React.Suspense>
      </Tabs>
      <SwitchAccountDrawer
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        userType={profile?.user_type}
      />
    </React.Fragment>
  );
};

export const accountLandingLazyRoute = createLazyRoute('/account')({
  component: AccountLanding,
});

export default AccountLanding;
