import { Box } from '@linode/ui';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { MAX_VOLUME_SIZE } from 'src/constants';
/* -- Clanode Change -- */
import { VolumeType } from '@linode/api-v4/lib/volumes';
/* -- Clanode Change End -- */

type ClassNames = 'root';

/* -- Clanode Change -- */
//const getPrice = (size: number) => {
const getPrice = (
  size: number,
  hardwareType?: string,
  volumeTypes?: VolumeType[]
) => {
  const volumeType = hardwareType
    ? volumeTypes?.find(
        (volumeType) => volumeType.hardware_type === hardwareType
      )
    : undefined;
  const monthlyCost = volumeType ? volumeType.price.monthly : 0;
  return size * monthlyCost;
};

//const getClampedPrice = (newSize: number, currentSize: number) =>
const getClampedPrice = (
  newSize: number,
  currentSize: number,
  hardwareType?: string,
  volumeTypes?: VolumeType[]
) =>
  newSize >= currentSize
    ? newSize <= MAX_VOLUME_SIZE
      ? // ? getPrice(newSize)
        getPrice(newSize, hardwareType, volumeTypes)
      : // : getPrice(MAX_VOLUME_SIZE)
        getPrice(MAX_VOLUME_SIZE, hardwareType, volumeTypes)
    : // : getPrice(currentSize);
      getPrice(currentSize, hardwareType, volumeTypes);
/* -- Clanode Change End -- */

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(4),
    },
  });

interface Props {
  value: number;
  currentSize: number;
  /* -- Clanode Change -- */
  hardwareType?: string;
  volumeTypes?: VolumeType[];
  /* -- Clanode Change End -- */
}

type CombinedProps = Props & WithStyles<ClassNames>;

const PricePanel: React.FC<CombinedProps> = ({
  currentSize,
  value,
  /* -- Clanode Change -- */
  hardwareType,
  volumeTypes,
  /* -- Clanode Change End -- */
  classes,
}) => {
  /* -- Clanode Change -- */
  // const price = getClampedPrice(value, currentSize);
  const price = getClampedPrice(value, currentSize, hardwareType, volumeTypes);
  /* -- Clanode Change End -- */

  return (
    <Box marginTop={2}>
      <DisplayPrice interval="mo" price={price ? Number(price) : '--.--'} />
    </Box>
  );
};
