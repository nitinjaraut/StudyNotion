import axios from "axios";

export const axiosInstance = axios.create({
  withCredentials: true,
});

export const apiconnector = (method, url, bodyData, headers = {}, params = {}) => {
  return axiosInstance({
    method,
    url,
    data: bodyData ?? null,
    headers,
    params,
  });
};