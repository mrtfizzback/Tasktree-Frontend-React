import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:9090/localhost:9090/auth/";

const getPublicContent = () => {
  return axios.get(API_URL + "all");
};

const getUserBoard = () => {
  return axios.get(API_URL + "users", { headers: authHeader() });
};

/* const getModeratorBoard = () => {
  return axios.get(API_URL + "mod", { headers: authHeader() });
}; */

/* const getAdminBoard = () => {
  return axios.get(API_URL + "admin", { headers: authHeader() });
}; */

const getUser = () => {
  return axios.get(API_URL + "getUser", { headers: authHeader() });
};

const getAllUsers = () => {
  return axios.get(API_URL + allusers, { headers: authHeader() });
};

const UserService = {
  getAllUsers,
  getPublicContent,
  getUserBoard,
  getModeratorBoard,
  getAdminBoard,
};

export default UserService;
