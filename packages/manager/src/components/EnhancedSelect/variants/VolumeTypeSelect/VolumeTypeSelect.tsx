import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Select, { BaseSelectProps } from 'src/components/EnhancedSelect/Select';
import { VolumeType } from '@linode/api-v4/lib/volumes';

interface Props extends Omit<BaseSelectProps, 'onChange'> {
  handleSelection: (value: string) => void;
  hardwareType: string | null;
  volumeTypes: VolumeType[];
  label?: string;
  helperText?: string;
  isClearable?: boolean;
  required?: boolean;
  width?: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
}));

const VolumeTypeSelect: React.FC<Props> = (props) => {
  const {
    label,
    disabled,
    handleSelection,
    isClearable,
    helperText,
    volumeTypes,
    hardwareType,
    styles,
    required,
    width,
    ...restOfReactSelectProps
  } = props;

  const onChange = React.useCallback(
    (selection: VolumeType | null) => {
      handleSelection(selection ? selection.hardware_type : '');
    },
    [handleSelection]
  );

  const extendedVolumeTypes = volumeTypes.map((volumeType: VolumeType) => ({
    ...volumeType,
    value: volumeType.hardware_type,
  }));

  const classes = useStyles();

  return (
    <div className={classes.root} style={{ width }}>
      <Select
        isClearable={Boolean(isClearable)}
        value={
          extendedVolumeTypes.find((type) => type.value === hardwareType) ?? ''
        }
        label={label ?? 'Volume Type'}
        disabled={disabled}
        placeholder="Select a Volume Type"
        options={extendedVolumeTypes}
        onChange={onChange}
        styles={styles}
        textFieldProps={{
          tooltipText: helperText,
        }}
        required={required}
        {...restOfReactSelectProps}
      />
    </div>
  );
};

export default React.memo(VolumeTypeSelect);
