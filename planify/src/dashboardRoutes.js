import Dashboard from "layouts/dashboard";

import Shop from "examples/Icons/Shop";

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
];

export default dashboardRoutes;
