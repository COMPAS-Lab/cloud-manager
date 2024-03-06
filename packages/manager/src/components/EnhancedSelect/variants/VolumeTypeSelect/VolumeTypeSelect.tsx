import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Select, { BaseSelectProps } from 'src/components/EnhancedSelect/Select';
import { ExtendedVolumeType, volumeTypes } from 'src/constants'; // Adjust the import path as necessary

interface Props extends Omit<BaseSelectProps, 'onChange'> {
  handleSelection: (value: string) => void;
  selectedType: string | null;
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
    selectedType,
    styles,
    required,
    width,
    ...restOfReactSelectProps
  } = props;

  const onChange = React.useCallback(
    (selection: ExtendedVolumeType | null) => {
      handleSelection(selection ? selection.value : '');
    },
    [handleSelection]
  );

  const classes = useStyles();

  return (
    <div className={classes.root} style={{ width }}>
      <Select
        isClearable={Boolean(isClearable)}
        value={volumeTypes.find((type) => type.value === selectedType) ?? ''}
        label={label ?? 'Volume Type'}
        disabled={disabled}
        placeholder="Select a Volume Type"
        options={volumeTypes}
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
