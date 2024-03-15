import { getVolumeTypes, VolumeType } from '@linode/api-v4/lib/volumes';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { queryClient, queryPresets } from './base';
import { defaultVolumeTypes } from '../constants';

export const volumeQueryOptions = {
  ...queryPresets.longLived,
  placeholderData: defaultVolumeTypes,
  onError: () => {
    queryClient.setQueryData('volume_types', defaultVolumeTypes);
  },
};

export const useVolumeTypesQuery = () =>
  useQuery<VolumeType[], APIError[]>(
    'volume_types',
    getVolumeTypes,
    volumeQueryOptions
  );
