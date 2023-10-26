import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  notification,
  Select,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Typography } from "antd";
const { Title } = Typography;
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

const Login2 = () => {
  let navigate = useNavigate();

  const onRegisterFinish = (values) => {
    console.log("Received values of form: ", values);
    AuthService.register(
      values.userName,
      values.password,
      values.email,
      values.roles
    )
      .then((response) => {
        notification.success({
          message: "Success",
          description: response.data,
        });
        console.log("VALUES: ", response.data);
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  };

  const onLoginFinish = (values) => {
    console.log("SENT LOGIN VALUES: ", values);
    AuthService.login(values.userName, values.password)
      .then((data) => {
        // Renamed response to data for clarity.
        if (data.accessToken) {
          // <-- Updated this line.
          navigate("/home");
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Handle registration logic here");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
      <Card style={{ width: 500 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Title level={2}>Register new account </Title>
        </div>
        <Form
          name='normal_login'
          className='login-form'
          initialValues={{ remember: true }}
          onFinish={onRegisterFinish}>
          <Form.Item
            name='userName'
            rules={[
              { required: true, message: "Please input your Username!" },
            ]}>
            <Input
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='Username'
            />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[
              { required: true, message: "Please input your Password!" },
            ]}>
            <Input
              prefix={<LockOutlined className='site-form-item-icon' />}
              type='password'
              placeholder='Password'
            />
            {/*             <a
              style={{ float: "right" }}
              className="login-form-forgot"
              href=""
              onClick={handleForgotPassword}
            >
              Forgot password
            </a> */}
          </Form.Item>
          <Form.Item
            name='email'
            rules={[
              { required: true, message: "Please input your Username!" },
              { type: "email", message: "The input is not a valid email!" },
            ]}>
            <Input
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='email'
            />
          </Form.Item>
          <Form.Item
            name='roles'
            rules={[{ required: true, message: "Please select a role!" }]}>
            <Select
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='Select a role'>
              <Select value='ROLE_USER'>User</Select>
              <Select value='ROLE_ADMIN'>Admin</Select>
            </Select>
          </Form.Item>
          {/* <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
          </Form.Item> */}
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              className='login-form-button'
              block>
              Register
            </Button>
            {/* Don't have an account{" "}
            <a href="" onClick={handleRegister}>
              sign up
            </a> */}
          </Form.Item>
        </Form>
      </Card>
      <Card style={{ width: 500 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Title level={2}>Login </Title>
        </div>
        <Form
          name='normal_login'
          className='login-form'
          initialValues={{ remember: true }}
          onFinish={onLoginFinish}>
          <Form.Item
            name='userName'
            rules={[
              { required: true, message: "Please input your Username!" },
            ]}>
            <Input
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='Username'
            />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[
              { required: true, message: "Please input your Password!" },
            ]}>
            <Input
              prefix={<LockOutlined className='site-form-item-icon' />}
              type='password'
              placeholder='Password'
            />
            {/*             <a
              style={{ float: "right" }}
              className="login-form-forgot"
              href=""
              onClick={handleForgotPassword}
            >
              Forgot password
            </a> */}
          </Form.Item>
          {/*  <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
          </Form.Item> */}
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              className='login-form-button'
              block>
              Log in
            </Button>
            {/*  Don't have an account{" "}
            <a href="" onClick={handleRegister}>
              sign up
            </a> */}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login2;
