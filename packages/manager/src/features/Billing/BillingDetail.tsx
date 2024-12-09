import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { PAYPAL_CLIENT_ID } from 'src/constants';
import { useAccount } from 'src/queries/account/account';
import { useAllPaymentMethodsQuery } from 'src/queries/account/payment';
import { useProfile } from 'src/queries/profile/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { BillingActivityPanel } from './BillingPanels/BillingActivityPanel/BillingActivityPanel';
import BillingSummary from './BillingPanels/BillingSummary';
import ContactInfo from './BillingPanels/ContactInfoPanel';
// import PaymentInformation from './BillingPanels/PaymentInfoPanel';
import { useAllPaymentMethodsQuery } from 'src/queries/accountPayment';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { PAYPAL_CLIENT_ID } from 'src/constants';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  },
  heading: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

type CombinedProps = SetDocsProps & RouteComponentProps<{}>;

export const BillingDetail = () => {
  const {
    data: paymentMethods,
    // isLoading: paymentMethodsLoading,
    // error: paymentMethodsError,
  } = useAllPaymentMethodsQuery();

  const {
    data: account,
    error: accountError,
    isLoading: accountLoading,
  } = useAccount();

  const { data: profile } = useProfile();

  if (accountLoading) {
    return <CircleProgress />;
  }

  if (accountError) {
    const errorText = getAPIErrorOrDefault(
      accountError,
      'There was an error retrieving your account data.'
    )[0].reason;
    return <ErrorState errorText={errorText} />;
  }

  if (!account) {
    return null;
  }

  return (
    <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
      <DocumentTitleSegment segment={`Account & Billing`} />
      <div data-testid="billing-detail">
        <Grid container>
          <Grid item xs={12} md={12} lg={12} className={classes.main}>
            <BillingSummary
              paymentMethods={paymentMethods}
              balance={account?.balance ?? 0}
              promotions={account?.active_promotions}
              balanceUninvoiced={account?.balance_uninvoiced ?? 0}
            />
            <Grid container direction="row">
              <ContactInfo
                company={account.company}
                firstName={account.first_name}
                lastName={account.last_name}
                address1={account.address_1}
                address2={account.address_2}
                city={account.city}
                state={account.state}
                zip={account.zip}
                country={account.country}
                email={account.email}
                phone={account.phone}
                taxId={account.tax_id}
                history={props.history}
                /* -- Clanode Change -- */
                hide={true}
                /* -- Clanode Change End -- */
              />
              {/* <PaymentInformation
                loading={paymentMethodsLoading}
                error={paymentMethodsError}
                paymentMethods={paymentMethods}
                isAkamaiCustomer={account?.billing_source === 'akamai'}
              /> */}
            </Grid>
            <BillingActivityPanel accountActiveSince={account?.active_since} />
          </Grid>
        </Grid>
      </div>
    </PayPalScriptProvider>
  );
};

export const BillingPaper = styled(Paper)(() => ({
  height: '100%',
  padding: `15px 20px`,
}));

export const BillingBox = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

export const BillingActionButton = styled(Button)(({ theme, ...props }) => ({
  ...(!props.disabled && {
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  }),
  fontFamily: theme.font.bold,
  fontSize: '.875rem',
  minHeight: 'unset',
  minWidth: 'auto',
  padding: 0,
}));
