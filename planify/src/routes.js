import SignIn from "layouts/authentication/sign-in";

import Document from "examples/Icons/Document";
import Dashboard from "layouts/dashboard";

import Shop from "examples/Icons/Shop";

const routes = [
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    icon: <Document size="12px" />,
    component: <SignIn />,
    noCollapse: true,
  },
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
