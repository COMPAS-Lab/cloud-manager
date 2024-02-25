import classNames from 'classnames';
import { Interface } from '@linode/api-v4/lib/linodes';
import { Tag } from '@linode/api-v4/lib/tags/types';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import DocsSidebar from 'src/components/DocsSidebar';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import TabLinkList, { Tab } from 'src/components/TabLinkList';
import { DefaultProps as ImagesProps } from 'src/containers/images.container';
import { AppsDocs } from 'src/documentation';
import {
  // getCommunityStackscripts,
  getMineAndAccountStackScripts,
} from 'src/features/StackScripts/stackScriptUtils';
import { ApplicationState } from 'src/store';
import {
  CreateTypes,
  handleChangeCreateType,
} from 'src/store/linodeCreate/linodeCreate.actions';
import { getInitialType } from 'src/store/linodeCreate/linodeCreate.reducer';
import { doesRegionSupportFeature } from 'src/utilities/doesRegionSupportFeature';
import { getErrorMap } from 'src/utilities/errorUtils';
import { filterCurrentTypes } from 'src/utilities/filterCurrentLinodeTypes';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import SelectPlanPanel from './SelectPlanPanel';
/* -- Clanode Change -- */
// import FromAppsContent from './TabbedContent/FromAppsContent';
// import FromBackupsContent from './TabbedContent/FromBackupsContent';
// import FromLinodeContent from './TabbedContent/FromLinodeContent';
/* -- Clanode Change End -- */
import FromImageContent from './TabbedContent/FromImageContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';
import { renderBackupsDisplaySection } from './TabbedContent/utils';
import { v4 } from 'uuid';
import ApiAwarenessModal from './ApiAwarenessModal';
import {
  AllFormStateAndHandlers,
  AppsData,
  HandleSubmit,
  Info,
  ReduxStateProps,
  ReduxStatePropsAndSSHKeys,
  LinodeCreateValidation,
  StackScriptFormStateHandlers,
  WithDisplayData,
  WithLinodesProps,
  WithRegionsProps,
  WithTypesProps,
  WithTypesRegionsAndImages,
} from './types';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import SMTPRestrictionText from 'src/features/linodes/SMTPRestrictionText';
import { CheckoutSummary } from 'src/components/CheckoutSummary/CheckoutSummary';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import DocsLink from 'src/components/DocsLink';
import { sendEvent } from 'src/utilities/ga';

type ClassNames =
  | 'form'
  | 'stackScriptWrapper'
  | 'imageSelect'
  | 'buttonGroup'
  | 'messageGroup'
  | 'messageGroupMaxWidth'
  | 'createButton';

const styles = (theme: Theme) =>
  createStyles({
    form: {
      width: '100%',
    },
    stackScriptWrapper: {
      '& [role="tablist"]': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(),
      },
    },
    imageSelect: {
      '& .MuiPaper-root': {
        padding: 0,
      },
    },
    buttonGroup: {
      marginTop: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'flex-end',
      },
    },
    messageGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
      flexGrow: 1,
      [(theme.breakpoints.down('sm'), theme.breakpoints.down('md'))]: {
        margin: theme.spacing(1),
      },
    },
    messageGroupMaxWidth: {
      maxWidth: '70%',
      [theme.breakpoints.down('sm')]: {
        maxWidth: 'unset',
      },
    },
    createButton: {
      [theme.breakpoints.down('md')]: {
        marginRight: theme.spacing(1),
      },
      marginLeft: theme.spacing(1),
    },
  });
interface Props {
  history: any;
  createType: CreateTypes;
  updatePassword: (password: string) => void;
  regionDisplayInfo: Info;
  imageDisplayInfo: Info;
  typeDisplayInfo: Info;
  backupsMonthlyPrice?: number | null;
  updateLinodeID: (id: number, diskSize?: number | undefined) => void;
  updateDiskSize: (size: number) => void;
  label: string;
  updateLabel: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  toggleBackupsEnabled: () => void;
  togglePrivateIPEnabled: () => void;
  updateTags: (tags: Tag[]) => void;
  handleSubmitForm: HandleSubmit;
  checkValidation: LinodeCreateValidation;
  resetCreationState: () => void;
  setBackupID: (id: number) => void;
  showGeneralError?: boolean;
  vlanLabel: string | null;
  ipamAddress: string | null;
  handleVLANChange: (updatedInterface: Interface) => void;
  showAgreement: boolean;
  showApiAwarenessModal: boolean;
  handleAgreementChange: () => void;
  handleShowApiAwarenessModal: () => void;
  signedAgreement: boolean;
}

const errorMap = [
  'backup_id',
  'image',
  'label',
  'linode_id',
  'region',
  'root_pass',
  'stackscript_id',
  'type',
  'interfaces[1].label',
  'interfaces[1].ipam_address',
];

type InnerProps = WithTypesRegionsAndImages &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  Props;

type CombinedProps = Props &
  InnerProps &
  AllFormStateAndHandlers &
  AppsData &
  ReduxStatePropsAndSSHKeys &
  SetDocsProps &
  StateProps &
  WithDisplayData &
  ImagesProps &
  WithLinodesProps &
  WithRegionsProps &
  WithStyles<ClassNames> &
  WithTypesProps &
  RouteComponentProps<{}>;

interface State {
  selectedTab: number;
  stackScriptSelectedTab: number;
  planKey: string;
}

interface CreateTab extends Tab {
  type: CreateTypes;
}

export class LinodeCreate extends React.PureComponent<
  CombinedProps & DispatchProps,
  State
> {
  constructor(props: CombinedProps & DispatchProps) {
    super(props);

    /** Get the query params as an object, excluding the "?" */
    const queryParams = getParamsFromUrl(location.search);

    const _tabs = ['Distributions', 'StackScripts', 'Snapshots'];

    /** Will be -1 if the query param is not found */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const preSelectedTab = _tabs.findIndex((eachTab, index) => {
      return eachTab === queryParams.type;
    });

    // If there is no specified "type" in the query params, update the Redux state
    // so that the correct request is made when the form is submitted.
    if (!queryParams.type) {
      this.props.setTab(this.tabs[0].type);
    }

    this.state = {
      selectedTab: preSelectedTab !== -1 ? preSelectedTab : 0,
      stackScriptSelectedTab:
        preSelectedTab === 2 && location.search.search('Community') > -1
          ? 1
          : 0,
      planKey: v4(),
    };
  }

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.props.setTab(getInitialType());
  }

  handleTabChange = (index: number) => {
    this.props.resetCreationState();

    /** set the tab in redux state */
    this.props.setTab(this.tabs[index].type);

    /** Reset the plan panel since types may have shifted */

    this.setState({
      selectedTab: index,
      planKey: v4(),
    });
  };

  filterTypes = () => {
    const { createType, typesData } = this.props;
    const { selectedTab } = this.state;
    const currentTypes = filterCurrentTypes(typesData ?? []);

    return ['fromImage', 'fromBackup'].includes(createType) && selectedTab !== 0
      ? currentTypes.filter((t) => t.class !== 'metal')
      : currentTypes;
  };

  tabs: CreateTab[] = [
    {
      title: 'Distributions',
      type: 'fromImage',
      routeName: `${this.props.match.url}?type=Distributions`,
    },
    /*{
      title: 'Marketplace',
      type: 'fromApp',
      routeName: `${this.props.match.url}?type=One-Click`,
    },*/
    {
      title: 'StackScripts',
      type: 'fromStackScript',
      routeName: `${this.props.match.url}?type=StackScripts`,
    },
    {
      title: 'Snapshots',
      type: 'fromImage',
      routeName: `${this.props.match.url}?type=Snapshots`,
    },

    // {
    //   title: 'Backups',
    //   type: 'fromBackup',
    //   routeName: `${this.props.match.url}?type=Backups`,
    // },
  ];

  stackScriptTabs: CreateTab[] = [
    {
      title: 'Account StackScripts',
      type: 'fromStackScript',
      routeName: `${this.props.match.url}?type=StackScripts&subtype=Account`,
    },
    // {
    //   title: 'Community StackScripts',
    //   type: 'fromStackScript',
    //   routeName: `${this.props.match.url}?type=StackScripts&subtype=Community`,
    // },
  ];

  componentWillUnmount() {
    this.mounted = false;
  }

  getPayload = () => {
    const selectedRegion = this.props.selectedRegionID || '';
    const regionSupportsVLANs = doesRegionSupportFeature(
      selectedRegion,
      this.props.regionsData,
      'Vlans'
    );
    const payload = {
      image: this.props.selectedImageID,
      region: this.props.selectedRegionID,
      type: this.props.selectedTypeID,
      label: this.props.label,
      tags: this.props.tags
        ? this.props.tags.map((eachTag) => eachTag.label)
        : [],
      root_pass: this.props.password,
      authorized_users: this.props.userSSHKeys
        .filter((u) => u.selected)
        .map((u) => u.username),
      booted: true,
      backups_enabled: this.props.backupsEnabled,
      backup_id: this.props.selectedBackupID,
      private_ip: this.props.privateIPEnabled,

      // StackScripts
      stackscript_id: this.props.selectedStackScriptID,
      stackscript_data: this.props.selectedUDFs,
    };

    if (
      regionSupportsVLANs &&
      this.props.selectedImageID &&
      this.props.vlanLabel
    ) {
      // Only submit interfaces in the payload if the region supports VLANs
      // and an image and VLAN have been selected.
      const interfaces = [defaultPublicInterface];
      if (Boolean(this.props.vlanLabel)) {
        interfaces.push({
          purpose: 'vlan',
          label: this.props.vlanLabel,
          ipam_address: this.props.ipamAddress,
        });
      }
      payload['interfaces'] = interfaces;
    }
    return payload;
  };

  createLinode = () => {
    const payload = this.getPayload();
    this.props.handleSubmitForm(payload, this.props.selectedLinodeID);
  };

  handleClickCreateUsingCommandLine = () => {
    const payload = {
      image: this.props.selectedImageID,
      region: this.props.selectedRegionID,
      type: this.props.selectedTypeID,
      label: this.props.label,
      tags: this.props.tags
        ? this.props.tags.map((eachTag) => eachTag.label)
        : [],
      root_pass: this.props.password,
      authorized_users: this.props.userSSHKeys
        .filter((u) => u.selected)
        .map((u) => u.username),
      booted: true,
      backups_enabled: this.props.backupsEnabled,
      backup_id: this.props.selectedBackupID,
      private_ip: this.props.privateIPEnabled,

      // StackScripts
      stackscript_id: this.props.selectedStackScriptID,
      stackscript_data: this.props.selectedUDFs,
    };
    sendEvent({
      category: 'Linode Create API CLI Awareness Modal',
      action: 'Click:Button',
      label: 'Create Using Command Line',
    });
    this.props.checkValidation(payload);
  };

  render() {
    const { selectedTab, stackScriptSelectedTab } = this.state;

    const {
      classes,
      formIsSubmitting,
      linodesData,
      linodesLoading,
      linodesError,
      imagesData,
      imageDisplayInfo,
      imagesError,
      imagesLoading,
      regionsError,
      regionsData,
      regionDisplayInfo,
      regionsLoading,
      typesData,
      typeDisplayInfo,
      typesError,
      typesLoading,
      label,
      updateLabel,
      tags,
      updateTags,
      updatePassword,
      errors,
      sshError,
      userSSHKeys,
      requestKeys,
      backupsMonthlyPrice,
      userCannotCreateLinode,
      accountBackupsEnabled,
      showGeneralError,
      showAgreement,
      showApiAwarenessModal,
      handleAgreementChange,
      handleShowApiAwarenessModal,
      signedAgreement,
      ...rest
    } = this.props;

    const hasErrorFor = getErrorMap(errorMap, errors);

    const generalError = getErrorMap(errorMap, errors).none;

    if (regionsLoading || imagesLoading || linodesLoading || typesLoading) {
      return <CircleProgress />;
    }

    if (regionsError || imagesError || linodesError || typesError) {
      return (
        <ErrorState errorText="There was an issue loading Linode creation options." />
      );
    }

    if (!linodesData || !imagesData || !regionsData || !typesData) {
      return null;
    }

    const tagsInputProps = {
      value: tags || [],
      onChange: updateTags,
      tagError: hasErrorFor.tags,
      disabled: userCannotCreateLinode,
    };

    const hasBackups = Boolean(
      this.props.backupsEnabled || accountBackupsEnabled
    );

    const displaySections = [];
    if (imageDisplayInfo) {
      displaySections.push(imageDisplayInfo);
    }

    if (regionDisplayInfo) {
      displaySections.push({
        title: regionDisplayInfo.title,
        details: regionDisplayInfo.details,
      });
    }

    if (typeDisplayInfo) {
      displaySections.push(typeDisplayInfo);
    }

    if (hasBackups && typeDisplayInfo && typeDisplayInfo.backupsMonthly) {
      displaySections.push(
        renderBackupsDisplaySection(
          accountBackupsEnabled,
          typeDisplayInfo.backupsMonthly
        )
      );
    }

    if (this.props.vlanLabel) {
      displaySections.push({
        title: 'VLAN Attached',
      });
    }

    if (this.props.privateIPEnabled) {
      displaySections.push({
        title: 'Private IP',
      });
    }

    return (
      <form className={classes.form}>
        <Grid item className="py0">
          {hasErrorFor.none && !!showGeneralError && (
            <Notice error spacingTop={8} text={hasErrorFor.none} />
          )}
          {generalError && <Notice error spacingTop={8} text={generalError} />}
          <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
          <Tabs defaultIndex={selectedTab} onChange={this.handleTabChange}>
            <TabLinkList tabs={this.tabs} />
            <TabPanels>
              <SafeTabPanel index={0}>
                <FromImageContent
                  variant="public"
                  imagePanelTitle="Choose a Distribution"
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  error={hasErrorFor.image}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              {/* -- Clanode Change -- */
              /*
              <SafeTabPanel index={1}>
                <FromAppsContent
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  // error={hasErrorFor.image}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  errors={errors}
                  {...rest}
                />
              </SafeTabPanel>
              */
              /* -- Clanode Change End */}
              <SafeTabPanel index={1}>
                <Tabs defaultIndex={stackScriptSelectedTab}>
                  <Paper className={classes.stackScriptWrapper}>
                    <Typography variant="h2">Create From:</Typography>
                    <TabLinkList tabs={this.stackScriptTabs} />
                    <TabPanels className={classes.imageSelect}>
                      <SafeTabPanel index={0}>
                        <FromStackScriptContent
                          category="account"
                          accountBackupsEnabled={accountBackupsEnabled}
                          userCannotCreateLinode={userCannotCreateLinode}
                          request={getMineAndAccountStackScripts}
                          header={'Select a StackScript'}
                          imagesData={imagesData!}
                          regionsData={regionsData!}
                          typesData={typesData!}
                          errors={errors}
                          {...rest}
                        />
                      </SafeTabPanel>
                      {/* -- Clanode Change -- */
                      /*
                      <SafeTabPanel index={1}>
                        <FromStackScriptContent
                          category="community"
                          accountBackupsEnabled={accountBackupsEnabled}
                          userCannotCreateLinode={userCannotCreateLinode}
                          request={getCommunityStackscripts}
                          header={'Select a StackScript'}
                          imagesData={imagesData!}
                          regionsData={regionsData!}
                          typesData={typesData!}
                          errors={errors}
                          {...rest}
                        />
                      </SafeTabPanel> */}
                    </TabPanels>
                  </Paper>
                </Tabs>
              </SafeTabPanel>
              <SafeTabPanel index={2}>
                <FromImageContent
                  variant={'private'}
                  imagePanelTitle="Choose a Snapshot"
                  imagesData={imagesData}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              {/* -- Clanode Change -- */
              /*
              <SafeTabPanel index={2}>
                <FromBackupsContent
                  errors={errors}
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  linodesData={linodesData!}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...restoreBackup}
                  {...rest}
                />
              </SafeTabPanel>
              <SafeTabPanel index={3}>
                <FromLinodeContent
                  errors={errors}
                  imagesData={imagesData!}
                  regionsData={regionsData!}
                  typesData={typesData!}
                  linodesData={linodesData!}
                  accountBackupsEnabled={accountBackupsEnabled}
                  userCannotCreateLinode={userCannotCreateLinode}
                  {...rest}
                />
              </SafeTabPanel>
              */
              /* -- Clanode Change End -- */}
            </TabPanels>
          </Tabs>

          {this.props.createType !== 'fromBackup' && (
            <SelectRegionPanel
              data-qa-select-region-panel
              error={hasErrorFor.region}
              regions={regionsData!}
              handleSelection={this.props.updateRegionID}
              selectedID={this.props.selectedRegionID}
              copy="Determine the best location for your server."
              updateFor={[this.props.selectedRegionID, regionsData, errors]}
              disabled={userCannotCreateLinode}
              helperText={this.props.regionHelperText}
            />
          )}
          <SelectPlanPanel
            key={this.state.planKey}
            data-qa-select-plan
            error={hasErrorFor.type}
            types={this.filterTypes()}
            onSelect={this.props.updateTypeID}
            selectedID={this.props.selectedTypeID}
            linodeID={this.props.selectedLinodeID}
            updateFor={[
              this.props.selectedTypeID,
              this.props.disabledClasses,
              this.props.createType,
              errors,
            ]}
            disabled={userCannotCreateLinode}
            disabledClasses={this.props.disabledClasses}
            isCreate
            showTransfer
            docsLink={
              <DocsLink
                href="https://www.linode.com/docs/guides/choosing-a-compute-instance-plan/"
                label="Choosing a Plan"
                onClick={() => {
                  sendEvent({
                    category: 'Linode Create Flow',
                    action: 'Click:link',
                    label: 'Choosing a Plan',
                  });
                }}
              />
            }
          />
          <LabelAndTagsPanel
            data-qa-label-and-tags-panel
            labelFieldProps={{
              label: 'Linode Label',
              value: label || '',
              onChange: updateLabel,
              errorText: hasErrorFor.label,
              disabled: userCannotCreateLinode,
            }}
            /* -- Clanode Change -- */
            /*tagsInputProps={
              this.props.createType !== 'fromLinode'
                ? tagsInputProps
                : undefined
            }*/
            tagsInputProps={{
              ...tagsInputProps,
              hide: true,
            }}
            /* -- Clanode Change End -- */
            updateFor={[tags, label, errors]}
          />
          {/* Hide for backups and clone */}
          {!['fromBackup', 'fromLinode'].includes(this.props.createType) && (
            <AccessPanel
              data-qa-access-panel
              disabled={!this.props.selectedImageID || userCannotCreateLinode}
              disabledReason={
                !this.props.selectedImageID
                  ? 'You must select an image to set a root password'
                  : ''
              }
              error={hasErrorFor.root_pass}
              sshKeyError={sshError}
              password={this.props.password}
              handleChange={this.props.updatePassword}
              updateFor={[
                this.props.password,
                errors,
                sshError,
                userSSHKeys,
                this.props.selectedImageID,
                userCannotCreateLinode,
              ]}
              users={userSSHKeys}
              requestKeys={requestKeys}
            />
          )}
          {/* <AddonsPanel
            data-qa-addons-panel
            backups={this.props.backupsEnabled}
            accountBackups={accountBackupsEnabled}
            backupsMonthly={backupsMonthlyPrice}
            privateIP={this.props.privateIPEnabled}
            changeBackups={this.props.toggleBackupsEnabled}
            changePrivateIP={this.props.togglePrivateIPEnabled}
            disabled={userCannotCreateLinode}
            selectedImageID={this.props.selectedImageID}
            selectedTypeID={this.props.selectedTypeID}
            vlanLabel={this.props.vlanLabel || ''}
            ipamAddress={this.props.ipamAddress || ''}
            handleVLANChange={this.props.handleVLANChange}
            selectedRegionID={this.props.selectedRegionID}
            labelError={hasErrorFor['interfaces[1].label']}
            ipamError={hasErrorFor['interfaces[1].ipam_address']}
            createType={this.props.createType}
        />*/}
          <CheckoutSummary
            data-qa-checkout-bar
            heading={`Summary ${this.props.label}`}
            displaySections={displaySections}
          >
            {this.props.createType === 'fromApp' &&
            this.props.documentation.length > 0 ? (
              <DocsSidebar docs={this.props.documentation} />
            ) : null}
          </CheckoutSummary>
          <Box
            display="flex"
            justifyContent={showAgreement ? 'space-between' : 'flex-end'}
            alignItems="center"
            flexWrap="wrap"
          >
            <div
              className={classNames({
                [classes.messageGroup]: true,
                [classes.messageGroupMaxWidth]: !!showAgreement,
              })}
            >
              <SMTPRestrictionText style={{ display: 'none' }}>
                {({ text }) => (
                  <Grid item xs={12}>
                    {text}
                  </Grid>
                )}
              </SMTPRestrictionText>
              {showAgreement ? (
                <EUAgreementCheckbox
                  checked={signedAgreement}
                  onChange={handleAgreementChange}
                  centerCheckbox
                />
              ) : null}
            </div>
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            className={classes.buttonGroup}
          >
            <Button
              data-qa-api-cli-linode
              buttonType="outlined"
              onClick={this.handleClickCreateUsingCommandLine}
              className={classes.createButton}
              disabled={
                formIsSubmitting ||
                userCannotCreateLinode ||
                (showAgreement && !signedAgreement)
              }
            >
              Create using command line
            </Button>
            <Button
              data-qa-deploy-linode
              buttonType="primary"
              onClick={this.createLinode}
              loading={formIsSubmitting}
              className={classes.createButton}
              disabled={
                formIsSubmitting ||
                userCannotCreateLinode ||
                (showAgreement && !signedAgreement)
              }
            >
              Create Linode
            </Button>
            <ApiAwarenessModal
              isOpen={showApiAwarenessModal}
              onClose={handleShowApiAwarenessModal}
              route={this.props.match.url}
              payLoad={this.getPayload()}
            />
          </Box>
        </Grid>
      </form>
    );
  }
}

const defaultPublicInterface: Interface = {
  purpose: 'public',
  label: '',
  ipam_address: '',
};

interface DispatchProps {
  setTab: (value: CreateTypes) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, CombinedProps> = (
  dispatch
) => ({
  setTab: (value) => dispatch(handleChangeCreateType(value)),
});

interface StateProps {
  documentation: Linode.Doc[];
}

const mapStateToProps: MapStateToProps<
  StateProps,
  CombinedProps,
  ApplicationState
> = (state) => ({
  documentation: state.documentation,
});

const generateDocs = (ownProps: InnerProps & StateProps) => {
  const { selectedStackScriptLabel } = ownProps;
  if (!!selectedStackScriptLabel) {
    const foundDocs = AppsDocs.filter((eachDoc) => {
      return eachDoc.title
        .toLowerCase()
        .includes(
          selectedStackScriptLabel
            .substr(0, selectedStackScriptLabel.indexOf(' '))
            .toLowerCase()
        );
    });
    return foundDocs.length ? foundDocs : [];
  }
  return [];
};

const updateCond = (
  prevProps: InnerProps & StateProps,
  nextProps: InnerProps & StateProps
) => {
  return prevProps.selectedStackScriptID !== nextProps.selectedStackScriptID;
};

const styled = withStyles(styles);

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = recompose<CombinedProps, InnerProps>(
  connected,
  styled,
  setDocs(generateDocs, updateCond)
);

export default enhanced(LinodeCreate);
