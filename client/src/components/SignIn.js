import {useEffect , React} from "react";
import { LockOutlined, UserOutlined, GoogleOutlined } from "@ant-design/icons";
import { Button, Form, Input, message} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions, signInWithCredientials, signWithGoogle } from "../store/authSlice";

export default function SignIn() {
  
  const [email, setEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

   useEffect(() => {
     if (isAuthenticated) {
       navigate("/dashboard"); // Redirect to the dashboard
     }
   }, [isAuthenticated]);
  

  const signIn = async (e) => {
    e.preventDefault();
    try {
      console.log("Frontend Signin --> ")
      const payload = {
        email: email,
        password: userPassword
      }
      console.log("Payload --> " , payload)
      dispatch(signInWithCredientials(payload))
    } catch (err) {
      console.error(err);
    }
  };
  
  const signInWithGoogle = async () => {
    try {
      dispatch(signWithGoogle());
    } catch (err) {
      console.error(err);
    }
  };

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: "Please input your Email!",
          },
        ]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your Password!",
          },
        ]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
          onChange={(e) => setUserPassword(e.target.value)}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={signIn} className="login-form-button">
          Sign in
        </Button>
        <br />
        or
        <br />
        <Button
          type="primary"
          icon={<GoogleOutlined />}
          onClick={signInWithGoogle}
        >
          SignIn with Google
        </Button>
      </Form.Item>
    </Form>
  );
}
