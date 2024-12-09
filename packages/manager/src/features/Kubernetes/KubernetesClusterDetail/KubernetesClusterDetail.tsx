import Grid from '@mui/material/Unstable_Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { getKubeHighAvailability } from 'src/features/Kubernetes/kubeUtils';
import { useAPLAvailability } from 'src/features/Kubernetes/kubeUtils';
import { useAccount } from 'src/queries/account/account';
import {
  useKubernetesClusterMutation,
  useKubernetesClusterQuery,
} from 'src/queries/kubernetes';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { APLSummaryPanel } from './APLSummaryPanel';
import { KubeSummaryPanel } from './KubeSummaryPanel';
import { NodePoolsDisplay } from './NodePoolsDisplay/NodePoolsDisplay';
import { UpgradeKubernetesClusterToHADialog } from './UpgradeClusterDialog';
import UpgradeKubernetesVersionBanner from './UpgradeKubernetesVersionBanner';

export const KubernetesClusterDetail = () => {
  const { data: account } = useAccount();
  const { clusterID } = useParams<{ clusterID: string }>();
  const id = Number(clusterID);
  const location = useLocation();
  const { showAPL } = useAPLAvailability();

  const { data: cluster, error, isLoading } = useKubernetesClusterQuery(id);
  const { data: regionsData } = useRegionsQuery();

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    id
  );

  const {
    isClusterHighlyAvailable,
    showHighAvailability,
  } = getKubeHighAvailability(account, cluster);

  const [updateError, setUpdateError] = React.useState<string | undefined>();
  const [isUpgradeToHAOpen, setIsUpgradeToHAOpen] = React.useState(false);

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Unable to load cluster data.')[0].reason
        }
      />
    );
  }

  if (isLoading || !cluster) {
    return <CircleProgress />;
  }

  const handleLabelChange = (newLabel: string) => {
    setUpdateError(undefined);

    return updateKubernetesCluster({ label: newLabel }).catch((e) => {
      setUpdateError(e[0].reason);
      return Promise.reject(e);
    });
  };

  const resetEditableLabel = () => {
    setUpdateError(undefined);
    return cluster?.label;
  };

  const handleUpgradeToHA = () => {
    setIsUpgradeToHAOpen(true);
  };

  return (
    <>
      <DocumentTitleSegment segment={`Kubernetes Cluster ${cluster?.label}`} />
      <Grid>
        <UpgradeKubernetesVersionBanner
          clusterID={cluster?.id}
          clusterLabel={cluster?.label}
          currentVersion={cluster?.k8s_version}
        />
      </Grid>

      <LandingHeader
        breadcrumbProps={{
          breadcrumbDataAttrs: { 'data-qa-breadcrumb': true },
          firstAndLastOnly: true,
          onEditHandlers: {
            editableTextTitle: cluster?.label,
            errorText: updateError,
            onCancel: resetEditableLabel,
            onEdit: handleLabelChange,
          },
          pathname: location.pathname,
        }}
        onButtonClick={
          showHighAvailability && !isClusterHighlyAvailable
            ? handleUpgradeToHA
            : undefined
        }
        createButtonText="Upgrade to HA"
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-lke-linode-kubernetes-engine"
        title="Kubernetes Cluster Details"
      />
      <Grid>
        <KubeSummaryPanel cluster={cluster} />
      </Grid>
      {showAPL && cluster.apl_enabled && (
        <>
          <LandingHeader
            docsLabel="Docs"
            docsLink="https://apl-docs.net/"
            removeCrumbX={[1, 2, 3]}
            title="Akamai App Platform"
          />
          <Grid>
            <APLSummaryPanel cluster={cluster} />
          </Grid>
        </>
      )}
      <Grid>
        <NodePoolsDisplay
          clusterID={cluster.id}
          clusterLabel={cluster.label}
          pools={cluster.node_pools}
          types={props.typesData || []}
          addNodePool={(pool: PoolNodeWithPrice) =>
            props.createNodePool({
              clusterID: cluster.id,
              type: pool.type,
              count: pool.count,
            })
          }
          updatePool={(id: number, updatedPool: PoolNodeWithPrice) =>
            props.updateNodePool({
              clusterID: cluster.id,
              nodePoolID: id,
              type: updatedPool.type,
              count: updatedPool.count,
            })
          }
          deletePool={(poolID: number) =>
            props.deleteNodePool({
              clusterID: cluster.id,
              nodePoolID: poolID,
            })
          }
          recycleAllPoolNodes={(poolID: number) =>
            handleRecycleAllPoolNodes(poolID)
          }
          recycleNode={handleRecycleNode}
          recycleAllClusterNodes={handleRecycleAllClusterNodes}
          getNodePools={() =>
            props.requestNodePools(props.match.params.clusterID as any)
          }
        />
      </Grid>
      <UpgradeKubernetesClusterToHADialog
        clusterID={cluster.id}
        onClose={() => setIsUpgradeToHAOpen(false)}
        open={isUpgradeToHAOpen}
        regionID={cluster.region}
      />
    </>
  );
};

const withCluster = KubeContainer<
  {},
  WithTypesProps & RouteComponentProps<{ clusterID: string }>
>(
  (
    ownProps,
    clustersLoading,
    lastUpdated,
    clustersError,
    clustersData,
    nodePoolsLoading
  ) => {
    const cluster =
      clustersData.find(
        (c) => c.id === (ownProps.match.params.clusterID as any)
      ) || null;
    return {
      ...ownProps,
      cluster,
      lastUpdated,
      clustersLoading,
      clustersLoadError: clustersError.read,
      clusterDeleteError: clustersError.delete,
      nodePoolsLoading,
    };
  }
);

const enhanced = compose<CombinedProps, RouteComponentProps>(
  withTypes,
  withCluster
);

export default enhanced(KubernetesClusterDetail);
