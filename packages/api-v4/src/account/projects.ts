import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { Project } from './types';

export const fetchProjects = () => {
    console.log("Fetch Projects");
  return Request<Project[]>(
    setURL(`${API_ROOT}/projects/list`),
    setMethod('POST')
  );
};
