export type VolumeEncryption = 'enabled' | 'disabled';

export interface Volume {
  id: number;
  label: string;
  status: VolumeStatus;
  size: number;
  region: string;
  linode_id: null | number;
  linode_label: null | string;
  created: string;
  updated: string;
  filesystem_path: string;
  tags: string[];
  hardware_type: VolumeHardwareType;
  encryption?: VolumeEncryption; // @TODO BSE: Remove optionality once BSE is fully rolled out
}

type VolumeHardwareType = 'hdd' | 'nvme';

export type VolumeStatus =
  | 'active'
  | 'creating'
  | 'active'
  | 'resizing'
  | 'deleting'
  | 'deleted'
  | 'contact_support';

type VolumeHardwareType = 'hdd' | 'nvme';

/* -- Clanode Change -- */
export interface VolumeType {
  label: string;
  hardware_type: VolumeHardwareType;
  price: {
    monthly: number;
    hourly: number;
  };
}
/* -- Clanode Change End -- */

export interface VolumeRequestPayload {
  label: string;
  size?: number;
  region?: string;
  linode_id?: number;
  config_id?: number;
  tags?: string[];
  hardware_type?: string;
}

export interface AttachVolumePayload {
  linode_id: number;
  config_id?: number;
}
export interface CloneVolumePayload {
  label: string;
}

export interface ResizeVolumePayload {
  size: number;
}

export interface VolumesMigrationQueue {
  volumes: number;
  linodes: number;
}

export interface MigrateVolumesPayload {
  volumes: number[];
}
