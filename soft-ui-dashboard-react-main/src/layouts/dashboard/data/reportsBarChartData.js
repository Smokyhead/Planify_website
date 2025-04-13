/**
=========================================================
* Soft UI Dashboard React - v4.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

const reportsBarChartData = {
  chart: {
    labels: ["Avr", "Mai", "Jun", "Jul", "Aut", "Sep", "Oct", "Nov", "Dec"],
    datasets: { label: "Livraisons", data: [450, 200, 100, 220, 500, 100, 400, 230, 500] },
  },
  items: [
    {
      icon: { color: "primary", component: "library_books" },
      label: "Contrats",
      progress: { content: "311", percentage: 60 },
    },
    {
      icon: { color: "success", component: "payment" },
      label: "Profits",
      progress: { content: "12,150 DT", percentage: 30 },
    },
    {
      icon: { color: "secondary", component: "man" },
      label: "Clients",
      progress: { content: "46", percentage: 30 },
    },
  ],
};

export default reportsBarChartData;
