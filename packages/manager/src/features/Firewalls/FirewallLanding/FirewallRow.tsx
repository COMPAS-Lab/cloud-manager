import { Firewall, FirewallDevice } from '@linode/api-v4/lib/firewalls';
// import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
// import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import useFirewallDevices from 'src/hooks/useFirewallDevices';
// import capitalize from 'src/utilities/capitalize';
import ActionMenu, { ActionHandlers } from './FirewallActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    color: theme.textColors.linkActiveLight,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  labelWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
}));

export type CombinedProps = Firewall & ActionHandlers;

export const FirewallRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { id, label, status, rules, ...actionHandlers } = props;

  const {
    devices: { error, loading, lastUpdated },
    requestDevices,
  } = useFirewallDevices(id);
  // const devices = Object.values(itemsById);

  React.useEffect(() => {
    if (lastUpdated === 0 && !(loading || error.read)) {
      requestDevices();
    }
  }, [error, lastUpdated, loading, requestDevices]);

  const count = getCountOfRules(rules);

  return (
    <TableRow data-testid={`firewall-row-${id}`}>
      <TableCell>
        <Link tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </Link>
      </TableCell>
      {/* <TableCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell> */}
      <Hidden xsDown>
        <TableCell>{getRuleString(count)}</TableCell>
        {/* <TableCell>
          {getLinodesCellString(devices, loading, error.read)}
        </TableCell> */}
      </Hidden>
      <TableCell sx={{ textAlign: 'end', whiteSpace: 'nowrap' }}>
        <FirewallActionMenu
          firewallID={id}
          firewallLabel={label}
          firewallStatus={status}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
});

/**
 *
 * outputs either
 *
 * 1 Inbound / 2 Outbound
 *
 * 1 Inbound
 *
 * 3 Outbound
 */
export const getRuleString = (count: [number, number]): string => {
  const [inbound, outbound] = count;

  let string = '';

  if (inbound !== 0 && outbound !== 0) {
    return `${inbound} Inbound / ${outbound} Outbound`;
  } else if (inbound !== 0) {
    string = `${inbound} Inbound`;
  } else if (outbound !== 0) {
    string += `${outbound} Outbound`;
  }
  return string || 'No rules';
};
export const getCountOfRules = (rules: Firewall['rules']): [number, number] => {
  return [(rules.inbound || []).length, (rules.outbound || []).length];
};

// const getLinodesCellString = (
//   data: FirewallDevice[],
//   loading: boolean,
//   error?: APIError[]
// ): string | JSX.Element => {
//   if (loading) {
//     return 'Loading...';
//   }

//   if (error) {
//     return 'Error retrieving Linodes';
//   }

//   if (data.length === 0) {
//     return 'None assigned';
//   }

//   return getDeviceLinks(data);
// };

export const getDeviceLinks = (entities: FirewallDeviceEntity[]) => {
  const firstThree = entities.slice(0, 3);

  return (
    <>
      {firstThree.map((entity, idx) => (
        <React.Fragment key={entity.url}>
          {idx > 0 && ', '}
          <Link
            className="link secondaryLink"
            data-testid="firewall-row-link"
            to={`/${entity.type}s/${entity.id}`}
          >
            {entity.label}
          </Link>
        </React.Fragment>
      ))}
      {entities.length > 3 && <span>, plus {entities.length - 3} more.</span>}
    </>
  );
};
