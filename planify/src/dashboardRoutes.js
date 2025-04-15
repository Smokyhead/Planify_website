import Shop from "examples/Icons/Shop";
import Office from "examples/Icons/Office";
import Document from "examples/Icons/Document";

import MyWarehouses from "layouts/warehouses";
import Dashboard from "layouts/dashboard";
import MyContracts from "layouts/contracts";
import Settings from "examples/Icons/Settings";
import Planning from "layouts/planning";

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
    icon: <Office size="12px" />,
    component: <MyWarehouses />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Mes contrats",
    key: "mes-contrats",
    route: "/mes-contrats",
    icon: <Document size="12px" />,
    component: <MyContracts />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Planning",
    key: "planning",
    route: "/planning",
    icon: <Settings size="12px" />,
    component: <Planning />,
    noCollapse: true,
  },
];

export default dashboardRoutes;
