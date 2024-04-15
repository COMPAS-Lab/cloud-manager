import { EventStatus } from '@linode/api-v4/lib/account';
import {
  FirewallDevice,
  getFirewallDevices,
} from '@linode/api-v4/lib/firewalls';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { Dispatch } from 'redux';
import { EventHandler } from 'src/store/types';
import { getAllFirewalls } from './firewalls.requests';
import { getAllFirewallDevices } from './devices.requests';
import { refreshLinodeFirewalls } from 'src/queries/linodeFirewalls';

const firewallEventsHandler: EventHandler = (event, dispatch) => {
  const { action, status, entity, secondary_entity } = event;
  const { id } = entity;
  const deviceId = secondary_entity?.id;

  switch (action) {
    case 'firewall_update':
      return handleFirewallUpdate(dispatch, status, id);
    case 'firewall_device_add':
    case 'firewall_device_remove':
      return handleFirewallDeviceUpdate(dispatch, status, id, deviceId);

    default:
      return;
  }
};

const handleFirewallUpdate = (
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
      dispatch(getAllFirewalls({}));
      getFirewallDevices(firewallID).then(
        (res: ResourcePage<FirewallDevice>) => {
          res.data.forEach((device: FirewallDevice) =>
            refreshLinodeFirewalls(device.id)
          );
          return res;
        }
      );

    default:
      return;
  }
};

const handleFirewallDeviceUpdate = (
  dispatch: Dispatch<any>,
  status: EventStatus,
  firewallID: number,
  deviceID?: number
) => {
  switch (status) {
    case 'failed':
    case 'finished':
    case 'notification':
    case 'scheduled':
    case 'started':
      //Force update Linode Firewalls if deviceID is given
      if (deviceID) refreshLinodeFirewalls(deviceID);
      dispatch(getAllFirewallDevices({ firewallID }));

    default:
      return;
  }
};

export default firewallEventsHandler;
