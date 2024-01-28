import {
  Typography,
  Space,
  Statistic,
  Card,
  Table
} from "antd";
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import {React , useEffect, useState} from 'react'
import Wrapper from '../components/Wrapper';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
// import { Pie } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import { getTotalExpenses, getTotalIncome, getTotalSavings } from "../store/statisticsSlice";
import { getExpenses } from "../store/expensesSlice";
import DistributionChart from "../components/DistributionChart";
import { useNavigate } from "react-router-dom";
// import DistributionChart from "../components/DistributionChart";
// ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  
  const dispatch = useDispatch()
   const naviagte = useNavigate()
  const user = useSelector(state => state.auth.user)
  const token = useSelector(state => state.auth.access_token)
  const totalIncomeData = useSelector((state) => state.statistics.totalIncome)
  const totalExpensesData = useSelector((state) => state.statistics.totalExpenses);
  const totalSavingsData = useSelector((state) => state.statistics.totalSavings);
  const isStateChange = useSelector((state => state.statistics.isChanged))

  useEffect(() => {
    dispatch(getTotalIncome(token))
    dispatch(getTotalExpenses(token))
    dispatch(getTotalSavings(token))
  } , [dispatch])

  useEffect(() => {
    if(isStateChange){
      dispatch(getTotalIncome(token));
      dispatch(getTotalExpenses(token));
      dispatch(getTotalSavings(token));
    }

    if(!user) {
      naviagte('/')
    }
  } , [isStateChange])

  return (
    <Wrapper title={"Dashboard"}>
      <Space size={20} direction="vertical">
        <Space>
          <h2>Hye {user ? user.firstName: ""}, </h2>
        </Space>

        <Space>
          <DasboardCard
            icon={
              <ShoppingCartOutlined
                style={{
                  color: "green",
                  backgroundColor: "rgba(0, 255, 0, 0.5)",
                  borderRadius: 16,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Total Balance"}
            value={totalIncomeData - (totalExpensesData + totalSavingsData)}
          />
          <DasboardCard
            icon={
              <ShoppingOutlined
                style={{
                  color: "purple",
                  backgroundColor: "rgba(0, 255, 255, 0.5)",
                  borderRadius: 16,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Total Income"}
            value={totalIncomeData}
          />
          <DasboardCard
            icon={
              <UserOutlined
                style={{
                  color: "red",
                  backgroundColor: "rgba(255, 0, 0, 0.25)",
                  borderRadius: 16,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Expenses"}
            value={totalExpensesData}
          />
          <DasboardCard
            icon={
              <DollarCircleOutlined
                style={{
                  color: "blue",
                  backgroundColor: "rgba(0, 0, 255, 0.25)",
                  borderRadius: 16,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Savings"}
            value={totalSavingsData}
          />
        </Space>

        <Space>
          <RecentExpenses/>
          <DistributionChart/>
          {/* <ExpensesOverIncomeChart/> */}
        </Space>
      </Space>
    </Wrapper>
  );
}

function DasboardCard({ title, value, icon }) {
  return (
    <Card>
      <Space direction="horizontal">
        {icon}
        <Statistic title={title} value={value} />
      </Space>
    </Card>
  );
}

function RecentExpenses() {

  const [expenses, setExpenses] = useState([]);
  const [isExpensesLoaded, setIsExpensesLoaded] = useState(true);

  const [expensesPerPage, setExpensesPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.user);
  const expensesData = useSelector((state) => state.expenses.expenseList);
  const token = useSelector(state => state.auth.access_token)
  const isStateChanged = useSelector(state => state.expenses.isChanged)

  useEffect(() => {
    dispatch(getExpenses(token));
    setExpenses(expensesData);
    setIsExpensesLoaded(false);
    console.log("Expenses Data ", expensesData);
  }, [dispatch]);

  useEffect(() => {
    if(isStateChanged){
      dispatch(getExpenses(token));
    }
  }, [expensesData])
  
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      filters: [
        {
          text: "Operating",
          value: "Operating",
        },
        {
          text: "Salaries",
          value: "Salaries",
        },
      ],
      onFilter: (value, record) => record.type.startsWith(value),
      filterSearch: true,
      width: "40%",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
      width: "40%",
    },
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => a.date > b.date,
      width: "40%",
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "40%",
    },
  ];

  const data = expensesData
  return (
    <>
      <Typography.Text>Recent Expenses</Typography.Text>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          position: ["bottomCenter"],
          pageSize: expensesPerPage,
          current: currentPage,
          onChange: (currentPage, expensesPerPage) => {
            setExpensesPerPage(expensesPerPage);
            setCurrentPage(currentPage);
          },
        }}
      />
    </>
  );
}

export default Dashboard
