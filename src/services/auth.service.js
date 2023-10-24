import axios from "axios";
import { store } from '../reduxStore/store';
import { loginSuccess, logout as logoutAction } from '../reduxStore/userSlice';

const API_URL = "http://localhost:9090/auth/";

const register = (userName, password, email, roles) => {
  return axios.post(API_URL + "addNewUser", {
    userName,
    password,
    email,
    roles
  }).catch(error => {
    console.error("Axios error on AuthsService.register", error);
    throw error;
  });
};

const login = (userName, password) => {
  console.log("AXIOS LOGIN REQUEST: ", userName, password )
  return axios.post(API_URL + "generateToken", {
      userName,
      password
    })
    .then((response) => {
      console.log("AXIOS RESPONSE", response.data)
        if (response.data.accessToken) {
            localStorage.setItem("user", JSON.stringify(response.data));
            store.dispatch(loginSuccess(response.data));

        }

      return response.data;
    });
};


const logout = () => {
  localStorage.removeItem("user");
  store.dispatch(logoutAction());
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;