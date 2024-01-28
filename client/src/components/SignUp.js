import { React } from "react";
import { LockOutlined, UserOutlined, GoogleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Result, message} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signWithGoogle } from "../store/authSlice";

export default function SignUp() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [messageApi, contextHolder] = message.useMessage();

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Sign up successfully",
    });
  };

  const signUp = async () => {
    try {
      const data = new URLSearchParams();
      data.append("email", email);
      data.append("password", password);
      data.append("firstName", firstName);
      data.append("lastName", lastName);

      console.log("In Slice");
      const response = await fetch("http://localhost:5959/auth/signup", {
        method: "POST",
        mode: "cors",
        headers: {
          // "Content-Type": "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: data.toString(),
      });

      if (response.ok) {
        success()
        setIsRegistered(true)
        const data = await response.json();
      }
    } catch (err) {
      console.error(err);
    }

  };

  const signUpWithGoogle = async () => {
    try {
      dispatch(signWithGoogle())
    } catch (err) {
      console.error(err);
    }
  };

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    setFirstname("");
    setLastname("");
    setEmail("");
    setPassword("");

  };

  return (
    <>
      {contextHolder}
      {isRegistered === true ? (
        <SignupFeedback />
      ) : (
        <Form
          name="normal_login"
          className="login-form"
          onFinish={onFinish}
        >
          <Form.Item
            name="firstname"
            rules={[
              {
                required: true,
                message: "Please input your First name!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Firstname"
              onChange={(e) => setFirstname(e.target.value)}
              value={"Mubeen"}
            />
          </Form.Item>
          <Form.Item
            name="lastName"
            rules={[
              {
                required: true,
                message: "Please input your Lastname!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Lastname"
              onChange={(e) => setLastname(e.target.value)}
              value={lastName}
            />
          </Form.Item>
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
              value={email}
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
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={signUp}
              className="login-form-button"
            >
              Sign up
            </Button>
            <br />
            or
            <br />
            <Button
              type="primary"
              icon={<GoogleOutlined />}
              onClick={signUpWithGoogle}
            >
              SignUp with Google
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
}

function SignupFeedback(){
  const navigate = useNavigate();
  const handleSignIn = () => {
    window.location.reload();
  }
  return (
    <Result
      status="success"
      title="Successfully Registered!"
      subTitle=""
      extra={[
        <Button type="primary" key="console" onClick={handleSignIn}>
          Signin
        </Button>,
      ]}
    />
  );
}