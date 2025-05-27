import SignIn from "layouts/authentication/sign-in";
import MyContracts from "layouts/contracts";
import Dashboard from "layouts/dashboard";
import Planning from "layouts/planning";
import Profile from "layouts/profile";
import MyWarehouses from "layouts/warehouses";
import StoreManagement from "layouts/stores";
import ScheduleVisualization from "layouts/schedules";
import AnalyticsDashboard from "layouts/analytics";
import SimulationDashboard from "layouts/simulation";

const routes = [
  {
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    name: "Tableau de bord",
    key: "tableau-de-bord",
    route: "/tableau-de-bord",
    component: <Dashboard />,
  },
  {
    name: "Profile",
    key: "profile",
    route: "/profile",
    component: <Profile />,
  },
  {
    name: "Mes entrepots",
    key: "mes-entrepots",
    route: "/mes-entrepots",
    component: <MyWarehouses />,
  },
  {
    name: "Mes contrats",
    key: "mes-contrats",
    route: "/mes-contrats",
    component: <MyContracts />,
  },
  {
    name: "Planning",
    key: "planning",
    route: "/planning",
    component: <Planning />,
  },
  {
    name: "Stores",
    key: "stores",
    route: "/stores",
    component: <StoreManagement />,
  },
  {
    name: "Schedules",
    key: "schedules",
    route: "/schedules",
    component: <ScheduleVisualization />,
  },
  {
    name: "Analytics",
    key: "analytics",
    route: "/analytics",
    component: <AnalyticsDashboard />,
  },
  {
    name: "Simulation",
    key: "simulation",
    route: "/simulation",
    component: <SimulationDashboard />,
  },
];

export default routes;
