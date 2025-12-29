import React from 'react';
import axios from "axios";
import { AuthModel, UserModel } from "./_models";

const API_URL = import.meta.env.REACT_APP_SERVER_URL;
const BASE_URL = process.env.VITE_SERVER_URL; 

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
export const LOGIN_URL = `${API_URL}/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;

// Server should return AuthModel
export function testGetByEmail(email: string, password: string) {
  return axios.post(`${BASE_URL}/users/api?email=${email}&password=${password}`)
}

// Server should return AuthModel
export function login(email: string, password: string) {
  return axios.post<AuthModel>(LOGIN_URL, {
    email,
    password,
  });
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

// export function getUserByToken(token: string) {
//   return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
//     api_token: token,
//   });
// }

export function getUserByToken(_id: string) {
  return axios.post<UserModel>(`${BASE_URL }/users/id?id=${_id}`);
}
