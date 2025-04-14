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
