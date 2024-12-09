import * as React from 'react';

import { Link } from 'src/components/Link';
import { TextField, TextFieldProps } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

export interface TypeToConfirmProps extends Omit<TextFieldProps, 'onChange'> {
  confirmationText?: JSX.Element | string;
  hideInstructions?: boolean;
  onChange: (value: string) => void;
  textFieldStyle?: React.CSSProperties;
  title?: string;
  typographyStyle?: React.CSSProperties;
  visible?: boolean | undefined;
}

export const TypeToConfirm = (props: TypeToConfirmProps) => {
  const {
    confirmationText,
    hideInstructions,
    onChange,
    textFieldStyle,
    title,
    typographyStyle,
    visible,
    ...rest
  } = props;
  const classes = useStyles();

  if (visible !== false) {
    const preferenceToggle = (
      <PreferenceToggle<boolean>
        preferenceKey="type_to_confirm"
        preferenceOptions={[true, false]}
        localStorageKey="typeToConfirm"
      >
        {({
          preference: istypeToConfirm,
          togglePreference: toggleTypeToConfirm,
        }: ToggleProps<boolean>) => {
          return (
            <Grid container alignItems="center">
              <Grid item xs={12} style={{ marginLeft: 2 }}>
                <FormControlLabel
                  control={
                    <CheckBox
                      onChange={toggleTypeToConfirm}
                      checked={!istypeToConfirm}
                      inputProps={{
                        'aria-label': `Disable type-to-confirm`,
                      }}
                    />
                  }
                  label="Disable type-to-confirm"
                />
              </Grid>
            </Grid>
          );
        }}
      </PreferenceToggle>
    );
    return (
      <>
        <Typography variant="h2">{title}</Typography>
        <Typography style={typographyStyle}>{confirmationText}</Typography>
        <TextField
          label={label}
          hideLabel={hideLabel}
          onChange={(e) => onChange(e.target.value)}
          style={textFieldStyle}
          {...rest}
        />
        {!hideDisable && preferenceToggle}
      </>
    );
  } else {
    return (
      <Typography className={classes.description}>
        To enable type-to-confirm, go to{' '}
        <Link to="/profile/settings">My Settings</Link>.
      </Typography>
    );
  }
};

export default TypeToConfirm;
