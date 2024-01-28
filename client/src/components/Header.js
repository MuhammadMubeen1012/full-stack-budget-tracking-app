// import { auth } from "../firebase/firebase";
// import { signOut } from "firebase/auth";
import { Badge, Button, Image, Space, Typography } from "antd";
import { MailOutlined, BellFilled, CloudFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authActions, signOut } from "../store/authSlice";
import { useDispatch, useSelector } from "react-redux";
const { Title } = Typography;

function Header({ title }) {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  const handleLogout = async (e) => {
    try {
      dispatch(signOut())
      navigate('/')
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="Header">
      <Image
        width={40}
        src="https://cdn-icons-png.flaticon.com/128/781/781760.png"
      />
      <Title level={3}>{title}</Title>
      <Space>
        <Button type="primary" onClick={(e) => handleLogout()}>
          Logout
        </Button>
      </Space>
    </div>
  );
}

export default Header;
