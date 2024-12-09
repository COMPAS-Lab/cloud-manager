import { Box, FormHelperText, InputAdornment } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { CircleProgress } from 'src/components/CircleProgress';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { MAX_VOLUME_SIZE } from 'src/constants';
/* -- Clanode Change -- */
import { VolumeType } from '@linode/api-v4/lib/volumes';
/* -- Clanode Change End -- */

const useStyles = makeStyles((theme: Theme) => ({
  createVolumeText: {
    display: 'block',
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(1.5),
  },
}));

interface Props {
  disabled?: boolean;
  error?: string;
  hasSelectedRegion?: boolean;
  isFromLinode?: boolean;
  name: string;
  onBlur: (e: any) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  /* -- Clanode Change -- */
  volumeTypes?: VolumeType[];
  hardwareType?: string;
  /* -- Clanode Change End -- */
  disabled?: boolean;
  error?: string;
  isFromLinode?: boolean;
  resize?: number;
  textFieldStyles?: string;
  value: number;
}

const useStyles = makeStyles()((theme: Theme) => ({
  createVolumeText: {
    display: 'block',
    marginLeft: theme.spacing(1.5),
  },
  priceDisplay: {
    '& p': {
      lineHeight: 1,
      marginTop: 4,
    },

    left: `calc(${SIZE_FIELD_WIDTH}px + ${theme.spacing(2)})`,
    position: 'absolute',
    top: 50,
  },
}));

export const SizeField = (props: Props) => {
  const { classes } = useStyles();

  const {
    error,
    hasSelectedRegion,
    isFromLinode,
    name,
    onBlur,
    onChange,
    regionId,
    resize,
    textFieldStyles,
    /* -- Clanode Change -- */
    volumeTypes,
    hardwareType,
    /* -- Clanode Change End -- */
    ...rest
  } = props;

  const { data: types, isLoading } = useVolumeTypesQuery();

  const helperText = resize
    ? `This volume can range from ${resize} GiB to ${MAX_VOLUME_SIZE} GiB in size.`
    : undefined;
  /* -- Clanode Change -- */
  const volumeType = hardwareType
    ? volumeTypes?.find(
        (volumeType) => volumeType.hardware_type === hardwareType
      )
    : undefined;
  const monthlyCost = volumeType ? volumeType.price.monthly : 0;
  const price =
    value > 0
      ? (value * monthlyCost) /* 10*/
          .toFixed(2)
      : '0.00';
  /* -- Clanode Change End -- */

  return (
    <>
      <TextField
        className={textFieldStyles}
        label="Size"
        name={name}
        value={value}
        errorText={error}
        helperText={helperText}
        InputProps={{
          endAdornment: <InputAdornment position="end"> GiB </InputAdornment>,
        }}
        onBlur={onBlur}
        onChange={onChange}
        required
        type="number"
        value={value}
        {...rest}
      />
      <FormHelperText>
        {resize || isFromLinode ? (
          'The size of the new volume in GiB.'
        ) : (
          <span className={classes.createVolumeText}>${price}/month</span>
        )}
      </FormHelperText>
    </>
  );
};
