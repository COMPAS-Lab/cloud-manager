import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { volumeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Props, VolumesActionMenu } from './VolumesActionMenu';

const props: CombinedProps = {
  onAttach: jest.fn(),
  onShowConfig: jest.fn(),
  onClone: jest.fn(),
  onDelete: jest.fn(),
  onDetach: jest.fn(),
  onEdit: jest.fn(),
  onResize: jest.fn(),
  label: '',
  linodeLabel: '',
  attached: false,
  regionID: '',
  size: 50,
  poweredOff: false,
  filesystemPath: '',
  volumeId: 12345,
  volumeTags: ['abc', 'def'],
  volumeLabel: '',
  isVolumesLanding: false,
  openForClone: jest.fn(),
  openForConfig: jest.fn(),
  openForEdit: jest.fn(),
  openForResize: jest.fn(),
  handleAttach: jest.fn(),
  handleDelete: jest.fn(),
  handleDetach: jest.fn(),
  /* -- Clanode Change -- */
  hardwareType: 'hdd',
  /* -- Clanode Change End -- */
  ...reactRouterProps,
};

describe('Volume action menu', () => {
  it('should include basic Volume actions', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <VolumesActionMenu {...props} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Volume ${volume.label}`
    );

    await userEvent.click(actionMenuButton);

    for (const action of ['Show Config', 'Edit']) {
      expect(getByText(action)).toBeVisible();
    }
  });

  it('should include Attach if the Volume is not attached', async () => {
    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <VolumesActionMenu {...props} isVolumesLanding={true} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Volume ${volume.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Attach')).toBeVisible();
    expect(queryByText('Detach')).toBeNull();
  });

  it('should include Detach if the Volume is attached', async () => {
    const attachedVolune = volumeFactory.build({
      linode_id: 2,
      linode_label: 'linode-2',
    });

    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <VolumesActionMenu {...props} volume={attachedVolune} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Volume ${attachedVolune.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Detach')).toBeVisible();
    expect(queryByText('Attach')).toBeNull();
  });

  it('should include Delete', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <VolumesActionMenu {...props} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Volume ${volume.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Delete')).toBeVisible();
  });
});
