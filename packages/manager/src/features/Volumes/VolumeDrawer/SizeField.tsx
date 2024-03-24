import * as React from 'react';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField from 'src/components/TextField';
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
  name: string;
  value: number;
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
}

type CombinedProps = Props;

const SizeField: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    name,
    value,
    error,
    onBlur,
    onChange,
    isFromLinode,
    resize,
    textFieldStyles,
    /* -- Clanode Change -- */
    volumeTypes,
    hardwareType,
    /* -- Clanode Change End -- */
    ...rest
  } = props;

  const helperText = resize
    ? `This volume can range from ${resize} GB to ${MAX_VOLUME_SIZE} GB in size.`
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
          endAdornment: <InputAdornment position="end"> GB </InputAdornment>,
        }}
        onBlur={onBlur}
        onChange={onChange}
        required
        type="number"
        data-qa-size
        {...rest}
      />
      <FormHelperText>
        {resize || isFromLinode ? (
          'The size of the new volume in GB.'
        ) : (
          <span className={classes.createVolumeText}>${price}/month</span>
        )}
      </FormHelperText>
    </>
  );
};

export default SizeField;
