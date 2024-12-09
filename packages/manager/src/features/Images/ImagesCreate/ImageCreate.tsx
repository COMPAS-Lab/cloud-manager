import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { NavTabs } from 'src/components/NavTabs/NavTabs';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

type CombinedProps = RouteComponentProps<{}>;

// const CreateImageTab = React.lazy(() => import('./CreateImageTab'));
const ImageUpload = React.lazy(() => import('../ImageUpload'));

export const ImageCreate: React.FC<CombinedProps> = (props) => {
  const { location } = useHistory<any>();

  const [label, setLabel] = React.useState<string>(
    location?.state ? location.state.imageLabel : ''
  );
  const [description, setDescription] = React.useState<string>(
    location?.state ? location.state.imageDescription : ''
  );

  const handleSetLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLabel(value);
  };

  const handleSetDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);
  };

  const tabs: NavTab[] = [
    // {
    //   title: 'Capture Image',
    //   routeName: `${props.match.url}/disk`,
    //   render: (
    //     <CreateImageTab
    //       label={label}
    //       description={description}
    //       changeLabel={handleSetLabel}
    //       changeDescription={handleSetDescription}
    //     />
    //   ),
    // },
    {
      title: 'Upload Image',
    },
  ];

  return (
    <>
      <DocumentTitleSegment segment="Create Image" />
      <React.Suspense fallback={<SuspenseLoader />}>
        <NavTabs tabs={tabs} />
      </React.Suspense>
    </>
  );
};

export const imageCreateLazyRoute = createLazyRoute('/images/create')({
  component: ImageCreate,
});

export default ImageCreate;
