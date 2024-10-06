import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import EntityTable from 'src/components/EntityTable';
import LandingHeader from 'src/components/LandingHeader';
import { useLinodeFirewalls } from 'src/queries/linodeFirewalls';
import LinodeFirewallRow from './LinodeFirewallsRow';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import FirewallRuleDrawer, {
  Mode,
} from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer';
import {
  Category,
  parseFirewallRuleError,
  // parseFirewallRuleError,
  // parseFirewallRuleError
} from 'src/features/Firewalls/FirewallDetail/Rules/shared';
import {
  CreateFirewallPayload,
  Firewall,
  FirewallPolicyType,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls/types';
import { stripExtendedFields } from '../../../Firewalls/FirewallDetail/Rules/firewallRuleEditor';
// import { updateFirewallRules } from 'src/queries/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
// import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
// import { resetEventsPolling } from 'src/eventsPolling';
import Notice from 'src/components/Notice';
import { updateFirewallRules, useCreateFirewall } from 'src/queries/firewalls';
import { queryKey, useProfile } from 'src/queries/profile';
import { queryClient } from 'src/queries/base';
import { getLinode, getLinodeFirewalls } from '@linode/api-v4';
import { resetEventsPolling } from 'src/eventsPolling';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
interface Props {
  linodeId: number;
}

type CombinedProps = Props;

export const headers = [
  {
    label: 'Firewall',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 50,
  },
  // {
  //   label: 'Status',
  //   dataColumn: 'status',
  //   sortable: true,
  //   widthPercent: 15,
  // },
  {
    label: 'Rules',
    dataColumn: 'rules',
    sortable: false,
    widthPercent: 50,
    hideOnMobile: true,
  },
  // {
  //   label: 'Linodes',
  //   dataColumn: 'devices',
  //   sortable: false,
  //   widthPercent: 25,
  //   hideOnMobile: true,
  // },
  // {
  //   label: 'Action Menu',
  //   visuallyHidden: true,
  //   dataColumn: '',
  //   sortable: false,
  //   widthPercent: 5,
  // },
];

interface Drawer {
  mode: Mode;
  category: Category;
  isOpen: boolean;
  ruleIdx?: number;
}

const LinodeFirewallsLanding: React.FC<CombinedProps> = (props) => {
  const { linodeId } = props;
  const { data: profile } = useProfile();

  const { data, isLoading, error, dataUpdatedAt } = useLinodeFirewalls(
    linodeId
  );

  const { mutateAsync: _createFirewall } = useCreateFirewall();

  const createFirewall = (
    payload: CreateFirewallPayload
  ): Promise<Firewall> => {
    return _createFirewall(payload).then((firewall) => {
      if (profile?.restricted) {
        queryClient.invalidateQueries(`${queryKey}-grants`);
      }
      return firewall;
    });
  };

  const [ruleDrawer, setRuleDrawer] = React.useState<Drawer>({
    mode: 'create',
    category: 'inbound',
    isOpen: false,
  });

  const [firewallArray, setFirewallArray] = React.useState(
    Object.values(data?.data ?? {})
  );

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [generalErrors, setGeneralErrors] = React.useState<
    APIError[] | undefined
  >();

  const policy: {
    inbound: FirewallPolicyType;
    outbound: FirewallPolicyType;
  } = {
    inbound: 'DROP',
    outbound: 'DROP',
  };

  const applyChanges = async (
    firewallID: string,
    inbound: FirewallRuleType[],
    outbound: FirewallRuleType[]
  ) => {
    setGeneralErrors(undefined);

    // Gather rules from state for submission to the API. Keep these around,
    // because we may need to reference extended fields like "index" for error handling.

    const finalRules = {
      inbound: inbound.map(stripExtendedFields),
      outbound: outbound.map(stripExtendedFields),
      inbound_policy: policy.inbound,
      outbound_policy: policy.outbound,
    };

    try {
      await updateFirewallRules(firewallID as any, finalRules);
      setSubmitting(false);
      // Reset editor state.
      /* -- Clanode Change -- */
      resetEventsPolling();
      const firewallsOut = await getLinodeFirewalls(linodeId);
      setFirewallArray(Object.values(firewallsOut?.data ?? {}));
      /* -- Clanode Change End -- */
    } catch (err) {
      const _err = getAPIErrorOrDefault(err);

      for (const thisError of _err) {
        const parsedError = parseFirewallRuleError(thisError);

        // If we are unable to parse this error as a FirewallRuleError,
        // consider it a general error.
        if (parsedError === null) {
          setGeneralErrors((prevGeneralErrors) => [
            ...(prevGeneralErrors ?? []),
            thisError,
          ]);
        }
      }
      setSubmitting(false);
    }
  };

  const closeRuleDrawer = () => setRuleDrawer({ ...ruleDrawer, isOpen: false });

  React.useEffect(() => {
    if (firewallArray !== data?.data ?? {}) {
      setFirewallArray(Object.values(data?.data ?? {}));
    }
  }, [data]);

  if (isLoading) {
    return <CircleProgress />;
  }

  const openRuleDrawer = (category: Category, mode: Mode, idx?: number) =>
    setRuleDrawer({
      mode,
      ruleIdx: idx,
      category,
      isOpen: true,
    });

  const handleAddRule = async (category: Category, rule: FirewallRuleType) => {
    setSubmitting(true);
    const linode = await getLinode(linodeId);
    const filteredFirewalls = firewallArray.filter(
      (firewall) => firewall.label === `default-firewall-${linode.label}`
    );

    let thisFirewall: Firewall = {} as Firewall;

    if (filteredFirewalls.length > 0) {
      thisFirewall = filteredFirewalls[0];
    } else {
      thisFirewall = await createFirewall({
        label: `default-firewall-${linode.label}`,
        rules: {
          inbound_policy: policy.inbound,
          outbound_policy: policy.outbound,
        },
        devices: {
          linodes: [linodeId],
        },
      });
    }

    let inbound: any[] = [...thisFirewall.rules.inbound!];
    let outbound: any[] = [...thisFirewall.rules.outbound!];

    if (category === 'inbound') {
      if (thisFirewall.rules.inbound) {
        inbound = [...thisFirewall.rules.inbound, rule];
      } else {
        inbound = [rule];
      }
    } else {
      if (thisFirewall.rules.outbound) {
        outbound = [...thisFirewall.rules.outbound, rule];
      } else {
        outbound = [rule];
      }
    }

    applyChanges((thisFirewall.id as unknown) as string, inbound, outbound);
  };
  // We'll fall back to showing a request error in the EntityTable
  if (firewallArray.length === 0 && !error) {
    return (
      <Placeholder title={'Firewalls'} icon={FirewallIcon} isEntity>
        <Typography variant="subtitle1">
          <div>Control network access to your servers.</div>
          <Link to="/firewalls">Get started with Firewalls.</Link>
        </Typography>
      </Placeholder>
    );
  }

  const firewallRow = {
    handlers: {},
    Component: LinodeFirewallRow,
    data: firewallArray,
    loading: isLoading,
    lastUpdated: dataUpdatedAt,
    error: error ?? undefined,
  };

  return (
    <React.Fragment>
      <LandingHeader
        title="Firewalls"
        entity="Firewall"
        breadcrumbProps={{ pathname: '/firewalls' }}
        createButtonWidth={200}
        createRules={(category: Category) => {
          openRuleDrawer(category, 'create');
        }}
        // docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
      />
      {generalErrors?.length === 1 && (
        <Notice spacingTop={8} error text={generalErrors[0].reason} />
      )}
      <EntityTable
        entity="firewall"
        row={firewallRow}
        headers={headers}
        initialOrder={{ order: 'asc', orderBy: 'domain' }}
      />
      <FirewallRuleDrawer
        isOpen={ruleDrawer.isOpen}
        mode={ruleDrawer.mode}
        category={ruleDrawer.category}
        onClose={closeRuleDrawer}
        onSubmit={handleAddRule}
        loading={submitting}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(
  LinodeFirewallsLanding
);
