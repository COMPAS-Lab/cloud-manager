import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useInfiniteVolumesQuery } from 'src/queries/volumes/volumes';

interface Props {
  disabled?: boolean;
  error?: string;
  name: string;
  onBlur: (e: any) => void;
  onChange: (volumeId: null | number) => void;
  region?: string;
  value: number;
  region: string;
  disabled?: boolean;
}

interface State {
  loading: boolean;
  volumes: Item[];
  selectedVolumeId?: number;
}

type CombinedProps = Props & ProfileProps;

class VolumeSelect extends React.Component<CombinedProps, State> {
  state: State = {
    volumes: [],
    loading: true,
  };

  componentDidMount() {
    this.searchVolumes();
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { region } = this.props;
    if (region !== prevProps.region) {
      this.searchVolumes();
    }
  }

  getSelectedVolume = (linodeId?: number) => {
    if (!linodeId) {
      return -1;
    }

    const { volumes } = this.state;
    const idx = volumes.findIndex((linode) => linodeId === linode.value);
    return idx > -1 ? volumes[idx] : -1;
  };

  setSelectedVolume = (selected: Item<number>) => {
    if (selected) {
      const { value } = selected;
      this.setState({ selectedVolumeId: value });
      this.props.onChange(value);
    } else {
      this.props.onChange(-1);
      this.setState({ selectedVolumeId: -1 });
    }
  };

  renderLinodeOptions = (volumes: Volume[]) => {
    if (!volumes) {
      return [];
    }

    const { grants, profile } = this.props;

    const volumeGrants = Boolean(profile.data?.restricted)
      ? getGrants(grants.data, 'volume')
      : undefined;

    let volumeOptions = [];

    if (volumeGrants) {
      const allowedVolumeGrants = volumeGrants.reduce(
        (acc: number[], volume: Grant) => {
          if (volume.permissions === 'read_write') {
            acc.push(volume.id);
          }
          return acc;
        },
        []
      );

      volumeOptions = volumes.filter(
        (volume) => allowedVolumeGrants.indexOf(volume.id) !== -1
      );
    } else {
      volumeOptions = volumes;
    }

    return volumeOptions.map((volume) => ({
      value: volume.id,
      label: volume.label,
      data: {
        region: volume.region,
      },
    }));
  };

  getVolumeFilter = (inputValue: string) => {
    const { region } = this.props;

    if (region && region !== 'none') {
      return {
        label: {
          '+contains': inputValue,
        },
        region,
      };
    } else {
      return {
        label: {
          '+contains': inputValue,
        },
      };
    }
  };

  searchVolumes = (inputValue: string = '') => {
    this.setState({ loading: true });

    const filterVolumes = this.getVolumeFilter(inputValue);

    getVolumes({}, filterVolumes)
      .then((response) => {
        return {
          ...response,
          data: response.data.filter(
            (v) =>
              /* -- Clanode Change --*/ /* v.region === this.props.region && */ /* -- Clanode Change End --*/ v.linode_id ===
              null
          ),
        };
      })
      .then((response) => {
        const volumes = this.renderLinodeOptions(response.data);
        this.setState({ volumes, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  onInputChange = (inputValue: string, actionMeta: { action: string }) => {
    if (actionMeta.action !== 'input-change') {
      return;
    }
    this.setState({ loading: true });
    this.debouncedSearch(inputValue);
  };

  debouncedSearch = debounce(400, false, this.searchVolumes);

  render() {
    const { error, name, onBlur, disabled } = this.props;
    const { loading, volumes, selectedVolumeId } = this.state;

    return (
      <FormControl fullWidth>
        <EnhancedSelect
          onBlur={onBlur}
          name={name}
          label="Volume"
          placeholder="Select a Volume"
          value={this.getSelectedVolume(selectedVolumeId)}
          isLoading={loading}
          errorText={error}
          options={volumes}
          onChange={this.setSelectedVolume}
          onInputChange={this.onInputChange}
          disabled={disabled}
        />
        {!error && (
          <FormHelperText data-qa-volume-region>
            {
              /* -- Clanode Change -- */
              //  Only volumes in this Linode&rsquo;s region are displayed.
              /* -- Clanode Change End -- */
            }
          </FormHelperText>
        )}
      </FormControl>
    );
  }
}

export default compose<CombinedProps, Props>(withProfile)(VolumeSelect);
