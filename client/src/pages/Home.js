import React from "react";
import { Space, Typography, Tabs } from "antd";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";
import "../App.css";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { findUserAndSignedIn } from "../store/authSlice";

export default function Home() {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userId = queryParams.get("userId");
  const token = queryParams.get("token");

  console.log("After redirecting from Google Authentication")
  console.log("ID: " , userId)
  console.log("Token: " , token)

  const dispatch = useDispatch()

  if(userId && token) {
    const payload = {
      id: userId,
      access_token: token
    }
    dispatch(findUserAndSignedIn(payload))  
  }

  const onChange = (key) => {
    console.log(key);
  };

  const items = [
    {
      key: "1",
      label: "Signin",
      children: <SignIn />,
    },
    {
      key: "2",
      label: "Signup",
      children: <SignUp />,
    },
  ];

  return (
    <div className="App">
      <head>
        <title>Budget Tracking App</title>
      </head>

      <Space direction="vertical">
        <Typography.Title>Welcome to Budget Tracker App</Typography.Title>
        <Typography.Paragraph>
          Ultimate Money Management Tool
        </Typography.Paragraph>

        <Space>
          <Tabs
            defaultActiveKey="1"
            centered
            items={items}
            onChange={onChange}
          />
        </Space>
      </Space>
    </div>
  );
}
