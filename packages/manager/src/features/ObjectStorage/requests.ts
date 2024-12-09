import Axios, { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

const axiosInstance = Axios.create({});

export const uploadObject = (
  signedUrl: string,
  file: File,
  onUploadProgress: (e: AxiosProgressEvent) => void
) => {
  const token = window.localStorage.getItem('authentication/token');
  const config: AxiosRequestConfig = {
    data: file,
    headers: {
      'Content-Type': file.type,
      'X-Auth-Token': token,
    },
    method: 'PUT',
    onUploadProgress,
    url: signedUrl,
  };
  return axiosInstance.request(config);
};

export const deleteObject = (signedUrl: string) => {
  const token = window.localStorage.getItem('authentication/token');
  const config: AxiosRequestConfig = {
    method: 'DELETE',
    headers: {
      'X-Auth-Token': token,
    },
  };
  return axiosInstance.request(config);
};
