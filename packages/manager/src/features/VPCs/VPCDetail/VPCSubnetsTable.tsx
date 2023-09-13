import { Subnet } from '@linode/api-v4/lib/vpcs/types';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress/CircleProgress';
import {
  CollapsibleTable,
  TableItem,
} from 'src/components/CollapsibleTable/CollapsibleTable';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { SubnetActionMenu } from 'src/features/VPCs/VPCDetail/SubnetActionMenu';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useSubnetsQuery } from 'src/queries/vpcs';

import { SubnetCreateDrawer } from './SubnetCreateDrawer';
import { SubnetDeleteDialog } from './SubnetDeleteDialog';
import { SubnetEditDrawer } from './SubnetEditDrawer';
import { SubnetLinodeRow, SubnetLinodeTableRowHead } from './SubnetLinodeRow';

interface Props {
  vpcId: number;
}

const preferenceKey = 'vpc-subnets';

export const VPCSubnetsTable = (props: Props) => {
  const { vpcId } = props;
  const theme = useTheme();
  const [subnetsFilterText, setSubnetsFilterText] = React.useState('');
  const [selectedSubnet, setSelectedSubnet] = React.useState<
    Subnet | undefined
  >();
  const [deleteSubnetDialogOpen, setDeleteSubnetDialogOpen] = React.useState(
    false
  );
  const [editSubnetsDrawerOpen, setEditSubnetsDrawerOpen] = React.useState(
    false
  );
  const [subnetCreateDrawerOpen, setSubnetCreateDrawerOpen] = React.useState(
    false
  );

  const pagination = usePagination(1, preferenceKey);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const generateSubnetsXFilter = (searchText: string) => {
    if (searchText === '') {
      return filter;
    }
    return {
      '+or': [
        {
          label: { '+contains': searchText },
        },
        {
          id: { '+contains': searchText },
        },
      ],
      ...filter,
    };
  };

  const { data: subnets, error, isLoading } = useSubnetsQuery(
    vpcId,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    generateSubnetsXFilter(subnetsFilterText)
  );

  const handleSearch = (searchText: string) => {
    setSubnetsFilterText(searchText);
    // If you're on page 2+, need to go back to page 1 to see the actual results
    pagination.handlePageChange(1);
  };

  const handleSubnetDelete = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setDeleteSubnetDialogOpen(true);
  };

  const handleEditSubnet = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setEditSubnetsDrawerOpen(true);
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!subnets || error) {
    return (
      <ErrorState errorText="There was a problem retrieving your subnets. Please try again." />
    );
  }

  const SubnetTableRowHead = (
    <TableRow>
      <StyledTableSortCell
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            width: '50%',
          },
          width: '24%',
        })}
        active={orderBy === 'label'}
        direction={order}
        handleClick={handleOrderChange}
        label="label"
      >
        Subnet Label
      </StyledTableSortCell>
      <Hidden smDown>
        <StyledTableSortCell
          active={orderBy === 'id'}
          direction={order}
          handleClick={handleOrderChange}
          label="id"
          sx={{ width: '10%' }}
        >
          Subnet ID
        </StyledTableSortCell>
      </Hidden>
      <StyledTableCell sx={{ width: '18%' }}>Subnet IP Range</StyledTableCell>
      <Hidden smDown>
        <StyledTableCell sx={{ width: '10%' }}>Linodes</StyledTableCell>
      </Hidden>
      <StyledTableCell></StyledTableCell>
    </TableRow>
  );

  const getTableItems = (): TableItem[] => {
    return subnets.data.map((subnet) => {
      const OuterTableCells = (
        <>
          <Hidden smDown>
            <TableCell>{subnet.id}</TableCell>
          </Hidden>
          <TableCell>{subnet.ipv4}</TableCell>
          <Hidden smDown>
            <TableCell>{subnet.linodes.length}</TableCell>
          </Hidden>
          <TableCell align="right">
            <SubnetActionMenu
              handleDelete={handleSubnetDelete}
              handleEdit={handleEditSubnet}
              numLinodes={subnet.linodes.length}
              subnet={subnet}
              vpcId={vpcId}
            />
          </TableCell>
        </>
      );

      const InnerTable = (
        <Table aria-label="Linode" size="small">
          <TableHead style={{ fontSize: '.875rem' }}>
            {SubnetLinodeTableRowHead}
          </TableHead>
          <TableBody>
            {subnet.linodes.length > 0 ? (
              subnet.linodes.map((linodeId) => (
                <SubnetLinodeRow key={linodeId} linodeId={linodeId} />
              ))
            ) : (
              <TableRowEmpty colSpan={5} message={'No Linodes'} />
            )}
          </TableBody>
        </Table>
      );

      return {
        InnerTable,
        OuterTableCells,
        id: subnet.id,
        label: subnet.label,
      };
    });
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        paddingBottom={theme.spacing(2)}
      >
        <DebouncedSearchTextField
          sx={{
            [theme.breakpoints.up('sm')]: {
              width: '416px',
            },
          }}
          debounceTime={250}
          hideLabel
          isSearching={false}
          label="Filter Subnets by label or id"
          onSearch={handleSearch}
          placeholder="Filter Subnets by label or id"
        />
        <Button
          buttonType="primary"
          onClick={() => setSubnetCreateDrawerOpen(true)}
        >
          Create Subnet
        </Button>
      </Box>
      <SubnetCreateDrawer
        onClose={() => setSubnetCreateDrawerOpen(false)}
        open={subnetCreateDrawerOpen}
        vpcId={vpcId}
      />
      <CollapsibleTable
        TableItems={getTableItems()}
        TableRowEmpty={<TableRowEmpty colSpan={5} message={'No Subnets'} />}
        TableRowHead={SubnetTableRowHead}
      />
      <PaginationFooter
        count={subnets.data?.length || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <SubnetDeleteDialog
        onClose={() => setDeleteSubnetDialogOpen(false)}
        open={deleteSubnetDialogOpen}
        subnet={selectedSubnet}
        vpcId={vpcId}
      />
      <SubnetEditDrawer
        onClose={() => setEditSubnetsDrawerOpen(false)}
        open={editSubnetsDrawerOpen}
        subnet={selectedSubnet}
        vpcId={vpcId}
      />
    </>
  );
};

const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  whiteSpace: 'nowrap',
}));

const StyledTableSortCell = styled(TableSortCell, {
  label: 'StyledTableSortCell',
})(({ theme }) => ({
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  whiteSpace: 'nowrap',
}));