import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { Project } from './types';

export const fetchProjects = () => {
  return Request<Project[]>(
    setURL(`${API_ROOT}/projects/list`),
    setMethod('POST')
  );
};

export const fetchProjectToken = (projectId: string) => {
  try {
    return Request(
      setURL(`${API_ROOT}/project/token/${projectId}`),
      setMethod('POST')
    );
  } catch (error) {
    console.error('Error fetching project token:', error);
  }
};
