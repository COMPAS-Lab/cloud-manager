import { Box } from '@linode/ui';
import * as React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
/* -- Clanode Change -- */
// import { formatRegion } from 'src/utilities';
/* -- Clanode Change End -- */
import { ExtendedVolume } from './types';
import VolumesActionMenu, { ActionHandlers } from './VolumesActionMenu';

export const useStyles = makeStyles()({
  volumePath: {
    width: '35%',
    wordBreak: 'break-all',
  },
});

interface Props {
  handlers: ActionHandlers;
  isBlockStorageEncryptionFeatureEnabled?: boolean;
  isDetailsPageRow?: boolean;
  volume: Volume;
}

export const VolumeTableRow = React.memo((props: Props) => {
  const { classes } = useStyles();
  const {
    handlers,
    isBlockStorageEncryptionFeatureEnabled,
    isDetailsPageRow,
    volume,
  } = props;

  const history = useHistory();
  const location = useLocation();
  const isVolumesLanding = Boolean(location.pathname.match(/volumes/));

  /* -- Clanode Change -- */
  // const formattedRegion = formatRegion(region);
  /* -- Clanode Change End -- */

  const isNVMe = hardwareType === 'nvme';

  return isUpdating ? (
    <TableRow
      key={`volume-row-${id}`}
      data-qa-volume-loading
      className="fade-in-table"
    >
      <TableCell data-qa-volume-cell-label={label}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <div>{label}</div>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell colSpan={5}>
        <LinearProgress value={progressFromEvent(recentEvent)} />
      </TableCell>
    </TableRow>
  ) : (
    <TableRow key={`volume-row-${id}`} data-qa-volume-cell={id}>
      <TableCell data-qa-volume-cell-label={label}>
        <Grid
          container
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          {isVolumesLanding ? (
            <>
              <Grid item>
                <div>{label}</div>
              </Grid>
              {isNVMe ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    variant="outlined"
                    outlineColor="green"
                    label="NVMe"
                    data-testid="nvme-chip"
                    size="small"
                  />
                </Grid>
              ) : eligibleForUpgradeToNVMe &&
                !nvmeUpgradeScheduledByUserImminent ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    label="UPGRADE TO NVMe"
                    onClick={
                      linodeId
                        ? () => history.push(`/linodes/${linodeId}/upgrade`)
                        : () => handleUpgrade?.(id, label)
                    }
                    data-testid="upgrade-chip"
                    size="small"
                    clickable
                  />
                </Grid>
              ) : nvmeUpgradeScheduledByUserImminent ||
                nvmeUpgradeScheduledByUserInProgress ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    variant="outlined"
                    outlineColor="gray"
                    label="UPGRADE PENDING"
                    data-testid="upgrading-chip"
                    size="small"
                  />
                </Grid>
              ) : null}
            </>
          ) : (
            <Grid item>
              <div>{label}</div>
            </Grid>
          )}
        </Grid>
      </TableCell>
      {/* -- Clanode Change -- */
      /* region ? (
        <TableCell data-qa-volume-region noWrap>
          {formattedRegion}
        </TableCell>
      ) : null  */
      /* -- Clanode Change End -- */}
      <TableCell data-qa-volume-size>{size} GiB</TableCell>
      {!isVolumesLanding ? (
        <Hidden xsDown>
          <TableCell className={classes.volumePath} data-qa-fs-path>
            {volume.filesystem_path}
          </TableCell>
        </Hidden>
      )}
      {isVolumesLanding && (
        <TableCell data-qa-volume-cell-attachment={volume.linode_label}>
          {volume.linode_id !== null ? (
            <Link
              className="link secondaryLink"
              to={`/linodes/${volume.linode_id}/storage`}
            >
              {volume.linode_label}
            </Link>
          ) : (
            <Typography data-qa-unattached>Unattached</Typography>
          )}
        </TableCell>
      )}
      {isBlockStorageEncryptionFeatureEnabled && (
        <TableCell noWrap>{encryptionStatus}</TableCell>
      )}
      <TableCell actionCell>
        <VolumesActionMenu
          onShowConfig={openForConfig}
          filesystemPath={filesystemPath}
          linodeLabel={linodeLabel || ''}
          regionID={region}
          volumeId={id}
          volumeTags={tags}
          size={size}
          label={label}
          /* -- Clanode Change -- */
          hardwareType={hardwareType}
          /* -- Clanode Change End -- */
          onEdit={openForEdit}
          onResize={openForResize}
          onClone={openForClone}
          volumeLabel={label}
          /**
           * This is a safer check than linode_id (see logic in addAttachedLinodeInfoToVolume() from VolumesLanding)
           * as it actually checks to see if the Linode exists before adding linodeLabel and linodeStatus.
           * This avoids a bug (M3-2534) where a Volume attached to a just-deleted Linode
           * could sometimes get tagged as "attached" here.
           */
          attached={Boolean(linodeLabel)}
          isVolumesLanding={isVolumesLanding} // Passing this down to govern logic re: showing Attach or Detach in action menu.
          volume={volume}
        />
      </TableCell>
    </TableRow>
  );
});
