import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { Project } from './types';

export const fetchProjects = (): Promise<Project[]> => {
  return Request<Project[]>(
    setURL(`${API_ROOT}/projects/list`),
    setMethod('GET')
  );
};

export const fetchProjectToken = (projectId: string): Promise<string> => {
  return Request<string>(
    setURL(`${API_ROOT}/project/token/${projectId}`),
    setMethod('GET')
  );
};
