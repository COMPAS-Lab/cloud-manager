import { InvoiceItem } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { Currency } from 'src/components/Currency';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { renderUnitPrice } from 'src/features/Billing/billingUtils';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { getInvoiceRegion } from '../PdfGenerator/utils';

interface Props {
  errors?: APIError[];
  items?: InvoiceItem[];
  loading: boolean;
  shouldShowRegion: boolean;
}

export const InvoiceTable = (props: Props) => {
  const MIN_PAGE_SIZE = 25;

  return (
    <Paginate data={items} pageSize={25}>
      {({
        data: paginatedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => (
        <React.Fragment>
          {paginatedData.map(
            /* -- Clanode Change (Added idx) -- */
            (
              { label, from, to, quantity, unit_price, amount, tax, total },
              idx
            ) => (
              <TableRow key={`${label}-${from}-${to}-${idx}`}>
                {/* -- Clanode Change End -- */}
                <TableCell parentColumn="Description" data-qa-description>
                  {label}
                </TableCell>
                <TableCell parentColumn="From" data-qa-from>
                  {renderDate(from)}
                </TableCell>
                <TableCell parentColumn="To" data-qa-to>
                  {renderDate(to)}
                </TableCell>
                <TableCell parentColumn="Quantity" data-qa-quantity>
                  {renderQuantity(quantity)}
                </TableCell>
                <TableCell parentColumn="Unit Price" data-qa-unit-price>
                  {unit_price !== 'None' && renderUnitPrice(unit_price)}
                </TableCell>
                <TableCell parentColumn="Amount (USD)" data-qa-amount>
                  <Currency wrapInParentheses={amount < 0} quantity={amount} />
                </TableCell>
                <TableCell parentColumn="Tax (USD)" data-qa-tax>
                  <Currency quantity={tax} />
                </TableCell>
                <TableCell parentColumn="Total (USD)" data-qa-total>
                  <Currency wrapInParentheses={total < 0} quantity={total} />
                </TableCell>
              </TableRow>
            )
          )}
          {count > MIN_PAGE_SIZE && (
            <TableRow>
              <TableCell
                style={{
                  paddingTop: 2,
                }}
                colSpan={8}
              >
                <PaginationFooter
                  eventCategory="invoice_items"
                  count={count}
                  page={page}
                  pageSize={pageSize}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                />
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      )}
    </Paginate>
  );
};

const MaybeRenderContent: React.FC<{
  loading: boolean;
  errors?: APIError[];
  items?: any[];
}> = (props) => {
  const { loading, errors, items } = props;

  if (loading) {
    return <TableRowLoading columns={8} />;
  }

  if (errors) {
    return (
      <TableRowError colSpan={8} message="Unable to retrieve invoice items." />
    );
  }

  if (items && items.length > 0) {
    return <RenderData items={items} />;
  }

  return <TableRowEmptyState colSpan={8} />;
};

export default InvoiceTable;
