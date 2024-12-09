import axios from 'axios';
import jsPDF from 'jspdf';
import { splitEvery } from 'ramda';

import { ADDRESSES } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { FlagSet } from 'src/featureFlags';
import formatDate from 'src/utilities/formatDate';
// import LinodeLogo from './LinodeLogo';
import CompasLogo from './CompasLogo';

import {
  createFooter,
  createInvoiceItemsTable,
  createInvoiceTotalsTable,
  createPaymentsTable,
  createPaymentsTotalsTable,
  dateConversion,
  invoiceCreatedAfterDCPricingLaunch,
  pageMargin,
} from './utils';

import type { PdfResult } from './utils';
import type { Region } from '@linode/api-v4';
import type {
  Account,
  Invoice,
  InvoiceItem,
  Payment,
} from '@linode/api-v4/lib/account';
import type { FlagSet, TaxDetail } from 'src/featureFlags';

const baseFont = 'helvetica';

const addLeftHeader = (
  doc: jsPDF,
  page: number,
  pages: number,
  formattedDate: string,
  type: string,
  country: string,
  date: string,
  countryTax: TaxDetail | undefined,
  provincialTax?: TaxDetail | undefined
) => {
  const addLine = (text: string, fontSize = 9) => {
    doc.text(text, pageMargin, currentLine, { charSpace: 0.75 });
    currentLine += fontSize;
  };

  let currentLine = 55;

  doc.setFontSize(9);
  doc.setFont(baseFont);

  addLine(`Page ${page} of ${pages}`);
  if (date) {
    addLine(`${type} Date: ${date}`);
  }

  doc.setFont(baseFont, 'bold');
  // addLine('Remit to:');
  // doc.setFont(baseFont, 'normal');

  // addLine(`Linode`);
  // addLine('249 Arch St.');
  // addLine('Philadelphia, PA 19106');
  // addLine('USA');
  // if (taxID) {
  //   addLine(`Linode Tax ID: ${taxID}`);
  // }

  return currentLine;
};

const addRightHeader = (doc: jsPDF, account: Account) => {
  const {
    // address_1,
    // address_2,
    // city,
    // company,
    // country,
    first_name,
    last_name,
    // state,
    // zip,
  } = account;

  const RightHeaderPadding = 310;

  const addLine = (text: string, fontSize = 9) => {
    const splitText = doc.splitTextToSize(text, 110);
    doc.text(splitText, RightHeaderPadding, currentLine, { charSpace: 0.75 });
    currentLine += fontSize * splitText.length;
  };

  let currentLine = 55;

  doc.setFontSize(9);
  doc.setFont(baseFont, 'bold');

  addLine('Invoice To:');
  doc.setFont(baseFont, 'normal');

  addLine(`${first_name} ${last_name}`);
  // addLine(`${company}`);
  // addLine(`${address_1}`);
  // if (address_2) {
  //   addLine(`${address_2}`);
  // }
  // addLine(`${city}, ${state}, ${zip}`);
  // addLine(`${country}`);
  // if (account.tax_id) {
  //   addLine(`Tax ID: ${account.tax_id}`);
  // }

  return currentLine;
};

interface Title {
  leftMargin?: number;
  text: string;
}
// The `y` argument is the position (in pixels) in which the first text string should be added to the doc.
const addTitle = (doc: jsPDF, y: number, ...textStrings: Title[]) => {
  doc.setFont(baseFont, 'bold');
  doc.setFontSize(12);
  textStrings.forEach((eachString) => {
    doc.text(eachString.text, eachString.leftMargin || pageMargin, y, {
      charSpace: 0.75,
    });
    y += 12;
  });
  // reset text format
  doc.setFont(baseFont, 'normal');

  return y;
};

// M3-6177 only make one request to get the logo
const getAkamaiLogo = () => {
  return axios
    .get(AkamaiLogo, { responseType: 'blob' })
    .then((res) => {
      return URL.createObjectURL(res.data);
    })
    .catch(() => {
      return AkamaiLogo;
    });
};

interface PrintInvoiceOptions {
  account: Account;
  invoice: Invoice;
  items: InvoiceItem[];
  /**
   * Used to add Region labels to the `Region` column
   */
  regions: Region[];
  taxes: FlagSet['taxBanner'] | FlagSet['taxes'];
  timezone?: string;
}

export const printInvoice = async (
  options: PrintInvoiceOptions
): Promise<PdfResult> => {
  const { account, invoice, items, regions, taxes, timezone } = options;

  try {
    const itemsPerPage = 25;
    const date = formatDate(invoice.date, { displayTime: true });
    /* -- Clanode Change -- */
    // const invoiceId = invoice.id;
    /* -- Clanode Change End -- */

    /**
     * splits invoice items into nested arrays based on the itemsPerPage
     */
    const itemsChunks = items ? splitEvery(itemsPerPage, items) : [[]];

    const doc = new jsPDF({
      unit: 'px',
    });

    const convertedInvoiceDate = dateConversion(invoice.date);
    const TaxStartDate =
      taxes && taxes?.date ? dateConversion(taxes.date) : Infinity;

    /**
     * Users who have identified their country as one of the ones targeted by
     * one of our tax policies will have a `taxes` with at least a .date.
     * Customers with no country, or from a country we don't have a tax policy
     * for, will have a `taxes` of {}, and the following logic will skip them.
     *
     * If taxes.date is defined, and the invoice we're about to print is after
     * that date, we want to add the customer's tax ID to the invoice.
     *
     * If in addition to the above, taxes is defined, it means
     * we have a corporate tax ID for the country and should display that in the left
     * side of the header.
     *
     * The source of truth for all tax banners is LaunchDarkly, but as an example,
     * as of 2/20/2020 we have the following cases:
     *
     * VAT: Applies only to EU countries; started from 6/1/2019 and we have an EU tax id
     *  - [M3-8277] For EU customers, invoices will include VAT for B2C transactions and exclude VAT for B2B transactions. Both VAT numbers will be shown on the invoice template for EU countries.
     * GMT: Applies to both Australia and India, but we only have a tax ID for Australia.
     */
    const hasTax = !taxes?.date ? true : convertedInvoiceDate > TaxStartDate;
    const countryTax = hasTax ? taxes?.country_tax : undefined;
    const provincialTax = hasTax
      ? taxes?.provincial_tax_ids?.[account.state]
      : undefined;

    const AkamaiLogoURL = await getAkamaiLogo();

    // Create a separate page for each set of invoice items
    itemsChunks.forEach((itemsChunk, index) => {
      doc.addImage(CompasLogo, 'JPEG', 150, 5, 120, 50);

      const leftHeaderYPosition = addLeftHeader(
        doc,
        index + 1,
        itemsChunks.length,
        date,
        'Invoice',
        account.country,
        invoice.date,
        countryTax,
        provincialTax
      );
      const rightHeaderYPosition = addRightHeader(doc, account);

      addTitle(doc, Math.max(leftHeaderYPosition, rightHeaderYPosition) + 4, {
        /* -- Clanode Change -- */
        // text: `Invoice #${invoice.id}`,
        text: `${invoice.label}`,
        /* -- Clanode Changes End -- */
      });

      createInvoiceItemsTable(doc, itemsChunk);
      /* -- Clanode Change -- */
      createFooter(doc, baseFont);
      /* -- Clanode Change End -- */
      if (index < itemsChunks.length - 1) {
        doc.addPage();
      }
    });

    createInvoiceTotalsTable(
      doc,
      invoice,
      account.balance,
      typeof account.non_recurring_balance === 'undefined'
        ? 0
        : account.non_recurring_balance
    );
    /* -- Clanode Change -- */
    createFooter(doc, baseFont);
    /* -- Clanode Change End -- */

    doc.save(`invoice-${date}.pdf`);
    return {
      status: 'success',
    };
  } catch (e) {
    reportException(Error('Error while generating Invoice PDF.'), e);
    return {
      error: e,
      status: 'error',
    };
  }
};

export const printPayment = (
  account: Account,
  payment: Payment,
  countryTax?: TaxDetail,
  timezone?: string
): PdfResult => {
  try {
    const date = formatDate(payment.date, {
      displayTime: true,
      timezone,
    });
    const doc = new jsPDF({
      unit: 'px',
    });
    doc.setFontSize(10);

    doc.addImage(CompasLogo, 'JPEG', 150, 5, 120, 50);
    const leftHeaderYPosition = addLeftHeader(
      doc,
      1,
      1,
      date,
      'Payment',
      account.country,
      payment.date,
      countryTax
    );
    const rightHeaderYPosition = addRightHeader(doc, account);

    const titleYPosition = addTitle(
      doc,
      Math.max(leftHeaderYPosition, rightHeaderYPosition) + 12,
      {
        text: `Receipt for Payment #${payment.id}`,
      }
    );

    createPaymentsTable(doc, payment, titleYPosition, timezone);
    createFooter(doc, baseFont, account.country, payment.date);
    createPaymentsTotalsTable(doc, payment);

    doc.save(`payment-${date}.pdf`);

    return {
      status: 'success',
    };
  } catch (e) {
    reportException(Error('Error while generating Payment PDF.'), e);
    return {
      error: e,
      status: 'error',
    };
  }
};
