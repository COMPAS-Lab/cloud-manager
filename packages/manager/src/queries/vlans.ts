import { getVlans, VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import {
  useQuery,
  /* -- Clanode Change -- */
  UseQueryResult,
  /* -- Clanode Change End -- */
} from 'react-query';
import { queryPresets } from './base';

import type { APIError, Filter, ResourcePage, VLAN } from '@linode/api-v4';

const getAllVLANs = (): Promise<VLAN[]> =>
  getAll<VLAN>((params) => getVlans(params))().then(({ data }) => data);

export const vlanQueries = createQueryKeys('vlans', {
  all: {
    queryFn: getAllVLANs,
    queryKey: null,
  },
  infinite: (filter: Filter = {}) => ({
    queryFn: ({ pageParam = 1 }) =>
      getVlans({ page: pageParam as number, page_size: 25 }, filter),
    queryKey: [filter],
  }),
});

export const useVlansQuery = () => {
  return useQuery<VLAN[], APIError[]>(vlanQueries.all);
};

export const useVLANsInfiniteQuery = (filter: Filter = {}, enabled = true) => {
  return useInfiniteQuery<ResourcePage<VLAN>, APIError[]>({
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    ...vlanQueries.infinite(filter),
    enabled,
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
