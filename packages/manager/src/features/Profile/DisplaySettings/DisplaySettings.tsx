import { Paper } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';

import { Divider } from 'src/components/Divider';
import { Stack } from 'src/components/Stack';
import { useProfile } from 'src/queries/profile/profile';

import { AvatarForm } from './AvatarForm';
import { EmailForm } from './EmailForm';
import { TimezoneForm } from './TimezoneForm';
import { UsernameForm } from './UsernameForm';

export const DisplaySettings: React.FC<WithNotifications> = (props) => {
  /* -- Clanode Change -- */
  const hideGravatar = true;
  const hideTimezone = true;
  const disableNameEmailChange = true;
  /* -- Clanode Change End -- */

  const classes = useStyles();

  const { mutateAsync: updateProfile } = useMutateProfile();
  const { data: profile, refetch: requestProfile } = useProfile();

  const {
    data: gravatarURL,
    error: gravatarError,
    isLoading: gravatarLoading,
  } = useAccountGravatar(profile?.email ?? '');

  const noGravatar =
    gravatarLoading || gravatarError || gravatarURL === 'not found';

  const timezone = getUserTimezone();
  const loggedInAsCustomer = useSelector(
    (state: ApplicationState) => state.authentication.loggedInAsCustomer
  );

  const location = useLocation<{ focusEmail: boolean }>();

  const emailRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    if (location.state?.focusEmail && emailRef.current) {
      emailRef.current.focus();
      emailRef.current.scrollIntoView();
    }
  }, [emailRef, location.state]);

  // Used as React keys to force-rerender forms.
  const [emailResetToken, setEmailResetToken] = React.useState(v4());
  const [usernameResetToken, setUsernameResetToken] = React.useState(v4());

  const [timezoneResetToken, setTimezoneResetToken] = React.useState(v4());

  const updateUsername = (newUsername: string) => {
    setEmailResetToken(v4());
    setTimezoneResetToken(v4());
    // Default to empty string... but I don't believe this is possible.
    return updateUser(profile?.username ?? '', {
      username: newUsername,
    });
  };

  const updateEmail = (newEmail: string) => {
    setUsernameResetToken(v4());
    // setTimezoneResetToken(v4());
    return updateProfile({ email: newEmail });
  };

  const updateTimezone = (newTimezone: string) => {
    setUsernameResetToken(v4());
    setEmailResetToken(v4());
    return updateProfile({ timezone: newTimezone });
  };
  const helpIconText = (
    <>
      Go to <Link to="https://en.gravatar.com/">gravatar.com</Link> and register
      an account using the same email address as your Linode account. Upload
      your desired profile image to your Gravatar account and it will be
      automatically linked.
    </>
  );

  return (
    <Paper>
      {
        /* -- Clanode Change -- */
        hideGravatar ? null : (
          <>
            {gravatarError ? (
              <Notice warning text={'Error retrieving Gravatar'} />
            ) : null}
            <Box className={classes.profile} display="flex">
              {noGravatar ? (
                <div className={classes.avatar}>
                  <UserIcon />
                </div>
              ) : (
                <div className={classes.avatar}>
                  <img
                    className={classes.gravatar}
                    src={gravatarURL}
                    alt="Gravatar"
                  />
                </div>
              )}
              <div>
                <Typography className={classes.profileTitle} variant="h2">
                  Profile photo
                  {noGravatar ? (
                    <HelpIcon
                      classes={{ popper: classes.tooltip }}
                      className={classes.helpIcon}
                      interactive
                      text={helpIconText}
                    />
                  ) : null}
                </Typography>
                <Typography className={classes.profileCopy} variant="body1">
                  {noGravatar
                    ? 'Create, upload, and manage your globally recognized avatar from a single place with Gravatar.'
                    : 'Edit your profile photo using Gravatar.'}
                </Typography>
                <ExternalLink
                  className={classes.addImageLink}
                  link="https://en.gravatar.com/"
                  text={noGravatar ? 'Add photo' : 'Edit photo'}
                  fixedIcon
                />
              </div>
            </Box>
            <Divider />{' '}
          </>
        )
        /* -- Clanode Change End -- */
      }
      <SingleTextFieldForm
        key={usernameResetToken}
        label="Username"
        submitForm={updateUsername}
        initialValue={profile?.username}
        disabled={
          profile?.restricted /* -- Clanode Change -- */ ||
          disableNameEmailChange /* -- Clanode Change End -- */
        }
        tooltipText={
          profile?.restricted /* -- Clanode Change -- */ ||
          disableNameEmailChange /* -- Clanode Change End -- */
            ? 'Restricted users cannot update their username. Please contact an account administrator.'
            : undefined
        }
        successCallback={requestProfile}
      />
      <Divider spacingTop={24} />
      <SingleTextFieldForm
        key={emailResetToken}
        label="Email"
        submitForm={updateEmail}
        initialValue={profile?.email}
        disabled={
          profile?.restricted /* -- Clanode Change -- */ ||
          disableNameEmailChange /* -- Clanode Change End -- */
        }
        successCallback={() => {
          // If there's a "user_email_bounce" notification for this user, and
          // the user has just updated their email, re-request notifications to
          // potentially clear the email bounce notification.
          const hasUserEmailBounceNotification = props.notifications.find(
            (thisNotification) => thisNotification.type === 'user_email_bounce'
          );
          if (hasUserEmailBounceNotification) {
            props.requestNotifications();
          }
        }}
        inputRef={emailRef}
        type="email"
      />
      {
        /* -- Clanode Change -- */
        hideTimezone ? null : (
          <>
            <Divider spacingTop={24} spacingBottom={16} />
            <TimezoneForm
              key={timezoneResetToken}
              timezone={timezone}
              loggedInAsCustomer={loggedInAsCustomer}
              updateTimezone={updateTimezone}
            />{' '}
          </>
        )
        /* -- Clanode Change End -- */
      }
    </Paper>
  );
};

export const displaySettingsLazyRoute = createLazyRoute('/profile/display')({
  component: DisplaySettings,
});
