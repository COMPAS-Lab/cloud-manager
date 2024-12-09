import { Volume } from '@linode/api-v4';
import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { splitAt } from 'ramda';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

export interface ActionHandlers {
  openForConfig: (volumeLabel: string, volumePath: string) => void;
  openForEdit: (
    volumeId: number,
    volumeLabel: string,
    volumeTags: string[]
  ) => void;
  openForResize: (
    volumeId: number,
    volumeSize: number,
    volumeLabel: string,
    /* -- Clanode Change -- */
    hardwareType: string
    /* -- Clanode Change End -- */
  ) => void;
  openForClone: (
    volumeId: number,
    label: string,
    size: number,
    regionID: string
  ) => void;
  handleAttach: (volumeId: number, label: string, linodeRegion: string) => void;
  handleUpgrade?: (volumeId: number, label: string) => void;
  handleDetach: (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    poweredOff: boolean
  ) => void;
  handleDelete: (volumeId: number, volumeLabel: string) => void;
  [index: string]: any;
}

interface Props extends ActionHandlers {
  attached: boolean;
  isVolumesLanding: boolean;
  poweredOff: boolean;
  filesystemPath: string;
  label: string;
  linodeLabel: string;
  regionID: string;
  volumeId: number;
  volumeLabel: string;
  volumeTags: string[];
  /* -- Clanode Change -- */
  hardwareType: string;
  /* -- Clanode Change End -- */
  size: number;
}

export type CombinedProps = Props & RouteComponentProps<{}>;

export const VolumesActionMenu: React.FC<CombinedProps> = (props) => {
  const { attached, poweredOff, isVolumesLanding } = props;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  // const handleShowConfig = () => {
  //   const { onShowConfig, label, filesystemPath } = props;
  //   onShowConfig(label, filesystemPath);
  // };

  const handleOpenEdit = () => {
    const { onEdit, volumeId, label, volumeTags } = props;
    onEdit(volumeId, label, volumeTags);
  };

  const handleResize = () => {
    /* -- Clanode Change -- */
    // const { onResize, volumeId, size, label } = props;
    // onResize(volumeId, size, label);
    const { onResize, volumeId, size, label, hardwareType } = props;
    onResize(volumeId, size, label, hardwareType);
    /* -- Clanode Change End -- */
  };

  // const handleClone = () => {
  //   const { onClone, volumeId, label, size, regionID } = props;
  //   onClone(volumeId, label, size, regionID);
  // };

  const handleAttach = () => {
    const { onAttach, volumeId, label, regionID } = props;
    onAttach(volumeId, label, regionID);
  };

  const handleDetach = () => {
    const { onDetach, volumeId, volumeLabel, linodeLabel, poweredOff } = props;
    onDetach(volumeId, volumeLabel, linodeLabel, poweredOff);
  };

  const handleDelete = () => {
    const { onDelete, volumeId, volumeLabel } = props;
    onDelete(volumeId, volumeLabel);
  };

  const actions: Action[] = [
    // {
    //   title: 'Show Config',
    //   onClick: () => {
    //     handleShowConfig();
    //   },
    // },
    {
      disabled: isVolumeReadOnly,
      onClick: handlers.handleEdit,
      title: 'Edit',
      tooltip: isVolumeReadOnly
        ? getRestrictedResourceText({
            action: 'edit',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    {
      disabled: isVolumeReadOnly,
      onClick: handlers.handleResize,
      title: 'Resize',
      tooltip: isVolumeReadOnly
        ? getRestrictedResourceText({
            action: 'resize',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    },
    // {
    //   title: 'Clone',
    //   onClick: () => {
    //     handleClone();
    //   },
    // },
  ];

  if (!attached && isVolumesLanding) {
    actions.push({
      disabled: isVolumeReadOnly,
      onClick: handlers.handleAttach,
      title: 'Attach',
      tooltip: isVolumeReadOnly
        ? getRestrictedResourceText({
            action: 'attach',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    });
  } else {
    actions.push({
      disabled: isVolumeReadOnly,
      onClick: handlers.handleDetach,
      title: 'Detach',
      tooltip: isVolumeReadOnly
        ? getRestrictedResourceText({
            action: 'detach',
            isSingular: true,
            resourceType: 'Volumes',
          })
        : undefined,
    });
  }

  actions.push({
    disabled: isVolumeReadOnly || attached,
    onClick: handlers.handleDelete,
    title: 'Delete',
    tooltip: isVolumeReadOnly
      ? getRestrictedResourceText({
          action: 'delete',
          isSingular: true,
          resourceType: 'Volumes',
        })
      : attached
      ? 'Your volume must be detached before it can be deleted.'
      : undefined,
  });

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              disabled={action.disabled}
              key={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Volume ${volume.label}`}
      />
    </>
  );
};
