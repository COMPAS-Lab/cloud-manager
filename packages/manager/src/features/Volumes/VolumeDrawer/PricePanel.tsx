import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import DisplayPrice from 'src/components/DisplayPrice';
import { MAX_VOLUME_SIZE } from 'src/constants';
/* -- Clanode Change -- */
import { VolumeType } from '@linode/api-v4/lib/volumes';
/* -- Clanode Change End -- */

type ClassNames = 'root';

/* -- Clanode Change -- */
//const getPrice = (size: number) => {
const getPrice = (
  size: number,
  selectedType?: string,
  volumeTypes?: VolumeType[]
) => {
  const volumeType = selectedType
    ? volumeTypes?.find(
        (volumeType) => volumeType.hardware_type === selectedType
      )
    : undefined;
  const monthlyCost = volumeType ? volumeType.price.monthly : 0;
  return size * monthlyCost;
};

//const getClampedPrice = (newSize: number, currentSize: number) =>
const getClampedPrice = (
  newSize: number,
  currentSize: number,
  selectedType?: string,
  volumeTypes?: VolumeType[]
) =>
  newSize >= currentSize
    ? newSize <= MAX_VOLUME_SIZE
      ? // ? getPrice(newSize)
        getPrice(newSize, selectedType, volumeTypes)
      : // : getPrice(MAX_VOLUME_SIZE)
        getPrice(MAX_VOLUME_SIZE, selectedType, volumeTypes)
    : // : getPrice(currentSize);
      getPrice(currentSize, selectedType, volumeTypes);
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
  selectedType?: string;
  volumeTypes?: VolumeType[];
  /* -- Clanode Change End -- */
}

type CombinedProps = Props & WithStyles<ClassNames>;

const PricePanel: React.FC<CombinedProps> = ({
  currentSize,
  value,
  /* -- Clanode Change -- */
  selectedType,
  volumeTypes,
  /* -- Clanode Change End -- */
  classes,
}) => {
  /* -- Clanode Change -- */
  // const price = getClampedPrice(value, currentSize);
  const price = getClampedPrice(value, currentSize, selectedType, volumeTypes);
  /* -- Clanode Change End -- */

  return (
    <div className={classes.root}>
      <DisplayPrice price={price} interval="mo" />
    </div>
  );
};

const styled = withStyles(styles);

export default styled(PricePanel);
