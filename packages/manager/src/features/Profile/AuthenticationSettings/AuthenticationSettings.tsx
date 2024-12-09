import { Paper } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile/profile';

import { PhoneVerification } from './PhoneVerification/PhoneVerification';
import { ResetPassword } from './ResetPassword';
import { SecurityQuestions } from './SecurityQuestions/SecurityQuestions';
import { SMSMessaging } from './SMSMessaging';
import { TPAProviders } from './TPAProviders';
import TrustedDevices from './TrustedDevices';
import { TwoFactor } from './TwoFactor/TwoFactor';

export const AuthenticationSettings = () => {
  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
  } = useProfile();
  const authType = profile?.authentication_type ?? 'password';
  const twoFactor = Boolean(profile?.two_factor_auth);
  const username = profile?.username;
  const showSecuritySettings = false;

  const isThirdPartyAuthEnabled = authType !== 'password';

  const location = useLocation<{
    focusSecurityQuestions: boolean;
    focusTel: boolean;
  }>();
  const phoneNumberRef = React.createRef<HTMLInputElement>();
  const securityQuestionRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    if (!location.state) {
      return;
    }

    const { focusSecurityQuestions, focusTel } = location.state;

    // Determine the target ref based on the location state values
    const targetRef = focusTel
      ? phoneNumberRef
      : focusSecurityQuestions
      ? securityQuestionRef
      : null;

    const isValidTargetRef =
      targetRef &&
      targetRef.current &&
      !targetRef.current.getAttribute('data-scrolled');

    if (isValidTargetRef) {
      const currentTargetRef = targetRef.current;

      currentTargetRef.focus();

      // Using a short timeout here to ensure the element
      // is in the DOM before scrolling
      // TODO: Look into mutation observer to remove the need for this timeout
      setTimeout(() => {
        if (currentTargetRef) {
          currentTargetRef.scrollIntoView();
          currentTargetRef.setAttribute('data-scrolled', 'true');
        }
      }, 100);
    }
  }, [phoneNumberRef, securityQuestionRef, location.state]);

  if (profileError) {
    return <ErrorState errorText="Unable to load your profile" />;
  }

  if (profileLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Login & Authentication" />
      <TPAProviders authType={authType} />
      {showSecuritySettings ? (
        <Paper className={classes.root}>
          <Typography className={classes.linode} variant="h3">
            Security Settings
          </Typography>
          <Divider spacingTop={24} spacingBottom={16} />
          {!isThirdPartyAuthEnabled ? (
            <>
              <ResetPassword username={username} />
              <Divider spacingTop={22} spacingBottom={16} />
              <TwoFactor
                twoFactor={twoFactor}
                username={username}
                clearState={clearState}
              />
              <Divider spacingTop={22} spacingBottom={16} />
            </>
          ) : null}
          <SecurityQuestions />
          <Divider spacingTop={22} spacingBottom={16} />
          <Typography variant="h3">Phone Verification</Typography>
          <Typography variant="body1" className={classes.copy}>
            A verified phone number provides our team with a secure method of
            verifying your identity as the owner of your Linode user account.
            This phone number is only ever used to send an SMS message with a
            verification code. Standard carrier messaging fees may apply. By
            clicking Send Verification Code you are opting in to receive SMS
            messages. You may opt out at any time.{' '}
            <Link to="https://www.linode.com/docs/guides/user-security-controls#phone-verification">
              Learn more about security options.
            </Link>
          </Typography>
          <PhoneVerification />
          <Divider spacingTop={22} spacingBottom={16} />
          <Typography variant="h3">SMS Messaging</Typography>
          <SMSMessaging />
          {!isThirdPartyAuthEnabled ? (
            <>
              <Divider spacingTop={22} spacingBottom={16} />
              <TrustedDevices />
              {ipAllowlisting ? (
                <SecuritySettings
                  updateProfile={updateProfile}
                  onSuccess={onAllowlistingDisable}
                  updateProfileError={profileUpdateError || undefined}
                  ipAllowlistingEnabled={ipAllowlisting}
                  data-qa-allowlisting-form
                />
              ) : null}
            </>
          ) : null}
        </Paper>
      ) : null}
    </div>
  );
};

export const authenticationSettingsLazyRoute = createLazyRoute('/profile/auth')(
  {
    component: AuthenticationSettings,
  }
);

export const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  paddingTop: 17,
}));

export const StyledSecuritySettingsCopy = styled(Typography, {
  label: 'StyledSecuritySettingsCopy',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const StyledMainCopy = styled(Typography, {
  label: 'StyledMainCopy',
})(({ theme }) => ({
  lineHeight: '20px',
  marginTop: theme.spacing(),
  maxWidth: 960,
}));
