import { Theme, styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import BetaFeedbackIcon from 'src/assets/icons/icon-feedback.svg';
import {
  Breadcrumb,
  BreadcrumbProps,
} from 'src/components/Breadcrumb/Breadcrumb';
import { Button } from 'src/components/Button/Button';
import { DocsLink } from 'src/components/DocsLink/DocsLink';

export interface LandingHeaderProps {
  analyticsLabel?: string;
  betaFeedbackLink?: string;
  breadcrumbDataAttrs?: { [key: string]: boolean };
  breadcrumbProps?: BreadcrumbProps;
  buttonDataAttrs?: { [key: string]: boolean | string };
  createButtonText?: string;
  disabledBreadcrumbEditButton?: boolean;
  disabledCreateButton?: boolean;
  docsLabel?: string;
  docsLink?: string;
  onAddNew?: () => void;
  createRules?: (type: string) => void;
  entity?: string;
  extraActions?: JSX.Element;
  loading?: boolean;
  onButtonClick?: () => void;
  onButtonKeyPress?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  onDocsClick?: () => void;
  removeCrumbX?: number | number[];
  shouldHideDocsAndCreateButtons?: boolean;
  title?: JSX.Element | string;
}

/**
 * @note Passing a title prop will override the final `breadcrumbProps` label.
 * If you don't want this behavior, omit a title prop.
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
