import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { prop, uniqBy } from 'ramda';
import * as React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import Undo from 'src/assets/icons/undo.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Hidden } from 'src/components/Hidden';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { Typography } from 'src/components/Typography';
import {
  generateAddressesLabel,
  generateRuleLabel,
  predefinedFirewallFromRule as ruleToPredefinedFirewall,
} from 'src/features/Firewalls/shared';
import { capitalize } from 'src/utilities/capitalize';

import { FirewallRuleActionMenu } from './FirewallRuleActionMenu';
import {
  MoreStyledLinkButton,
  StyledButtonDiv,
  StyledDragIndicator,
  StyledErrorDiv,
  StyledFirewallRuleBox,
  StyledFirewallRuleButton,
  StyledFirewallTableButton,
  StyledHeaderDiv,
  StyledInnerBox,
  StyledUl,
  StyledUlBox,
  sxBox,
  sxItemSpacing,
} from './FirewallRuleTable.styles';
import { sortPortString } from './shared';

import type { FirewallRuleDrawerMode } from './FirewallRuleDrawer.types';
import type { ExtendedFirewallRule, RuleStatus } from './firewallRuleEditor';
import type { Category, FirewallRuleError } from './shared';
import type { FirewallPolicyType } from '@linode/api-v4/lib/firewalls/types';
import type { Theme } from '@mui/material/styles';
import type { DropResult } from 'react-beautiful-dnd';
import type { FirewallOptionItem } from 'src/features/Firewalls/shared';

interface RuleRow {
  action?: string;
  addresses: string;
  description?: null | string;
  errors?: FirewallRuleError[];
  id: number;
  label?: null | string;
  originalIndex: number;
  ports: string;
  protocol: string;
  status: RuleStatus;
  type: string;
}

// =============================================================================
// <FirewallRuleTable />
// =============================================================================

interface RowActionHandlers {
  triggerCloneFirewallRule: (idx: number) => void;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
  triggerReorder: (startIdx: number, endIdx: number) => void;
  triggerUndo: (idx: number) => void;
}

interface FirewallRuleTableProps extends RowActionHandlers {
  category: Category;
  disabled: boolean;
  handlePolicyChange: (
    category: Category,
    newPolicy: FirewallPolicyType
  ) => void;
  openRuleDrawer: (category: Category, mode: FirewallRuleDrawerMode) => void;
  policy: FirewallPolicyType;
  rulesWithStatus: ExtendedFirewallRule[];
}

export const FirewallRuleTable = (props: FirewallRuleTableProps) => {
  const {
    category,
    disabled,
    handlePolicyChange,
    openRuleDrawer,
    policy,
    rulesWithStatus,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    triggerReorder,
    triggerUndo,
  } = props;

  const theme: Theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('sm'));

  const addressColumnLabel =
    category === 'inbound' ? 'sources' : 'destinations';

  const rowData = firewallRuleToRowData(rulesWithStatus);

  const openDrawerForCreating = React.useCallback(() => {
    openRuleDrawer(category, 'create');
  }, [openRuleDrawer, category]);

  const zeroRulesMessage = `No ${category} rules have been added.`;

  const screenReaderMessage =
    'Some screen readers may require you to enter focus mode to interact with firewall rule list items. In focus mode, press spacebar to begin a drag or tab to access item actions.';

  const onDragEnd = (result: DropResult) => {
    if (result.destination) {
      triggerReorder(result.source.index, result.destination?.index);
    }
  };

  const onPolicyChange = (newPolicy: FirewallPolicyType) => {
    handlePolicyChange(category, newPolicy);
  };

  return (
    <>
      <StyledHeaderDiv>
        <Typography variant="h2">{`${capitalize(category)} Rules`}</Typography>
        <StyledFirewallTableButton
          buttonType="primary"
          disabled={disabled}
          onClick={openDrawerForCreating}
        >
          Add an {capitalize(category)} Rule
        </Button>
      </div>
      <Table style={{ tableLayout: 'auto' }}>
        <TableHead>
          <TableRow>
            <TableCell
              style={{ paddingLeft: 27, width: xsDown ? '50%' : '30%' }}
            >
              Label
            </TableCell>
            <Hidden mdDown>
              <TableCell style={{ width: '10%' }}>Protocol</TableCell>
            </Hidden>
            <Hidden xsDown>
              <TableCell style={{ whiteSpace: 'nowrap', width: '10%' }}>
                Port Range
              </TableCell>
              <TableCell style={{ width: '15%' }}>
                {capitalize(addressColumnLabel)}
              </TableCell>
            </Hidden>
            <TableCell style={{ width: '5%' }}>Action</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" isDropDisabled={disabled}>
            {(provided) => (
              <TableBody
                {...provided.droppableProps}
                className={classes.table}
                innerRef={provided.innerRef}
              >
                {rowData.length === 0 ? (
                  <TableRowEmptyState colSpan={6} message={zeroRulesMessage} />
                ) : (
                  rowData.map((thisRuleRow: RuleRow, index) => (
                    <Draggable
                      key={thisRuleRow.id}
                      draggableId={String(thisRuleRow.id)}
                      index={index}
                      /* -- Clanode Change -- */
                      isDragDisabled={true}
                      /* -- Clanode Change End -- */
                    >
                      {(provided, snapshot) => {
                        return (
                          <FirewallRuleTableRow
                            isDragging={snapshot.isDragging}
                            disabled={disabled}
                            key={thisRuleRow.id}
                            ref={provided.innerRef}
                            role="option"
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FirewallRuleTableRow
                              triggerCloneFirewallRule={
                                triggerCloneFirewallRule
                              }
                              triggerDeleteFirewallRule={
                                triggerDeleteFirewallRule
                              }
                              triggerOpenRuleDrawerForEditing={
                                triggerOpenRuleDrawerForEditing
                              }
                              disabled={disabled}
                              triggerUndo={triggerUndo}
                              {...thisRuleRow}
                            />
                          </li>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </StyledUl>
              )}
            </Droppable>
          </DragDropContext>
          <PolicyRow
            category={category}
            policy={policy}
            disabled={
              /* -- Clanode Change -- */ /* disabled */ true /* -- Clanode Change End -- */
            }
            handlePolicyChange={onPolicyChange}
            policy={policy}
          />
        </Box>
      </Box>
    </>
  );
};

// =============================================================================
// <FirewallRuleTableRow />
// =============================================================================
interface RowActionHandlersWithDisabled
  extends Omit<RowActionHandlers, 'triggerReorder'> {
  disabled: boolean;
}

export interface FirewallRuleTableRowProps extends RuleRow {
  disabled: RowActionHandlersWithDisabled['disabled'];
  triggerCloneFirewallRule: RowActionHandlersWithDisabled['triggerCloneFirewallRule'];
  triggerDeleteFirewallRule: RowActionHandlersWithDisabled['triggerDeleteFirewallRule'];
  triggerOpenRuleDrawerForEditing: RowActionHandlersWithDisabled['triggerOpenRuleDrawerForEditing'];
  triggerUndo: RowActionHandlersWithDisabled['triggerUndo'];
}

const FirewallRuleTableRow = React.memo((props: FirewallRuleTableRowProps) => {
  const theme: Theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    action,
    addresses,
    disabled,
    errors,
    id,
    label,
    originalIndex,
    ports,
    protocol,
    status,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    triggerUndo,
  } = props;

  const actionMenuProps = {
    disabled: status === 'PENDING_DELETION' || disabled,
    idx: id,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
  };

    return (
      <TableRow
        key={id}
        highlight={
          // Highlight the row if it's been modified or reordered. ID is the
          // current index, so if it doesn't match the original index we know
          // that the rule has been moved.
          status === 'MODIFIED' || status === 'NEW' || originalIndex !== id
        }
        disabled={status === 'PENDING_DELETION' || disabled}
        domRef={innerRef}
        className={isDragging ? classes.dragging : ''}
        {...rest}
      >
        <TableCell className={classes.labelCol}>
          <DragIndicator className={classes.dragIcon} />
          {
            label || ''
            /* -- Clanode Change -- */
            /* (
            <button
              className={classes.addLabelButton}
              style={{ color: disabled ? 'inherit' : '' }}
              onClick={() => triggerOpenRuleDrawerForEditing(id)}
              disabled={disabled}
            >
              Add a label
            </button>
            )*/
            /* -- Clanode Change End -- */
          }
        </TableCell>
        <Hidden mdDown>
          <TableCell>
            {protocol}
            <ConditionalError errors={errors} formField="protocol" />
          </TableCell>
        </Hidden>
        <Hidden xsDown>
          <TableCell>
            {ports === '1-65535' ? 'All Ports' : ports}
            <ConditionalError errors={errors} formField="ports" />
          </TableCell>
          <TableCell style={{ whiteSpace: 'nowrap' }}>
            {addresses}{' '}
            <ConditionalError errors={errors} formField="addresses" />
          </TableCell>
        </Hidden>

        <TableCell>{capitalize(action?.toLocaleLowerCase() ?? '')}</TableCell>
        <TableCell actionCell>
          {status !== 'NOT_MODIFIED' ? (
            <div className={classes.undoButtonContainer}>
              <button
                className={classNames({
                  [classes.undoButton]: true,
                  [classes.highlight]: status !== 'PENDING_DELETION',
                })}
                onClick={() => triggerUndo(id)}
                aria-label="Undo change to Firewall Rule"
                disabled={disabled}
              >
                <Undo />
              </button>
              <FirewallRuleActionMenu {...actionMenuProps} />
            </div>
          ) : (
            <FirewallRuleActionMenu {...actionMenuProps} />
          )}
        </TableCell>
      </TableRow>
    );
  }
);

interface PolicyRowProps {
  category: Category;
  disabled: boolean;
  handlePolicyChange: (newPolicy: FirewallPolicyType) => void;
  policy: FirewallPolicyType;
}

const policyOptions: FirewallOptionItem<FirewallPolicyType>[] = [
  { label: 'Accept', value: 'ACCEPT' },
  { label: 'Drop', value: 'DROP' },
];

export const PolicyRow = React.memo((props: PolicyRowProps) => {
  const { category, disabled, handlePolicyChange, policy } = props;
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down('lg'));

  const helperText = mdDown ? (
    <strong>{capitalize(category)} policy:</strong>
  ) : (
    <span>
      <strong>Default {category} policy:</strong> This policy applies to any
      traffic not covered by the {category} rules listed above.
    </span>
  );

  // Using a grid here to keep the Select and the helper text aligned
  // with the Action column.
  const sxBoxGrid = {
    alignItems: 'center',
    backgroundColor: theme.bg.bgPaper,
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
    display: 'grid',
    fontSize: '.875rem',
    gridTemplateAreas: `'one two three four five'`,
    gridTemplateColumns: '32% 10% 10% 15% 120px',
    height: '40px',
    marginTop: '10px',
    [theme.breakpoints.down('lg')]: {
      gridTemplateAreas: `'one two three four'`,
      gridTemplateColumns: '32% 15% 15% 120px',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateAreas: `'one two'`,
      gridTemplateColumns: '50% 50%',
    },
    width: '100%',
  };

  const sxBoxPolicyText = {
    gridArea: '1 / 1 / 1 / 5',
    padding: '0px 15px 0px 15px',

    textAlign: 'right',
    [theme.breakpoints.down('lg')]: {
      gridArea: '1 / 1 / 1 / 4',
    },
    [theme.breakpoints.down('sm')]: {
      gridArea: 'one',
    },
  };

  const sxBoxPolicySelect = {
    gridArea: 'five',
    [theme.breakpoints.down('lg')]: {
      gridArea: 'four',
    },
    [theme.breakpoints.down('sm')]: {
      gridArea: 'two',
    },
  };

  return (
    <Box sx={sxBoxGrid}>
      <Box sx={sxBoxPolicyText}>{helperText}</Box>
      <Box sx={sxBoxPolicySelect}>
        <Autocomplete
          textFieldProps={{
            hideLabel: true,
          }}
          value={policyOptions.find(
            (thisOption) => thisOption.value === policy
          )}
          autoHighlight
          disableClearable
          disabled={disabled}
          label={`${category} policy`}
          onChange={(_, selected) => handlePolicyChange(selected?.value)}
          options={policyOptions}
        />
      </Box>
    </Box>
  );
});

interface ConditionalErrorProps {
  errors?: FirewallRuleError[];
  formField: string;
}

export const ConditionalError = React.memo((props: ConditionalErrorProps) => {
  const { errors, formField } = props;

  // It's possible to have multiple IP errors, but we only want to display ONE in the table row.
  const uniqueByFormField = uniqBy(prop('formField'), errors ?? []);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {uniqueByFormField.map((thisError) => {
        if (formField !== thisError.formField || !thisError.reason) {
          return null;
        }
        return (
          <StyledErrorDiv key={thisError.idx}>
            <Typography variant="body1">{thisError.reason}</Typography>
          </StyledErrorDiv>
        );
      })}
    </>
  );
});

// =============================================================================
// Utilities
// =============================================================================
/**
 * Transforms Extended Firewall Rules to the higher-level RuleRow. We do this so
 * downstream components don't have worry about transforming individual pieces
 * of data. This also allows us to sort each column of the RuleTable.
 */
export const firewallRuleToRowData = (
  firewallRules: ExtendedFirewallRule[]
): RuleRow[] => {
  return firewallRules.map((thisRule, idx) => {
    const ruleType = ruleToPredefinedFirewall(thisRule);

    return {
      ...thisRule,
      addresses: generateAddressesLabel(thisRule.addresses),
      id: idx,
      ports: sortPortString(thisRule.ports || ''),
      type: generateRuleLabel(ruleType),
    };
  });
};
