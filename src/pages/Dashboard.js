import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { Popover, PopoverContent, PopoverHandler } from "@material-tailwind/react";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {

  const [saleAmount, setSaleAmount] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsTotal, setProductsTotal] = useState([]);
  const [salesstate, setSalesState] = useState({
    good: 0,
    normal: 0,
    bad: 0
  });

  // Variables for Filtering
  const [salesDateRange, setSalesDateRange] = useState({
    from: '',
    to: ''
  });

  const [expenseDateRange, setExpenseDateRange] = useState({
    from: '',
    to: ''
  });

  const [salesFiltered, setSalesFiltered] = useState([]);
  const [productsFiltered, setProductsFiltered] = useState([]);

  const [revenueFiltered, setRevenueFiltered] = useState([]);
  const [expenseFiltered, setExpenseFiltered] = useState([]);

  const [revenue, setRevenue] = useState(0);
  const [expense, setExpense] = useState(0);

  // Filter the Sales Data
  useEffect(() => {
    if (salesDateRange.from && salesDateRange.to) {
      let salesFiltered = sales.filter((sale) => (sale.salesDate[0] >= salesDateRange.from) && (sale.salesDate[0] <= salesDateRange.to));
      setSalesFiltered(salesFiltered);

      let revenueFiltered = [];
      for (let i in sales) {
        for (let j in sales[i].salesDate) {
          if (sales[i].salesDate[j] >= salesDateRange.from && sales[i].salesDate[j] <= salesDateRange.to) {
            revenueFiltered.push(sales[i]);
            break
          }
        }
      };
      setRevenueFiltered(revenueFiltered);
      
      let revenue = 0;
      for (let i in revenueFiltered) {
        for (let j in revenueFiltered[i].salesDate) {
          if (revenueFiltered[i].salesDate[j] >= salesDateRange.from && revenueFiltered[i].salesDate[j] <= salesDateRange.to) {
            revenue += parseInt(revenueFiltered[i].income[j]);
          }
        }
      }
      setRevenue(revenue);
    }
  }, [salesDateRange]);

  // Filter the Expense Data
  useEffect(()=> {
    if (expenseDateRange.from && expenseDateRange.to) {
      let expense = 0;
      let productsFiltered = productsTotal.filter((product) => (product.purchaseDate >= expenseDateRange.from && product.purchaseDate <= expenseDateRange.to));
      setProductsFiltered(productsFiltered);

      let expenseFiltered = [];
      for (let i in productsTotal) {
        for (let j in productsTotal[i].additional) {
          if (productsTotal[i].additional[j].date >= expenseDateRange.from && productsTotal[i].additional[j].date <= expenseDateRange.to) {
            expenseFiltered.push(productsTotal[i])
            break
          }
        }
      }
      setExpenseFiltered(expenseFiltered);

      expense += productsFiltered.reduce((sum, a) => sum += parseInt(a.initial), 0);
      for (let i in expenseFiltered) {
        for (let j in expenseFiltered[i].additional) {
          if (expenseFiltered[i].additional[j].date >= expenseDateRange.from && expenseFiltered[i].additional[j].date <= expenseDateRange.to) {
            expense += parseInt(expenseFiltered[i].additional[j].amount);
          }
        }
      }
      setExpense(expense);
    }
  }, [expenseDateRange]) 

  const [manufacturerdata, setManufacturerdata] = useState({});
  const [manufacturerdataTotal, setManufacturerdataTotal] = useState({});
  const [manufacturerdataSold, setManufacturerdataSold] = useState({});
  const [doughnutBackground, setDoughnutBackground] = useState([]);
  const [doughnutBackgroundTotal, setDoughnutBackgroundTotal] = useState([]);
  const [doughnutBackgroundSold, setDoughnutBackgroundSold] = useState([]);
  const [monthlySalesData, setMonthlySalesData] = useState({});
  const [monthlyExpenseData, setMonthlyExpenseData] = useState({});

  // data for bar plot
  const [chart, setChart] = useState({
    options: {
      chart: {
        id: "monthly-sales",
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
    },
    series: [
      {
        name: "series",
        data: [],
      },
    ],
  });

  const [chartExpense, setChartExpense] = useState({
    options: {
      chart: {
        id: "monthly-expenses",
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
    },
    series: [
      {
        name: "series",
        data: [],
      },
    ],
  });

  // data for doughnut plot
  const data_in_stock = {
    labels: Object.keys(manufacturerdata),
    datasets: [
      {
        data: Object.values(manufacturerdata),
        backgroundColor: doughnutBackground,
        borderWidth: 1,
      },
    ],
  };

  const data_total = {
    labels: Object.keys(manufacturerdataTotal),
    datasets: [
      {
        data: Object.values(manufacturerdataTotal),
        backgroundColor: doughnutBackgroundTotal,
        borderWidth: 1,
      },
    ],
  };

  const data_sold = {
    labels: Object.keys(manufacturerdataSold),
    datasets: [
      {
        data: Object.values(manufacturerdataSold),
        backgroundColor: doughnutBackgroundSold,
        borderWidth: 1,
      },
    ],
  };

  // Update Chart Data
  const updateChartData = (salesData) => {
    setChart({
      ...chart,
      series: [
        {
          name: "Montant des ventes mensuelles",
          data: [...salesData],
        },
      ],
    });
  };

  const updateChartDataExpense = (expenseData) => {
    setChartExpense({
      ...chartExpense,
      series: [
        {
          name: "Dépenses mensuelles",
          data: [...expenseData],
        },
      ],
    });
  };

  useEffect(() => {
    fetchTotalSaleAmount();
    fetchTotalPurchaseAmount();
    fetchProductsData();
    fetchMonthlySalesData();
    fetchMonthlyExpenseData();
  }, []);

  // Set the background colors of the doughnut chart as random
  const getRandomRGBA = () => {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var a = 0.4;
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
  }
  
  const generateRandomColorsArray = (count) => {
    var colors = [];
    for (var i = 0; i < count; i++) {
      colors.push(getRandomRGBA());
    }
    return colors;
  }

  // Fetch total sales amount
  const fetchTotalSaleAmount = async () => {
    let totalSaleAmount = 0;
    let normal = 0;
    let good = 0;
    let bad = 0;
    try {
      const docSnap = await getDocs(collection(db, 'sales'));
      const salesData = await docSnap.docs.map((doc) => (doc.data()));
      setSales(salesData);
      salesData.forEach((sale)=>{
        totalSaleAmount += sale.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0);
        sale.price <= sale.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0) 
        ?
        good += 1
        :
        0.7 * sale.price <= sale.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0)
        ?
        normal += 1
        :
        bad += 1
      })
      setSaleAmount(totalSaleAmount);
      setSalesState({
        good: good,
        normal: normal,
        bad: bad
      });
    } catch(err) {
      console.log(err);
    }
  }

  // Fetch total purchase amount
  const fetchTotalPurchaseAmount = async () => {
    let totalPurchaseAmount = 0;
    const docSnap = await getDocs(collection(db, 'products'));
    docSnap.forEach((purchase) => {
      totalPurchaseAmount += (parseInt(purchase.data().initial) + purchase.data().additional.reduce((sum, a) => sum + parseInt(a.amount), 0));
    });
    setPurchaseAmount(totalPurchaseAmount);
  }

  // Fetch Data of All Products
  const fetchProductsData = async () => {
    const docSnap = await getDocs(collection(db, 'products'));
    const productDataTotal = docSnap.docs.map((doc) => {
      return doc.data();
    })
    const productData = productDataTotal.filter((data) => data.state !== 'sold');
    const productDataSold = productDataTotal.filter((data) => data.state === 'sold');
    setProducts(productData);
    setProductsTotal(productDataTotal);
    // adjust the data for chart drawing
    const manufacturerdata = productData.reduce((counts, car) => {
      counts[car.manufacturer] = (counts[car.manufacturer] || 0) + 1;
      return counts
    }, {});

    const manufacturerdataTotal = productDataTotal.reduce((counts, car) => {
      counts[car.manufacturer] = (counts[car.manufacturer] || 0) + 1;
      return counts
    }, {});

    const manufacturerdataSold = productDataSold.reduce((counts, car) => {
      counts[car.manufacturer] = (counts[car.manufacturer] || 0) + 1;
      return counts
    }, {});

    setDoughnutBackground(generateRandomColorsArray(Object.keys(manufacturerdata).length));
    setDoughnutBackgroundTotal(generateRandomColorsArray(Object.keys(manufacturerdataTotal).length));
    setDoughnutBackgroundSold(generateRandomColorsArray(Object.keys(manufacturerdataSold).length));
    setManufacturerdata(manufacturerdata);
    setManufacturerdataTotal(manufacturerdataTotal);
    setManufacturerdataSold(manufacturerdataSold);
  }

  // Fetch Monthly Sales
  const fetchMonthlySalesData = async () => {
    // Initialize the sales amount
    let salesAmount = {
      '2023': Array(12).fill(0), 
      '2024': Array(12).fill(0), 
      '2025': Array(12).fill(0),
    }
    try {
      const docSnap = await getDocs(collection(db, 'sales'));
      docSnap.forEach((sale) => {
        sale.data().salesDate.forEach((date, i) => {
          const year = date.split('-')[0];
          const monthIndex = parseInt(date.split('-')[1]) - 1;
          salesAmount[year][monthIndex] += parseInt(sale.data().income[i]);
        });
      });
      setMonthlySalesData(salesAmount);
      updateChartData(salesAmount['2023']);
    } catch (err) {
      console.log(err);
    }
  }

  // Fetch Monthly Expenses
  const fetchMonthlyExpenseData = async () => {
    // Initialize the sales amount
    let expenseAmount = {
      '2023': Array(12).fill(0), 
      '2024': Array(12).fill(0), 
      '2025': Array(12).fill(0),
    }
    try {
      const docSnap = await getDocs(collection(db, 'products'));
      const products = [];
      docSnap.forEach((doc) => {
        const data = doc.data();
        products.push(data);
      });
      products.forEach((product) => {
        let expense
        if (product.additional[0]) {
          expense = parseInt(product.initial) + product.additional.reduce((sum, a) => sum += parseInt(a.amount), 0);
        } else {
          expense = product.initial;
        }
        const year = product.purchaseDate.split('-')[0];
        const monthIndex = parseInt(product.purchaseDate.split('-')[1]) - 1;
        expenseAmount[year][monthIndex] += parseInt(expense);
      })
      setMonthlyExpenseData(expenseAmount);
      updateChartDataExpense(expenseAmount['2023']);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="col-span-12 lg:col-span-10 justify-center">

      <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 lg:grid-cols-3  p-4 ">
        <article className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">
          <div>
            <strong className="block text-sm font-medium text-gray-500 mb-3">
              ventes
            </strong>

            <p>
              <span className="text-2xl font-medium text-gray-900">
                $ {saleAmount}
              </span>

              <span className="font-medium ml-3 inline-flex gap-2 self-end rounded bg-pink-100 px-3">{salesstate.bad}</span>
              <span className="font-medium ml-3 inline-flex gap-2 self-end rounded bg-yellow-100 px-3">{salesstate.normal}</span>
              <span className="font-medium ml-3 inline-flex gap-2 self-end rounded bg-green-100 px-3">{salesstate.good}</span>
            </p>
          </div>
        </article>
        <article className="flex flex-col  gap-4 rounded-lg border border-gray-100 bg-white p-6 ">
          <div>
            <strong className="block text-sm font-medium text-gray-500 mb-3">
              totale dépenses
            </strong>

            <p>
              <span className="text-2xl font-medium text-gray-900">
                {" "}
                $ {purchaseAmount}{" "}
              </span>
            </p>
          </div>
        </article>
        <article className="flex flex-col   gap-4 rounded-lg border border-gray-100 bg-white p-6 ">
          <div>
            <strong className="block text-sm font-medium text-gray-500 mb-3">
              voitures en stock
            </strong>

            <p>
              <span className="text-2xl font-medium text-gray-900">
                {" "}
                {products.length}{" "}
              </span>
              <span className="font-medium ml-3 inline-flex gap-2 self-end rounded bg-green-100 px-3">on sale: {products.filter(x => x.state === 'on sale').length}</span>
              <span className="font-medium ml-3 inline-flex gap-2 self-end rounded bg-slate-100 px-3">not on sale: {products.filter(x => x.state === 'not on sale').length}</span>
            </p>
          </div>
        </article>
      </div>
      {/* Doghnut Chart */}
      <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 lg:grid-cols-3  p-4 ">
        <article className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">
          <div>
            <strong className="block text-sm font-medium text-gray-500 mb-3">
              voitures vendues
            </strong>
            <Doughnut data={data_sold} />
          </div>
        </article>
        <article className="flex flex-col  gap-4 rounded-lg border border-gray-100 bg-white p-6 ">
          <div>
            <strong className="block text-sm font-medium text-gray-500 mb-3">
              voitures achetées
            </strong>
            <Doughnut data={data_total} />
          </div>
        </article>
        <article className="flex flex-col   gap-4 rounded-lg border border-gray-100 bg-white p-6 ">
          <div>
            <strong className="block text-sm font-medium text-gray-500 mb-3">
              voitures en stock
            </strong>
            <Doughnut data={data_in_stock} />
          </div>
        </article>
      </div>
      {/* Sales Overview */}
      <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 lg:grid-cols-2  p-4 ">
        <div className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">

          <div>
            <div className="mb-3 text-l">
            <span>
              Ventes de cette année:
              <span className="ml-5 text-2xl">
                ${chart.series[0].data.reduce((sum, a) => sum + a, 0)}
              </span>
            </span>
            </div>
            <div>
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
               onChange={(e) => updateChartData(monthlySalesData[e.target.value])}>
                <option>2023</option>
                <option>2024</option>
                <option>2025</option>
              </select>
            </div>
          </div>
          <div>
          <Chart
            options={chart.options}
            series={chart.series}
            type="bar"
          />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">
            <div className="mb-3 text-l">
            <span>
              aperçu des ventes
              <span className="ml-5 text-2xl">
                ${revenue}
              </span>
            </span>
            </div>

          <div className="grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="salesDateFrom"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                depuis
              </label>
              <input
                type="date"
                name="salesDateFrom"
                id="salesDateFrom"
                value={salesDateRange.from}
                onChange={(e) =>
                  setSalesDateRange({...salesDateRange, from: e.target.value})
                }
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="salesDateTo"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                à
              </label>
              <input
                type="date"
                name="salesDateTo"
                id="salesDateTo"
                value={salesDateRange.to}
                onChange={(e) =>
                  setSalesDateRange({...salesDateRange, to: e.target.value})
                }
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>
          </div>

          <span className="font-medium text-blue-500">
            voitures vendues
          </span>

          <table id="myTb" className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  VIN nombre
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  ventes date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  type de paiement
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  prix/$
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesFiltered.map((sale) => {
                return (
                  <tr key={`${sale.vin}-sale`}>
                    <Popover>
                      <PopoverHandler>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-900 cursor-pointer">{sale.vin}</td>
                      </PopoverHandler>
                      <PopoverContent>
                        <div className="grid grid-cols-5">
                          <div className="grid col-span-2">
                            <p>ventes montante/$</p>
                            <p>ventes équilibre/$</p>
                            <p>nom du client</p>
                            <p>numéro de téléphone du client</p>
                            <p>email client</p>
                          </div>
                          <div className="grid col-span-1">
                          </div>
                          <div className="grid col-span-2">
                            <p>{sale.income.reduce((sum, a) => sum += parseInt(a), 0)}</p>
                            <p>{sale.price - sale.income.reduce((sum, a) => sum += parseInt(a), 0)}</p>
                            <p>{sale.customerName}</p>
                            <p>{sale.phoneNumber}</p>
                            <p>{sale.email}</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{sale.salesDate[0]}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{sale.paymentType}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{sale.price}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <span className="font-medium text-blue-500">
              revenu
          </span>

          <table id="myTb" className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  VIN nombre
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  montant/$
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revenueFiltered.map((sale) => {
                let dates = sale.salesDate;
                return dates.map((date, i) => {
                  return (
                    date >= salesDateRange.from && date <= salesDateRange.to
                    ?
                    <tr key={`${sale.vin}-revenue-${i}`}>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">{sale.vin}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">{date}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">{sale.income[i]}</td>
                    </tr>
                    :
                    <></>
                  )
                })
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses Overview */}
      <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 lg:grid-cols-2  p-4 ">
        <div className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">

          <div>
            <div className="mb-3 text-l">
            <span>
              Dépenses cette année:
              <span className="ml-5 text-2xl">
                ${chartExpense.series[0].data.reduce((sum, a) => sum + a, 0)}
              </span>
            </span>
            </div>
            <div>
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
               onChange={(e) => updateChartDataExpense(monthlyExpenseData[e.target.value])}>
                <option>2023</option>
                <option>2024</option>
                <option>2025</option>
              </select>
            </div>
          </div>
          <div>
          <Chart
            options={chartExpense.options}
            series={chartExpense.series}
            type="bar"
          />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">
            <div className="mb-3 text-l">
            <span>
              aperçu des dépenses
              <span className="ml-5 text-2xl">
                ${expense}
              </span>
            </span>
            </div>

          <div className="grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="expenseDateFrom"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                depuis
              </label>
              <input
                type="date"
                name="expenseDateFrom"
                id="expenseDateFrom"
                value={expenseDateRange.from}
                onChange={(e) =>
                  setExpenseDateRange({...expenseDateRange, from: e.target.value})
                }
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="expenseDateTo"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                à
              </label>
              <input
                type="date"
                name="expenseDateTo"
                id="expenseDateTo"
                value={expenseDateRange.to}
                onChange={(e) =>
                  setExpenseDateRange({...expenseDateRange, to: e.target.value})
                }
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              />
            </div>
          </div>

          <span className="font-medium text-blue-500">
            voitures achetées
          </span>

          <table id="myTb" className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  VIN nombre
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  initiales dépenses/$
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productsFiltered.map((product) => {
                return (
                  <tr key={`${product.vin}-product`}>
                    <Popover>
                      <PopoverHandler>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-900 cursor-pointer">{product.vin}</td>
                      </PopoverHandler>
                      <PopoverContent>
                        <div className="grid grid-cols-5">
                          <div className="grid col-span-2">
                            <p>fabricante</p>
                            <p>modèle</p>
                            <p>année</p>
                            <p>emplacement</p>
                            <p>initiales/$</p>
                            <p>supplémentaire/$</p>
                            <p>totale/$</p>
                            <p>statut</p>
                          </div>
                          <div className="grid col-span-1">
                          </div>
                          <div className="grid col-span-2">
                            <p>{product.manufacturer}</p>
                            <p>{product.model}</p>
                            <p>{product.year}</p>
                            <p>{product.location}</p>
                            <p>{product.initial}</p>
                            <p>{product.additional.reduce((sum, a) => sum += parseInt(a.amount), 0)}</p>
                            <p>{product.initial + product.additional.reduce((sum, a) => sum += parseInt(a.amount), 0)}</p>
                            <p>{product.state}</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{product.purchaseDate}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{product.initial}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <span className="font-medium text-blue-500">
            supplémentaire dépenses
          </span>

          <table id="myTb" className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  VIN nombre
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  montant/$
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenseFiltered.map((expense) => {
                let dates = expense.additional.map((i) => i.date);
                return dates.map((date, i) => {
                  return (
                    date >= expenseDateRange.from && date <= expenseDateRange.to
                    ?
                    <tr key={`${expense.vin}-expense-${i}`}>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">{expense.vin}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">{date}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">{expense.additional[i].amount}</td>
                    </tr>
                    :
                    <></>
                  )
                })
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
