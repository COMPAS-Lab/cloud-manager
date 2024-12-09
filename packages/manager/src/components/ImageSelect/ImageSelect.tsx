import React, { useMemo } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { imageFactory } from 'src/factories/images';
import { useAllImagesQuery } from 'src/queries/images';

import { OSIcon } from '../OSIcon';
import { ImageOption } from './ImageOption';
import {
  getAPIFilterForImageSelect,
  getDisabledImages,
  getFilteredImagesForImageSelect,
} from './utilities';

import type { Image, RegionSite } from '@linode/api-v4';
import type { EnhancedAutocompleteProps } from 'src/components/Autocomplete/Autocomplete';

export type ImageSelectVariant = 'all' | 'private' | 'public';

interface BaseProps
  extends Omit<
    Partial<EnhancedAutocompleteProps<Image>>,
    'multiple' | 'onChange' | 'value'
  > {
  anyAllOption?: boolean;
  filter?: (image: Image) => boolean;
  groupBy?: (image: Image) => string;
  label?: string;
  placeholder?: string;
  selectIfOnlyOneOption?: boolean;
  siteType?: RegionSite;
  variant: ImageSelectVariant;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  onChange: (selected: Image | null) => void;
  value: ((image: Image) => boolean) | null | string;
}

interface MultiProps extends BaseProps {
  multiple: true;
  onChange: (selected: Image[]) => void;
  value: ((image: Image) => boolean) | null | string[];
}

export type Props = MultiProps | SingleProps;

export const ImageSelect = (props: Props) => {
  const {
    anyAllOption,
    filter,
    label,
    multiple,
    onChange,
    placeholder,
    selectIfOnlyOneOption,
    siteType,
    variant,
    ...rest
  } = props;

  const { data: images, error, isLoading } = useAllImagesQuery(
    {},
    getAPIFilterForImageSelect(variant)
  );

  const disabledImages = getDisabledImages({
    images: images ?? [],
    site_type: siteType,
  });

  const _options = useMemo(() => {
    // We can't filter out Kubernetes images using the API so we do it client side
    const filteredOptions =
      getFilteredImagesForImageSelect(images, variant) ?? [];

    return filter ? filteredOptions.filter(filter) : filteredOptions;
  }, [images, filter, variant]);

  const options = useMemo(() => {
    if (anyAllOption) {
      return [
        imageFactory.build({
          eol: undefined,
          id: 'any/all',
          label: 'Any/All',
        }),
        ..._options,
      ];
    }
    return _options;
  }, [anyAllOption, _options]);

  // We need to sort options when grouping in order to avoid duplicate headers
  // see https://mui.com/material-ui/react-autocomplete/#grouped
  // We want:
  // - Vendors to be sorted alphabetically
  // - "My Images" to be first
  // - Images to be sorted by creation date, newest first
  const sortedOptions = useMemo(() => {
    const myImages = options.filter((option) => !option.is_public);
    const otherImages = options.filter((option) => option.is_public);

    const sortedVendors = Array.from(
      new Set(otherImages.map((img) => img.vendor))
    ).sort((a, b) => (a ?? '').localeCompare(b ?? ''));

    return [
      ...myImages.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      ),
      ...sortedVendors.flatMap((vendor) =>
        otherImages
          .filter((img) => img.vendor === vendor)
          .sort(
            (a, b) =>
              new Date(b.created).getTime() - new Date(a.created).getTime()
          )
      ),
    ];
  }, [options]);

  const selected = props.value;
  const value = useMemo(() => {
    if (multiple) {
      return options.filter((option) =>
        Array.isArray(selected) ? selected.includes(option.id) : false
      );
    }
    return options.find((option) => option.id === selected) ?? null;
  }, [multiple, options, selected]);

  if (options.length === 1 && onChange && selectIfOnlyOneOption && !multiple) {
    onChange(options[0]);
  }

  return (
    <Paper data-qa-select-image-panel>
      <Typography variant="h2" data-qa-tp={title}>
        {title}
      </Typography>
      <Grid container direction="row" wrap="nowrap" spacing={4}>
        <Grid container item direction="column">
          <Grid container item direction="row">
            <Grid item xs={12}>
              <Select
                isClearable={false}
                disabled={disabled}
                label="Images"
                isLoading={_loading}
                placeholder="Choose an image"
                options={options}
                onChange={onChange}
                value={getSelectedOptionFromGroupedOptions(
                  selectedImageID || '',
                  options
                )}
                errorText={error || imageError}
                components={{ Option: ImageOption, SingleValue }}
                {...reactSelectProps}
                className={classNames}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const isMemo = (prevProps: Props, nextProps: Props) => {
  return (
    equals(prevProps.images, nextProps.images) &&
    arePropsEqual<Props>(
      ['selectedImageID', 'error', 'disabled', 'handleSelectImage'],
      prevProps,
      nextProps
    )
  );
};
