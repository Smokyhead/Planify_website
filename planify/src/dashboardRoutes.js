import Dashboard from "layouts/dashboard";

import Shop from "examples/Icons/Shop";
import MyWarehouses from "layouts/warehouses";
import CustomerSupport from "examples/Icons/CustomerSupport";
import Profile from "layouts/profile";

const dashboardRoutes = [
  {
    type: "collapse",
    name: "Tableau de bord",
    key: "tableau-de-bord",
    route: "/tableau-de-bord",
    icon: <Shop size="12px" />,
    component: <Dashboard />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Mes entrepots",
    key: "mes-entrepots",
    route: "/mes-entrepots",
    icon: <CustomerSupport size="12px" />,
    component: <MyWarehouses />,
    noCollapse: true,
  },
];

export default dashboardRoutes;
