// import axios from "axios";
// export const axiosInstance = axios.create({});
// export const apiconnector = (method, url, bodyData, headers, params ) => {
//     return axiosInstance ({
//         method : `${method}`,
//         url :  `${url}`,
//         data : bodyData  ? bodyData : null,
//         headers : headers ? headers : null,
//         params : params ? params : null,
//     });
// }
import axios from "axios";

export const axiosInstance = axios.create({
  withCredentials: true, // 🔥 REQUIRED
});

export const apiconnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: method,
    url: url,
    data: bodyData ?? null,
    headers: headers ?? {},
    params: params ?? {},
  });
};