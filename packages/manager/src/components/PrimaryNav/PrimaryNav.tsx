import { Box } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import Storage from 'src/assets/icons/entityIcons/bucket.svg';
import Database from 'src/assets/icons/entityIcons/database.svg';
import Linode from 'src/assets/icons/entityIcons/linode.svg';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import OCA from 'src/assets/icons/entityIcons/oneclick.svg';
import StackScript from 'src/assets/icons/entityIcons/stackscript.svg';
import Volume from 'src/assets/icons/entityIcons/volume.svg';
import Longview from 'src/assets/icons/longview.svg';
/* -- Clanode Change -- */
// import HelpIcon from 'src/assets/icons/get_help.svg';
// import Logo from 'src/assets/logo/logo.svg';
/* -- Clanode Change End -- */
import CompasLogo from 'src/assets/compas-logo.png';
import Chip from 'src/components/core/Chip';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import useStyles from './PrimaryNav.styles';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import usePrefetch from 'src/hooks/usePreFetch';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { linkIsActive } from './utils';

import type { PrimaryLink as PrimaryLinkType } from './PrimaryLink';

export type NavEntity =
  | 'Account'
  | 'Account'
  | 'Betas'
  | 'Cloud Load Balancers'
  | 'Dashboard'
  | 'Databases'
  | 'Domains'
  | 'Firewalls'
  | 'Help & Support'
  | 'Images'
  | 'Kubernetes'
  | 'Linodes'
  | 'Longview'
  | 'Managed'
  | 'Marketplace'
  | 'Monitor'
  | 'NodeBalancers'
  | 'Object Storage'
  | 'Placement Groups'
  | 'StackScripts'
  | 'VPC'
  | 'Volumes';

interface PrimaryLinkGroup {
  icon?: React.JSX.Element;
  links: PrimaryLinkType[];
  title?: string;
}

export interface PrimaryNavProps {
  closeMenu: () => void;
  isCollapsed: boolean;
}

export const PrimaryNav = (props: PrimaryNavProps) => {
  const { closeMenu, isCollapsed } = props;

  const flags = useFlags();
  const location = useLocation();

  const { data: accountSettings } = useAccountSettings();
  const isManaged = accountSettings?.managed ?? false;

  const { isACLPEnabled } = useIsACLPEnabled();

  const {
    data: buckets,
    isLoading: bucketsLoading,
    error: bucketsError,
  } = useObjectStorageBuckets(clusters, enableObjectPrefetch);

  const allowObjPrefetch =
    !buckets &&
    !clusters &&
    !clustersLoading &&
    !bucketsLoading &&
    !clustersError &&
    !bucketsError;

  const showDatabases = isFeatureEnabled(
    'Managed Databases',
    Boolean(flags.databases),
    account?.capabilities ?? []
  );

  /* -- Clanode Change -- */
  const showDomains = Boolean(flags.domains);
  const showKubernetes = Boolean(flags.kubernetes);
  const showNodeBalancer = Boolean(flags.nodeBalancer);
  const showObjectStorage = Boolean(flags.objectStorage);
  const showLongView = Boolean(flags.longView);
  const showMarketplace = Boolean(flags.marketplace);
  /* -- Clanode Change End -- */

  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const primaryLinkGroups: PrimaryLinkGroup[] = React.useMemo(
    () => [
      [
        {
          hide: !_isManagedAccount,
          display: 'Managed',
          href: '/managed',
          icon: <Managed />,
        },
      ],
      [
        {
          display: 'Linodes',
          href: '/linodes',
          activeLinks: ['/linodes', '/linodes/create'],
          icon: <Linode />,
        },
        {
          display: 'Volumes',
          href: '/volumes',
          icon: <Volume />,
        },
        {
          hide: !showNodeBalancer,
          display: 'NodeBalancers',
          href: '/nodebalancers',
          icon: <NodeBalancer />,
        },
        {
          display: 'Firewalls',
          href: '/firewalls',
          icon: <Firewall />,
        },
        {
          display: 'StackScripts',
          href: '/stackscripts',
          icon: <StackScript />,
        },
        {
          display: 'Images',
          href: '/images',
          activeLinks: [
            '/images/create/create-image',
            '/images/create/upload-image',
          ],
          icon: <Image />,
        },
      ],
      [
        {
          hide: !showDomains,
          display: 'Domains',
          href: '/domains',
          icon: <Domain />,
        },
        {
          hide: !showDatabases,
          display: 'Databases',
          href: '/databases',
          icon: <Database />,
          isBeta: flags.databaseBeta,
        },
        {
          hide: !showKubernetes,
          display: 'Kubernetes',
          href: '/kubernetes/clusters',
          activeLinks: ['/kubernetes/create'],
          icon: <Kubernetes />,
        },
        {
          hide: !showObjectStorage,
          display: 'Object Storage',
          href: '/object-storage/buckets',
          activeLinks: [
            '/object-storage/buckets',
            '/object-storage/access-keys',
          ],
          icon: <Storage />,
          prefetchRequestFn: prefetchObjectStorage,
          prefetchRequestCondition: allowObjPrefetch,
        },
        {
          hide: !showLongView,
          display: 'Longview',
          href: '/longview',
          icon: <Longview />,
        },
        {
          hide: !showMarketplace,
          display: 'Marketplace',
          href: '/linodes/create?type=One-Click',
          attr: { 'data-qa-one-click-nav-btn': true },
          icon: <OCA />,
        },
      ],
      [
        {
          display: 'Account',
          href: '/account',
          icon: <Account />,
        } /*
        {
          display: 'Help & Support',
          href: '/support',
          icon: <HelpIcon />,
        },
        */ /* -- Clanode Change End -- */,
        /* -- Clanode Change -- */
      ],
    ],
    [showDatabases, _isManagedAccount, allowObjPrefetch, flags.databaseBeta]
  );

  return (
    <StyledGrid
      alignItems="flex-start"
      container
      direction="column"
      id="main-navigation"
      justifyContent="flex-start"
      role="navigation"
      spacing={0}
      wrap="nowrap"
    >
      <Grid sx={{ width: '100%' }}>
        <StyledLogoBox isCollapsed={isCollapsed}>
          <Link
            aria-label="Akamai - Dashboard"
            onClick={closeMenu}
            style={{ lineHeight: 0 }}
            title="Akamai - Dashboard"
            to={`/dashboard`}
          >
            <img
              src={CompasLogo}
              width={'100%'}
              alt="COMPAS Logo"
              style={{ backgroundColor: 'transparent' }}
            />
            {/* <Logo width={115} height={43} /> */}
          </Link>
        </StyledLogoBox>
        <StyledDivider />
      </Grid>
      {primaryLinkGroups.map((linkGroup, idx) => {
        const filteredLinks = linkGroup.links.filter((link) => !link.hide);
        if (filteredLinks.length === 0) {
          return null;
        }

        const PrimaryLinks = filteredLinks.map((link) => {
          const isActiveLink = Boolean(
            linkIsActive(
              link.href,
              location.search,
              location.pathname,
              link.activeLinks
            )
          );
          if (isActiveLink) {
            activeProductFamily = linkGroup.title ?? '';
          }
          const props = {
            closeMenu,
            isActiveLink,
            isCollapsed,
            ...link,
          };
          return <PrimaryLink {...props} key={link.display} />;
        });

        return (
          <div key={idx} style={{ width: 'inherit' }}>
            {linkGroup.title ? ( // TODO: we can remove this conditional when Managed is removed
              <>
                <StyledAccordion
                  heading={
                    <>
                      {linkGroup.icon}
                      <p>{linkGroup.title}</p>
                    </>
                  }
                  isActiveProductFamily={
                    activeProductFamily === linkGroup.title
                  }
                  expanded={!collapsedAccordions.includes(idx)}
                  isCollapsed={isCollapsed}
                  onChange={() => accordionClicked(idx)}
                >
                  {PrimaryLinks}
                </StyledAccordion>
                <StyledDivider />
              </>
            ) : (
              <Box className={`StyledSingleLinkBox-${idx}`}>{PrimaryLinks}</Box>
            )}
          </div>
        );
      })}
    </StyledGrid>
  );
};

export default React.memo(PrimaryNav);
