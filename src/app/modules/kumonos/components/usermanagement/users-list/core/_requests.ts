import axios, { AxiosResponse } from "axios";
import { ID, Response } from "../../../../../../../_metronic/helpers";
import { User, UsersQueryResponse } from "./_models";

const BASE_URL = process.env.VITE_SERVER_URL;
const USER_BASE_URL = `${BASE_URL}/users`;
 
const getUsers = (query: string): Promise<UsersQueryResponse> => {
  return axios
    .get(`${USER_BASE_URL}/get-user-by?${query}`)
    .then((data: any) => data.data);
};

const getUserById = (id: ID): Promise<User | undefined> => {
  return axios
    .get(`${USER_BASE_URL}/edit-user/${id}`)
    .then((response: any) => response)
    .then((response: any) => response);
};


const createUser = (user: any): Promise<User | undefined> => {
  return axios
    .post(`${USER_BASE_URL}/create-user/`, user)
    .then((response: any) => response)
    .then((response: any) => response);
};


const updateUser = (user: any): Promise<User | undefined> => {
  return axios
    .put(`${USER_BASE_URL}/update-user/${user.id}`, user)
    .then((response: AxiosResponse<Response<User>>) => response.data)
    .then((response: Response<User>) => response.data);
};

const deleteUser = (userId: ID): Promise<void> => {
  return axios.delete(`${USER_BASE_URL}/delete-user/${userId}`).then(() => {});
};


const deleteSelectedUsers = (userIds: Array<ID>): Promise<void> => {
  const requests = userIds.map((id) => axios.delete(`${USER_BASE_URL}/delete-user/${id}`));
  return axios.all(requests).then(() => {});
};

export {
  getUsers,
  deleteUser,
  deleteSelectedUsers,
  getUserById,
  createUser,
  updateUser,
};
