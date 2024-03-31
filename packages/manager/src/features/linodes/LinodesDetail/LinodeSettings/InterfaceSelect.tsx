import { Interface, InterfacePurpose } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import useVlansQuery from 'src/queries/vlans';
/* -- Clanode Change -- */
import FormControlLabel from 'src/components/core/FormControlLabel';
import Toggle from 'src/components/Toggle';
// import TextField from 'src/components/TextField';
// import { sendLinodeCreateDocsEvent } from 'src/utilities/ga';
/* -- Clanode Change End -- */

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    margin: `${theme.spacing(2)}px ${theme.spacing()}px 0 `,
    width: `calc(100% - ${theme.spacing(2)}px)`,
  },
  vlanGrid: {
    minWidth: 450,
    '& .react-select__menu': {
      marginTop: 20,
      '& p': {
        paddingLeft: theme.spacing(),
      },
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      minWidth: 'auto',
    },
    /* -- Clanode Change -- */
    minHeight: 100,
  },
  vlanToggle: {
    marginTop: 20,
  },
  /* -- Clanode Change End -- */
  vlanLabelField: {
    width: 202,
    height: 35,
    marginRight: theme.spacing(),
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  ipamAddressLabel: {
    '& label': {
      whiteSpace: 'nowrap',
    },
    [theme.breakpoints.down('md')]: {
      width: 200,
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  configsWrapper: {
    [theme.breakpoints.down('xs')]: {
      marginTop: -theme.spacing(2),
    },
  },
}));

export interface Props {
  slotNumber: number;
  purpose: ExtendedPurpose;
  label: string | null;
  ipamAddress: string | null;
  readOnly: boolean;
  region?: string;
  labelError?: string;
  ipamError?: string;
  handleChange: (updatedInterface: ExtendedInterface) => void;
  fromAddonsPanel?: boolean;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = InterfacePurpose | 'none';
export interface ExtendedInterface extends Omit<Interface, 'purpose'> {
  purpose: ExtendedPurpose;
}

export const InterfaceSelect: React.FC<Props> = (props) => {
  const classes = useStyles();

  const {
    readOnly,
    slotNumber,
    purpose,
    label,
    ipamAddress,
    /* -- Clanode Change -- */
    // ipamError,
    labelError,
    // region,
    /* -- Clanode Change End -- */
    handleChange,
    fromAddonsPanel,
  } = props;

  /* -- Clanode Change -- */
  // const [newVlan, setNewVlan] = React.useState('');
  /* -- Clanode Change End -- */

  const purposeOptions: Item<ExtendedPurpose>[] = [
    {
      label: 'Public Internet',
      value: 'public',
    },
    {
      label: 'VLAN',
      value: 'vlan',
    },
    {
      label: 'None',
      value: 'none',
    },
  ];

  const { data: vlans, isLoading } = useVlansQuery();
  const vlanOptions =
    vlans
      /* -- Clanode Change -- */
      /*? .filter((thisVlan) => {
        // If a region is provided, only show VLANs in the target region as options
        return region ? thisVlan.region === region : true;
      })*/
      ?.map((thisVlan) => ({
        /* -- Clanode Change End -- */
        label: thisVlan.label,
        value: thisVlan.label,
      })) ?? [];

  /* -- Clanode Change -- */
  /* if (Boolean(newVlan)) {
    vlanOptions.push({ label: newVlan, value: newVlan });
  } */

  const handlePurposeChange = (selected: Item<InterfacePurpose>) => {
    const purpose = selected.value;
    handleChange({
      purpose,
      label: purpose === 'vlan' ? label : '',
      ipam_address: purpose === 'vlan' ? ipamAddress : '',
    });
  };

  /* const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({ purpose, label, ipam_address: e.target.value }); */
  const handleVlanToggle = (e: any, toggled: boolean) => {
    handleChange({
      purpose,
      ipam_address: ipamAddress,
      label: toggled ? vlanOptions[0].label : '',
    });
  };

  /*const handleLabelChange = (selected: Item<string>) =>
    handleChange({
      purpose,
      ipam_address: ipamAddress,
      label: selected?.value ?? '',
    });

  const handleCreateOption = (_newVlan: string) => {
    setNewVlan(_newVlan);
    handleChange({
      purpose,
      ipam_address: ipamAddress,
      label: _newVlan,
    });
  };*/
  /* -- Clanode Change End -- */

  return (
    <Grid container>
      {fromAddonsPanel ? null : (
        <Grid item xs={12} sm={6}>
          <Select
            options={
              // Do not display "None" as an option for eth0 (must be either Public Internet or a VLAN).
              slotNumber > 0
                ? purposeOptions
                : purposeOptions.filter(
                    (thisPurposeOption) => thisPurposeOption.value !== 'none'
                  )
            }
            label={`eth${slotNumber}`}
            value={purposeOptions.find(
              (thisOption) => thisOption.value === purpose
            )}
            onChange={handlePurposeChange}
            onCreate
            disabled={readOnly}
            isClearable={false}
          />
        </Grid>
      )}
      {purpose === 'vlan' ? (
        <Grid item xs={12} sm={6}>
          <Grid
            container
            direction={fromAddonsPanel ? 'row' : 'column'}
            className={fromAddonsPanel ? classes.vlanGrid : ''}
          >
            <Grid
              item
              className={!fromAddonsPanel ? classes.configsWrapper : ''}
              xs={12}
              sm={fromAddonsPanel ? 6 : 12}
            >
              {/* -- Clanode Change -- */}
              <FormControlLabel
                className={classes.vlanToggle}
                control={<Toggle onChange={handleVlanToggle} />}
                label={
                  labelError
                    ? labelError
                    : label
                    ? 'VLAN will be attached'
                    : 'VLAN will not be attached'
                }
                disabled={isLoading}
              />
              {/*<Select
                inputId={`vlan-label-${slotNumber}`}
                className={fromAddonsPanel ? classes.vlanLabelField : ''}
                errorText={labelError}
                options={vlanOptions}
                label="VLAN"
                placeholder="Create or select a VLAN"
                creatable
                placeholder="Select a VLAN"
                creatable={false}
                createOptionPosition="first"
                value={
                  vlanOptions.find((thisVlan) => thisVlan.value === label) ??
                  null
                }
                onChange={handleLabelChange}
                createNew={handleCreateOption}
                isClearable
                disabled={readOnly}
                noOptionsMessage={
                  () =>
                    isLoading
                      ? 'Loading...'
                      : 'You have no VLANs in this region. Type to create one.'
                }
              /> */}
              {/* -- Clanode Change End -- */}
            </Grid>
            {/* -- Clanode Change -- */
            /* <Grid
              item
              xs={12}
              sm={fromAddonsPanel ? 6 : 12}
              className={fromAddonsPanel ? '' : 'py0'}
              style={fromAddonsPanel ? {} : { marginTop: -8, marginBottom: 8 }}
            >
              <div className={fromAddonsPanel ? classes.ipamAddressLabel : ''}>
                <TextField
                  inputId={`ipam-input-${slotNumber}`}
                  label="IPAM Address"
                  disabled={readOnly}
                  errorText={ipamError}
                  onChange={handleAddressChange}
                  optional
                  placeholder="192.0.2.0/24"
                  tooltipOnMouseEnter={() =>
                    sendLinodeCreateDocsEvent('IPAM Address Tooltip Hover')
                  }
                  tooltipText={
                    'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
                  }
                  value={ipamAddress}
                />
              </div>
            </Grid> */
            /* -- Clanode Change End -- */}
          </Grid>
        </Grid>
      ) : null}

      {!fromAddonsPanel && <Divider className={classes.divider} />}
    </Grid>
  );
};

export default InterfaceSelect;
