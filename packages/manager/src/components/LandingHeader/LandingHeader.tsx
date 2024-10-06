import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import EntityHeader, {
  HeaderProps,
} from 'src/components/EntityHeader/EntityHeader';
import { BreadcrumbProps } from '../Breadcrumb';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginLeft: theme.spacing(),
    padding: 0,
  },
}));

export interface Props extends Omit<HeaderProps, 'actions'> {
  extraActions?: JSX.Element;
  body?: JSX.Element;
  docsLink?: string;
  onAddNew?: () => void;
  createRules?: (type: string) => void;
  entity?: string;
  createButtonWidth?: number;
  createButtonText?: string;
  loading?: boolean;
  breadcrumbProps?: BreadcrumbProps;
  disabledCreateButton?: boolean;
}

/**
 * This component is essentially a variant of the more abstract EntityHeader
 * component, included as its own component because it will be used in
 * essentially this form across all entity landing pages.
 */

export const LandingHeader: React.FC<Props> = (props) => {
  const classes = useStyles();

  const {
    docsLink,
    onAddNew,
    createRules,
    entity,
    extraActions,
    createButtonWidth,
    createButtonText,
    loading,
    breadcrumbProps,
    disabledCreateButton,
  } = props;

  const defaultCreateButtonWidth = 152;

  const actions = React.useMemo(
    () => (
      <>
        {extraActions}

        {onAddNew && (
          <Button
            buttonType="primary"
            className={classes.button}
            loading={loading}
            onClick={onAddNew}
            style={{ width: createButtonWidth ?? defaultCreateButtonWidth }}
            disabled={disabledCreateButton}
          >
            {createButtonText ?? `Create ${entity}`}
          </Button>
        )}

        {createRules && (
          <>
            <Button
              buttonType="primary"
              className={classes.button}
              loading={loading}
              onClick={() => {
                createRules('inbound');
              }}
              style={{ width: createButtonWidth ?? defaultCreateButtonWidth }}
              disabled={disabledCreateButton}
            >
              Add an Inbound Rule
            </Button>

            <Button
              buttonType="primary"
              className={classes.button}
              loading={loading}
              onClick={() => {
                createRules('outbound');
              }}
              style={{ width: createButtonWidth ?? defaultCreateButtonWidth }}
              disabled={disabledCreateButton}
            >
              Add an Outbound Rule
            </Button>
          </>
        )}
      </>
    ),
    [
      extraActions,
      onAddNew,
      classes.button,
      loading,
      createButtonWidth,
      createButtonText,
      entity,
      disabledCreateButton,
    ]
  );

  return (
    <EntityHeader
      isLanding
      actions={extraActions || onAddNew || createRules ? actions : undefined}
      docsLink={docsLink}
      breadcrumbProps={breadcrumbProps}
      {...props}
    >
      {props.children}
    </EntityHeader>
  );
};

export default LandingHeader;
