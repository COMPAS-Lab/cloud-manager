import { InputAdornment, Paper } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import InputAdornment from 'src/components/core/InputAdornment';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
/* -- Clanode Change -- */
// import Typography from 'src/components/core/Typography';
// import Notice from 'src/components/Notice';
/* -- Clanode Change End -- */
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import ImageSelect from 'src/features/Images/ImageSelect';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import imageToItem from 'src/utilities/imageToItem';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  labelField: {
    '& input': {
      paddingLeft: 0,
    },
  },
  gridWithTips: {
    maxWidth: '50%',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      width: '100%',
    },
  },
  tips: {
    marginLeft: theme.spacing(4),
    marginTop: `${theme.spacing(4)}px !important`,
    padding: theme.spacing(4),
    backgroundColor: theme.palette.divider,
    [theme.breakpoints.down('lg')]: {
      marginLeft: 0,
    },
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(2),
    },
  },
  scriptTextarea: {
    maxWidth: '100%',
    height: 400,
    '& textarea': {
      height: '100%',
    },
  },
  revisionTextarea: {
    maxWidth: '100%',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
}));

interface TextFieldHandler {
  handler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

interface Props {
  currentUser: string;
  description: TextFieldHandler;
  disableSubmit: boolean;
  disabled?: boolean;
  errors?: APIError[];
  isSubmitting: boolean;
  label: TextFieldHandler;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSelectChange: (image: Image[]) => void;
  onSubmit: () => void;
  revision: TextFieldHandler;
  script: TextFieldHandler;
  selectedImages: string[];
}

const errorResources = {
  images: 'Images',
  label: 'A label',
  script: 'A script',
};

export const StackScriptForm = React.memo((props: Props) => {
  const {
    currentUser,
    description,
    disableSubmit,
    disabled,
    errors,
    isSubmitting,
    label,
    mode,
    onCancel,
    onSelectChange,
    onSubmit,
    revision,
    script,
    selectedImages,
  } = props;

  const hasErrorFor = getAPIErrorFor(errorResources, errors);

  return (
    <Paper sx={(theme) => ({ padding: theme.spacing(2) })}>
      <Grid container spacing={2}>
        <StyledGridWithTips>
          <StyledTextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">{currentUser} /</InputAdornment>
              ),
            }}
            data-qa-stackscript-label
            disabled={disabled}
            errorText={hasErrorFor('label')}
            label="StackScript Label"
            onChange={label.handler}
            placeholder="Enter a label"
            required
            tooltipText="StackScript labels must be between 3 and 128 characters."
            value={label.value}
          />
          <TextField
            data-qa-stackscript-description
            disabled={disabled}
            label="Description"
            multiline
            onChange={description.handler}
            placeholder="Enter a description"
            rows={1}
            value={description.value}
          />
          <ImageSelect
            textFieldProps={{
              required: true,
              tooltipText:
                'Select which images are compatible with this StackScript. "Any/All" allows you to use private images.',
            }}
            anyAllOption
            data-qa-stackscript-target-select
          />
        </Grid>
        {/* -- Clanode Change -- */
        /* <Grid item className={classes.gridWithTips}>
          <Notice className={classes.tips}>
            <Typography variant="h2">Tips</Typography>
            <Typography>
              There are four default environment variables provided to you:
            </Typography>
            <ul>
              <li>LINODE_ID</li>
              <li>LINODE_LISHUSERNAME</li>
              <li>LINODE_RAM</li>
              <li>LINODE_DATACENTERID</li>
            </ul>
          </Notice>
        </Grid> */
        /* -- Clanode Change End -- */}
      </Grid>
      <TextField
        InputProps={{ sx: { maxWidth: '100%' } }}
        data-qa-stackscript-script
        disabled={disabled}
        errorText={hasErrorFor('script')}
        label="Script"
        multiline
        onChange={script.handler}
        placeholder={`#!/bin/bash \n\n# Your script goes here`}
        required
        rows={3}
        value={script.value}
      />
      <TextField
        InputProps={{ sx: { maxWidth: '100%' } }}
        data-qa-stackscript-revision
        disabled={disabled}
        label="Revision Note"
        onChange={revision.handler}
        placeholder="Enter a revision note"
        value={revision.value}
      />
      <StyledActionsPanel
        primaryButtonProps={{
          'data-testid': 'save',
          disabled: disabled || disableSubmit,
          label: mode === 'edit' ? 'Save Changes' : 'Create StackScript',
          loading: isSubmitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          disabled,
          label: 'Reset',
          onClick: onCancel,
        }}
      />
    </Paper>
  );
});
