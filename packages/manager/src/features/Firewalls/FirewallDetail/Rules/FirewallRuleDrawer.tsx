import { Formik } from 'formik';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { Typography } from 'src/components/Typography';
import { capitalize } from 'src/utilities/capitalize';

import {
  formValueToIPs,
  getInitialFormValues,
  getInitialIPs,
  itemsToPortString,
  portStringToItems,
  validateForm,
  validateIPs,
} from './FirewallRuleDrawer.utils';
import { FirewallRuleForm } from './FirewallRuleForm';

import type {
  FirewallRuleDrawerProps,
  FormState,
} from './FirewallRuleDrawer.types';
import type {
  FirewallRuleProtocol,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import { Formik, FormikProps } from 'formik';
import { parse as parseIP, parseCIDR } from 'ipaddr.js';
import { uniq } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
/* -- Clanode Change -- */
//import FormControlLabel from 'src/components/core/FormControlLabel';
//import RadioGroup from 'src/components/core/RadioGroup';
//import Radio from 'src/components/Radio';
/* -- Clanode CHange End -- */
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect';
import { Item } from 'src/components/EnhancedSelect/Select';
import MultipleIPInput from 'src/components/MultipleIPInput/MultipleIPInput';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  addressOptions,
  allIPs,
  allIPv4,
  allIPv6,
  allowAllIPv4,
  allowAllIPv6,
  allowsAllIPs,
  firewallOptionItemsShort,
  portPresets,
  predefinedFirewallFromRule,
  protocolOptions,
} from 'src/features/Firewalls/shared';
import capitalize from 'src/utilities/capitalize';
import {
  ExtendedIP,
  stringToExtendedIP,
  ipFieldPlaceholder,
} from 'src/utilities/ipUtils';
import { ExtendedFirewallRule } from './firewallRuleEditor';
import {
  Category,
  FirewallRuleError,
  PORT_PRESETS,
  PORT_PRESETS_ITEMS,
  sortString,
} from './shared';

export type Mode = 'create' | 'edit';

export const IP_ERROR_MESSAGE = 'Must be a valid IPv4 or IPv6 range.';

// =============================================================================
// <FirewallRuleDrawer />
// =============================================================================
interface Props {
  category: Category;
  mode: Mode;
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (category: 'inbound' | 'outbound', rule: FirewallRuleType) => void;
  ruleToModify?: ExtendedFirewallRule;
}

interface Form {
  action: FirewallPolicyType;
  type: string;
  ports?: string;
  addresses: string;
  protocol: string;
  label: string;
  description: string;
}

export type CombinedProps = Props;

const FirewallRuleDrawer: React.FC<CombinedProps> = (props) => {
  const { isOpen, onClose, category, mode, ruleToModify, loading } = props;

    // Custom IPs are tracked separately from the form. The <MultipleIPs />
    // component consumes this state. We use this on form submission if the
    // `addresses` form value is "ip/netmask", which indicates the user has
    // intended to specify custom IPs.
    const [ips, setIPs] = React.useState<ExtendedIP[]>([{ address: '' }]);

    // Firewall Ports, like IPs, are tracked separately. The form.values state value
    // tracks the custom user input; the FirewallOptionItem[] array of port presets in the multi-select
    // is stored here.
    const [presetPorts, setPresetPorts] = React.useState<
      FirewallOptionItem<string>[]
    >([]);

  // Reset state. If we're in EDIT mode, set IPs to the addresses of the rule we're modifying
  // (along with any errors we may have).
  React.useEffect(() => {
    if (mode === 'edit' && ruleToModify) {
      setIPs(getInitialIPs(ruleToModify));
      setPresetPorts(portStringToItems(ruleToModify.ports)[0]);
    } else if (isOpen) {
      setPresetPorts([]);
    } else {
      setIPs([{ address: '' }]);
    }
  }, [mode, isOpen, ruleToModify]);

  React.useEffect(() => {
    if (loading === false) {
      onClose();
    }
  }, [loading]);

    const title =
      mode === 'create' ? `Add an ${capitalize(category)} Rule` : 'Edit Rule';

    const addressesLabel = category === 'inbound' ? 'source' : 'destination';

    const onValidate = ({
      addresses,
      description,
      label,
      ports,
      protocol,
    }: FormState) => {
      // The validated IPs may have errors, so set them to state so we see the errors.
      const validatedIPs = validateIPs(ips, {
        // eslint-disable-next-line sonarjs/no-duplicate-string
        allowEmptyAddress: addresses !== 'ip/netmask',
      });
      setIPs(validatedIPs);

      const _ports = itemsToPortString(presetPorts, ports);

      return {
        ...validateForm({
          addresses,
          description,
          label,
          ports: _ports,
          protocol,
        }),
        // This is a bit of a trick. If this function DOES NOT return an empty object, Formik will call
        // `onSubmit()`. If there are IP errors, we add them to the return object so Formik knows there
        // is an issue with the form.
        ...validatedIPs.filter((thisIP) => Boolean(thisIP.error)),
      };
    };

    const onSubmit = (values: FormState) => {
      const ports = itemsToPortString(presetPorts, values.ports);
      const protocol = values.protocol as FirewallRuleProtocol;
      const addresses = formValueToIPs(values.addresses, ips);

      const payload: FirewallRuleType = {
        action: values.action,
        addresses,
        ports,
        protocol,
      };

      payload.label = values.label === '' ? null : values.label;
      payload.description =
        values.description === '' ? null : values.description;

    props.onSubmit(category, payload);
    // onClose();
  };

  return (
    <Drawer title={title} open={isOpen} onClose={onClose}>
      <Formik
        initialValues={getInitialFormValues(ruleToModify)}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmit}
        validate={onValidate}
      >
        {(formikProps) => {
          return (
            <FirewallRuleForm
              category={category}
              addressesLabel={addressesLabel}
              ips={ips}
              setIPs={setIPs}
              presetPorts={presetPorts}
              setPresetPorts={setPresetPorts}
              mode={mode}
              loading={loading ? loading : false}
              ruleErrors={ruleToModify?.errors}
              {...formikProps}
            />
          );
        }}
      </Formik>
      <Typography variant="body1">
        Rule changes don&rsquo;t take effect immediately. You can add or delete
        rules before saving all your changes to this Firewall.
      </Typography>
    </Drawer>
  );
};

export default React.memo(FirewallRuleDrawer);

// =============================================================================
// <FirewallRuleForm />
// =============================================================================
const useStyles = makeStyles((theme: Theme) => ({
  ipSelect: {
    marginTop: theme.spacing(2),
  },
  actionSection: {
    marginTop: theme.spacing(2),
  },
}));

interface FirewallRuleFormProps extends FormikProps<Form> {
  ips: ExtendedIP[];
  setIPs: (ips: ExtendedIP[]) => void;
  presetPorts: Item<string>[];
  setPresetPorts: (selected: Item<string>[]) => void;
  addressesLabel: string;
  mode: Mode;
  category: Category;
  loading?: boolean;
  ruleErrors?: FirewallRuleError[];
}

const FirewallRuleForm: React.FC<FirewallRuleFormProps> = React.memo(
  (props) => {
    const classes = useStyles();

    // This will be set to `true` once a form field has been touched. This is used to disable the
    // "Submit" button unless there have been changes to the form.
    const [formTouched, setFormTouched] = React.useState<boolean>(false);

    const {
      values,
      errors,
      status,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      addressesLabel,
      ips,
      setIPs,
      presetPorts,
      setPresetPorts,
      mode,
      ruleErrors,
      setFieldError,
      touched,
      category,
      loading,
    } = props;

    const hasCustomInput = presetPorts.some(
      (thisPort) => thisPort.value === PORT_PRESETS['CUSTOM'].value
    );

    const hasSelectedAllPorts = presetPorts.some(
      (thisPort) => thisPort.value === PORT_PRESETS['ALL'].value
    );

    // If ALL is selected, don't show additional options
    // (because they won't do anything)
    const portOptions = hasSelectedAllPorts
      ? PORT_PRESETS_ITEMS.filter(
          (thisItem) => thisItem.value === PORT_PRESETS['ALL'].value
        )
      : PORT_PRESETS_ITEMS;

    // This is an edge case; if there's an error for the Ports field
    // but CUSTOM isn't selected, the error won't be visible to the user.
    const generalPortError = !hasCustomInput && errors.ports;

    // Set form field errors for each error we have (except "addresses" errors, which are handled
    // by IP Error state).
    React.useEffect(() => {
      // eslint-disable-next-line no-unused-expressions
      ruleErrors?.forEach((thisError) => {
        if (thisError.formField !== 'addresses') {
          setFieldError(thisError.formField, thisError.reason);
        }
      });
    }, [ruleErrors, setFieldError]);

    // These handlers are all memoized because the form was laggy when I tried them inline.
    const handleTypeChange = React.useCallback(
      (item: Item | null) => {
        const selectedType = item?.value;
        setFieldValue('type', selectedType);

        if (!selectedType) {
          return;
        }

        if (!formTouched) {
          setFormTouched(true);
        }

        if (!touched.label) {
          setFieldValue(
            'label',
            `${values.action.toLocaleLowerCase()}-${category}-${item?.label}`
          );
        }

        // Pre-populate other form values if selecting a pre-defined type.
        if (selectedType !== 'custom') {
          // All predefined FW types use the TCP protocol.
          setFieldValue('protocol', 'TCP');
          // All predefined FW types use all IPv4 and IPv6.
          setFieldValue('addresses', 'all');
          // Use the port for the selected type.
          setPresetPorts([PORT_PRESETS[portPresets[selectedType]]]);
        }
      },
      [
        formTouched,
        setFieldValue,
        touched,
        category,
        setPresetPorts,
        values.action,
      ]
    );

    const handleTextFieldChange = React.useCallback(
      (e: React.ChangeEvent) => {
        if (!formTouched) {
          setFormTouched(true);
        }
        handleChange(e);
      },
      [formTouched, handleChange]
    );

    const handleProtocolChange = React.useCallback(
      (item: Item | null) => {
        if (!formTouched) {
          setFormTouched(true);
        }

        setFieldValue('protocol', item?.value);
        if (item?.value === 'ICMP') {
          // Submitting the form with ICMP and defined ports causes an error
          setFieldValue('ports', '');
          setPresetPorts([]);
        }
      },
      [formTouched, setFieldValue, setPresetPorts]
    );

    const handleAddressesChange = React.useCallback(
      (item: Item | null) => {
        if (!formTouched) {
          setFormTouched(true);
        }

        setFieldValue('addresses', item?.value);
        // Reset custom IPs
        setIPs([{ address: '' }]);
      },
      [formTouched, setFieldValue, setFormTouched, setIPs]
    );
    /* -- Clanode Change -- */
    /*const handleActionChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, value: 'ACCEPT' | 'DROP') => {
        if (!formTouched) {
          setFormTouched(true);
        }

        setFieldValue('action', value);
      },
      [formTouched, setFieldValue, setFormTouched]
    ); */
    /* -- Clanode Change End -- */
    const handleIPChange = React.useCallback(
      (_ips: ExtendedIP[]) => {
        if (!formTouched) {
          setFormTouched(true);
        }
        setIPs(_ips);
      },
      [formTouched, setIPs]
    );

    const handleIPBlur = (_ips: ExtendedIP[]) => {
      const _ipsWithMasks = enforceIPMasks(_ips);

      setIPs(_ipsWithMasks);
    };

    const handlePortPresetChange = React.useCallback(
      (items: Item<string>[]) => {
        if (!formTouched) {
          setFormTouched(true);
        }
        // If the user is selecting "ALL", it doesn't make sense
        // to show additional selections.
        if (
          items.some((thisItem) => thisItem.value === PORT_PRESETS['ALL'].value)
        ) {
          setPresetPorts([PORT_PRESETS['ALL']]);
          setFieldValue('ports', '');
          return;
        }
        setPresetPorts(items);
        if (!items.some((thisItem) => thisItem.value === 'CUSTOM')) {
          setFieldValue('ports', '');
        }
      },
      [setPresetPorts, formTouched, setFieldValue]
    );

    const addressesValue = React.useMemo(() => {
      return (
        addressOptions.find(
          (thisOption) => thisOption.value === values.addresses
        ) || { label: 'All IPv4', value: 'allIPv4' }
      );
    }, [values]);

    return (
      <form onSubmit={handleSubmit}>
        {status && (
          <Notice key={status} text={status.generalError} error data-qa-error />
        )}
        <Select
          label="Preset"
          name="type"
          placeholder="Select a rule preset..."
          aria-label="Preset for firewall rule"
          options={firewallOptionItemsShort}
          onChange={handleTypeChange}
          isClearable={false}
          onBlur={handleBlur}
        />
        <TextField
          label="Label"
          name="label"
          placeholder="Enter a label..."
          aria-label="Label for firewall rule"
          value={values.label}
          errorText={errors.label}
          onChange={handleTextFieldChange}
          onBlur={handleBlur}
        />
        {
          /* -- Clanode Change -- */
          // <TextField
          //   label="Description"
          //   name="description"
          //   placeholder="Enter a description..."
          //   aria-label="Description for firewall rule"
          //   value={values.description}
          //   errorText={errors.description}
          //   onChange={handleTextFieldChange}
          //   onBlur={handleBlur}
          // />
          /* -- Clanode Change End -- */
        }
        <Select
          label="Protocol"
          name="protocol"
          placeholder="Select a protocol..."
          aria-label="Select rule protocol."
          value={
            values.protocol
              ? { label: values.protocol, value: values.protocol }
              : undefined
          }
          errorText={errors.protocol}
          options={protocolOptions}
          onChange={handleProtocolChange}
          onBlur={handleBlur}
          isClearable={false}
        />
        <Select
          isMulti
          label="Ports"
          errorText={generalPortError}
          value={presetPorts}
          options={portOptions}
          onChange={handlePortPresetChange}
          disabled={values.protocol === 'ICMP'}
          textFieldProps={{
            helperText:
              values.protocol === 'ICMP'
                ? 'Ports are not allowed for ICMP protocols.'
                : undefined,
          }}
        />
        {hasCustomInput ? (
          <TextField
            label="Custom Port Range"
            name="ports"
            placeholder="Enter a custom port range..."
            aria-label="Custom port range for firewall rule"
            value={values.ports}
            errorText={errors.ports}
            onChange={handleTextFieldChange}
            onBlur={handleBlur}
          />
        ) : null}
        <Select
          label={`${capitalize(addressesLabel)}s`}
          name="addresses"
          placeholder={`Select ${addressesLabel}s...`}
          aria-label={`Select rule ${addressesLabel}s.`}
          options={addressOptions}
          value={addressesValue}
          onChange={handleAddressesChange}
          onBlur={handleBlur}
          isClearable={false}
        />
        {/* Show this field only if "IP / Netmask has been selected." */}
        {values.addresses === 'ip/netmask' && (
          <MultipleIPInput
            title="IP / Netmask"
            aria-label="IP / Netmask for Firewall rule"
            className={classes.ipSelect}
            ips={ips}
            onChange={handleIPChange}
            onBlur={handleIPBlur}
            inputProps={{ autoFocus: true }}
            tooltip={ipNetmaskTooltipText}
            placeholder={ipFieldPlaceholder}
          />
        )}

        {/* -- Clanode Change -- */
        /*<div className={classes.actionSection}>
          <Typography>
            <strong>Action</strong>
          </Typography>
          
          <RadioGroup
            aria-label="action"
            name="action"
            value={values.action}
            onChange={handleActionChange}
            row
          >
            <FormControlLabel
              value="ACCEPT"
              label="Accept"
              control={<Radio />}
            />
            <FormControlLabel value="DROP" label="Drop" control={<Radio />} />
            <Typography style={{ paddingTop: 4 }}>
              This will take precedence over the Firewall&rsquo;s {category}{' '}
              policy.
            </Typography>
          </RadioGroup>
        </div>*/
        /* -- Clanode Change End -- */}

        <ActionsPanel>
          <Button
            buttonType="primary"
            onClick={() => handleSubmit()}
            disabled={!formTouched}
            loading={loading ? loading : false}
            data-qa-submit
          >
            {mode === 'create' ? 'Add Rule' : 'Add Changes'}
          </Button>
        </ActionsPanel>
      </form>
    );
  }
);
