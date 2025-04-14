import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";

import Shop from "examples/Icons/Shop";
import Office from "examples/Icons/Office";
import CustomerSupport from "examples/Icons/CustomerSupport";
import Document from "examples/Icons/Document";

const routes = [
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

export default routes;
