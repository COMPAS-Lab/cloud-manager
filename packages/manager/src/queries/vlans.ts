import { getVlans, VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import {
  useQuery,
  /* -- Clanode Change -- */
  UseQueryResult,
  /* -- Clanode Change End -- */
} from 'react-query';
import { queryPresets } from './base';

export const queryKey = 'vlans';

export const _getVlans = (): Promise<VLAN[]> =>
  getVlans().then(({ data }) => data);

export const useVlansQuery = () => {
  return useQuery<VLAN[], APIError[]>(queryKey, _getVlans, {
    ...queryPresets.longLived,
  });
};

/* -- Clanode Change -- */
interface Props {
  children: (params: UseQueryResult<VLAN[]>) => JSX.Element;
}
export const UseVlansQueryComponent: React.FC<Props> = (props) => {
  const query = useVlansQuery();
  return props.children(query);
};
/* -- Clanode Change End -- */

export default useVlansQuery;
