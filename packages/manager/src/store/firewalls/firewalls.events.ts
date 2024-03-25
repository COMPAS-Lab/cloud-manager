import { EventStatus } from '@linode/api-v4/lib/account';
import { Dispatch } from 'redux';
import { EventHandler } from 'src/store/types';
import { getAllFirewalls } from './firewalls.requests';
import { getAllFirewallDevices } from './devices.requests';

const firewallEventsHandler: EventHandler = (event, dispatch) => {
  const { action, status, entity } = event;
  const { id } = entity;

  switch (action) {
    case 'firewall_update':
      return handleFirewallUpdate(dispatch, status);
    case 'firewall_device_add':
    case 'firewall_device_remove':
      return handleFirewallDeviceUpdate(dispatch, status, id);

    default:
      return;
  }
};

const handleFirewallUpdate = (dispatch: Dispatch<any>, status: EventStatus) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      dispatch(getAllFirewalls({}));

    default:
      return;
  }
};

const handleFirewallDeviceUpdate = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  firewallID: number
) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      dispatch(getAllFirewallDevices({ firewallID }));

    default:
      return;
  }
};

export default firewallEventsHandler;
