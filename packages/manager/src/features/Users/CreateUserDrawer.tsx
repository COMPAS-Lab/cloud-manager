import { User, createUser } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle/Toggle';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

interface Props {
  onClose: () => void;
  open: boolean;
  refetch: () => void;
}

interface State {
  email: string;
  errors: APIError[];
  restricted: boolean;
  submitting: boolean;
  username: string;
}

interface CreateUserDrawerProps extends Props, RouteComponentProps<{}> {}

class CreateUserDrawer extends React.Component<CreateUserDrawerProps, State> {
  componentDidUpdate(prevProps: CreateUserDrawerProps) {
    if (this.props.open === true && prevProps.open === false) {
      this.setState({
        email: '',
        errors: [],
        restricted: false,
        submitting: false,
        username: '',
      });
    }
  }

  render() {
    const { onClose, open } = this.props;
    const { email, errors, restricted, submitting, username } = this.state;

    const hasErrorFor = getAPIErrorFor(
      { email: 'Email', username: 'Username' },
      errors
    );
    const generalError = hasErrorFor('none');

    return (
      <Drawer onClose={onClose} open={open} title="Add a User">
        {generalError && <Notice text={generalError} variant="error" />}
        <TextField
          data-qa-create-username
          errorText={hasErrorFor('username')}
          label="Username"
          onBlur={this.handleChangeUsername}
          onChange={this.handleChangeUsername}
          required
          trimmed
          value={username}
        />
        <TextField
          data-qa-create-email
          errorText={hasErrorFor('email')}
          label="Email"
          onChange={this.handleChangeEmail}
          required
          trimmed
          type="email"
          value={email}
        />
        <FormControlLabel
          control={
            <Toggle
              checked={!restricted}
              data-qa-create-restricted
              onChange={this.handleChangeRestricted}
            />
          }
          label={
            restricted
              ? `This user will have limited access to account features.
              This can be changed later.`
              : `This user will have full access to account features.
              This can be changed later.`
          }
          style={{ marginTop: 8 }}
        />
        <div style={{ marginTop: 8 }}>
          <Notice
            text="The user will be sent an email to set their password"
            variant="warning"
          />
        </div>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Add User',
            loading: submitting,
            onClick: this.onSubmit,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </Drawer>
    );
  }

  handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value,
    });
  };

  handleChangeRestricted = () => {
    this.setState({
      restricted: !this.state.restricted,
    });
  };

  handleChangeUsername = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.setState({
      username: e.target.value,
    });
  };

  onSubmit = () => {
    const {
      history: { push },
      onClose,
      refetch,
    } = this.props;
    const { email, restricted } = this.state;
    this.setState({ errors: [], submitting: true });
    createUser({ username: email, email, restricted })
      .then((user: User) => {
        this.setState({ submitting: false });
        onClose();
        if (user.restricted) {
          push(`/account/users/${email}/permissions`, {
            newUsername: user.username,
          });
        }
        refetch();
      })
      .catch((errResponse) => {
        const errors = getAPIErrorOrDefault(
          errResponse,
          'Please contact Administrator, if you are unable to add new user'
        );
        this.setState({ errors, submitting: false });
      });
  };

  onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value,
    });
  };

  onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value,
    });
  };

  onChangeRestricted = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      restricted: !this.state.restricted,
    });
  };

  render() {
    const { open, onClose } = this.props;
    const { email, restricted, errors, submitting } = this.state;

    const hasErrorFor = getAPIErrorsFor(
      { username: 'Username', email: 'Email' },
      errors
    );
    const generalError = hasErrorFor('none');

    return (
      <Drawer open={open} onClose={onClose} title="Add a User">
        {generalError && <Notice error text={generalError} />}
        {/* <TextField
          style={{display: 'none'}}
          label="Username"
          value={username}
          required
          onChange={this.onChangeUsername}
          errorText={hasErrorFor('username')}
          data-qa-create-username
        /> */}
        <TextField
          label="Email"
          type="email"
          value={email}
          required
          onChange={this.onChangeEmail}
          errorText={hasErrorFor('email')}
          data-qa-create-email
        />
        <FormControlLabel
          style={{ marginTop: 8 }}
          label={
            restricted
              ? `This user will have Manager access to account features.
              This can be changed later in User permissions.`
              : `This user will have Member access to account features.
              This can be changed later in User permissions.`
          }
          control={
            <Toggle
              checked={restricted}
              onChange={this.onChangeRestricted}
              data-qa-create-restricted
            />
          }
        />
        <div style={{ marginTop: 8 }}>
          <Notice warning text="Please input the email id of user" />
        </div>
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={this.onSubmit}
            loading={submitting}
            data-qa-submit
          >
            Add User
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

export default withRouter(CreateUserDrawer);
