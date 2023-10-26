import axios from "axios";
import { store } from '../reduxStore/store';
import { loginSuccess, logout as logoutAction } from '../reduxStore/userSlice';
import { useSelector } from 'react-redux';

const API_URL = "http://localhost:9090/auth/";
const API_URL_TASKS = "http://localhost:9090/task/";

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


const getAllTasks = (token) => {  
  return axios.get(API_URL_TASKS + "tasks", {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });
}




const logout = () => {
  localStorage.removeItem("user");
  store.dispatch(logoutAction());
};



const AuthService = {
  register,
  login,
  logout,
  getAllTasks
};

export default AuthService;