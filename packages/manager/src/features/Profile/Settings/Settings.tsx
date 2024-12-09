import { Paper } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Code } from 'src/components/Code/Code';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Stack } from 'src/components/Stack';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';
import { useMutateProfile, useProfile } from 'src/queries/profile/profile';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import { isOSMac } from 'src/utilities/userAgent';

import { PreferenceEditor } from './PreferenceEditor';

import type { ThemeChoice } from 'src/utilities/theme';

export const ProfileSettings = () => {
  const location = useLocation();
  const history = useHistory();

  const preferenceEditorOpen = Boolean(
    getQueryParamFromQueryString(location.search, 'preferenceEditor')
  );

  const handleClosePreferenceEditor = () => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete('preferenceEditor');
    history.replace({ search: queryParams.toString() });
  };

  const { data: profile } = useProfile();
  const { isPending, mutateAsync: updateProfile } = useMutateProfile();

  React.useEffect(() => {
    if (getQueryParam(window.location.search, 'preferenceEditor') === 'true') {
      setPreferenceEditorOpen(true);
    }
  }, []);

  const preferenceEditorMode =
    getQueryParam(window.location.search, 'preferenceEditor') === 'true';

  const toggle = () => {
    setSubmitting(true);

    updateProfile({ email_notifications: !profile?.email_notifications })
      .then(() => {
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitting(false);
      });
  };
  /* -- Clanode Change -- */
  const hideEmailNotifications = true;
  /* -- Clanode Change End -- */

  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment="My Settings" />
      {
        /* -- Clanode Change -- */
        !hideEmailNotifications ? (
          <Paper className={classes.root}>
            <Typography variant="h2" className={classes.title}>
              Notifications
            </Typography>
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Toggle
                      onChange={toggle}
                      checked={profile?.email_notifications}
                    />
                  }
                  label={`
                Email alerts for account activity are ${
                  profile?.email_notifications === true ? 'enabled' : 'disabled'
                }
              `}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
            {preferenceEditorMode && (
              <PreferenceEditor
                open={preferenceEditorOpen}
                onClose={() => setPreferenceEditorOpen(false)}
              />
            )}
          </Paper>
        ) : (
          <></>
        )
        /* -- Clanode Change End -- */
      }
      <Paper className={classes.root}>
        <Typography variant="h2" className={classes.title}>
          Dark Mode
        </Typography>
        <RadioGroup
          onChange={(e) =>
            updatePreferences({ theme: e.target.value as ThemeChoice })
          }
          row
          style={{ marginBottom: 0 }}
          value={preferences?.theme ?? 'system'}
        >
          <FormControlLabel control={<Radio />} label="Light" value="light" />
          <FormControlLabel control={<Radio />} label="Dark" value="dark" />
          <FormControlLabel control={<Radio />} label="System" value="system" />
        </RadioGroup>
      </Paper>
      <Paper>
        <Typography marginBottom={1} variant="h2">
          Type-to-Confirm
        </Typography>
        <Typography marginBottom={1} variant="body1">
          For some products and services, the type-to-confirm setting requires
          entering the label before deletion.
        </Typography>
        <FormControlLabel
          control={
            <Toggle
              onChange={(_, checked) =>
                updatePreferences({ type_to_confirm: checked })
              }
              checked={isTypeToConfirmEnabled}
            />
          }
          label={`Type-to-confirm is ${
            isTypeToConfirmEnabled ? 'enabled' : 'disabled'
          }`}
        />
      </Paper>
      <Paper>
        <Typography marginBottom={1} variant="h2">
          Mask Sensitive Data
        </Typography>
        <Typography marginBottom={1} variant="body1">
          Mask IP addresses and user contact information for data privacy.
        </Typography>
        <FormControlLabel
          control={
            <Toggle
              onChange={(_, checked) =>
                updatePreferences({ maskSensitiveData: checked })
              }
              checked={isSensitiveDataMasked}
            />
          }
          label={`Sensitive data is ${
            isSensitiveDataMasked ? 'masked' : 'visible'
          }`}
        />
      </Paper>
      <PreferenceEditor
        onClose={handleClosePreferenceEditor}
        open={preferenceEditorOpen}
      />
    </Stack>
  );
};

const ThemeKeyboardShortcut = (
  <>
    <Code>{isOSMac ? 'Ctrl' : 'Alt'}</Code> + <Code>Shift</Code> +{' '}
    <Code>D</Code>
  </>
);

export const SettingsLazyRoute = createLazyRoute('/profile/settings')({
  component: ProfileSettings,
});
