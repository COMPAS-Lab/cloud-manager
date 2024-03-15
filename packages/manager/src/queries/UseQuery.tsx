import {
  useQuery,
  QueryKey,
  QueryFunction,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';

interface Props {
  queryKey: QueryKey;
  queryFn: QueryFunction;
  options?: UseQueryOptions;
  children: (params: UseQueryResult) => JSX.Element;
}

/**
 * Utility component for using React-Query in class components
 */
export const UseQuery: React.FC<Props> = (props) => {
  const query = useQuery(props.queryKey, props.queryFn, props.options);
  return props.children(query);
};
