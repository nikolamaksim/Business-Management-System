import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, doc, getDoc, query, getDocs, where, documentId } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { Popover, PopoverContent, PopoverHandler } from "@material-tailwind/react";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {

  const [users, setUsers] = useState([]);
  const [saleAmount, setSaleAmount] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState([]);
  const [products, setProducts] = useState([]);
  const [financeData, setFinanceData] = useState({});
  const [productsTotal, setProductsTotal] = useState([]);
  const [salesstate, setSalesState] = useState({
    good: 0,
    normal: 0,
    bad: 0
  });
  // const [finances, setFinances] = useState({});

  // Variables for Filtering
  const [financeDateRange, setFinanceDateRange] = useState({
    from: '',
    to: ''
  });

  const [expenseDateRange, setExpenseDateRange] = useState({
    from: '',
    to: ''
  });

  const [financeFiltered, setFinanceFiltered] = useState({})

  const [productsFiltered, setProductsFiltered] = useState([]);
  const [expense, setExpense] = useState(0);

  // Filter the Expense Data
  useEffect(()=> {
    let productsFiltered = [];
    let expense = 0;
    if (expenseDateRange.from && expenseDateRange.to) {
      productsFiltered = productsTotal.filter((product) => (product.purchaseDate >= expenseDateRange.from && product.purchaseDate <= expenseDateRange.to));
      setProductsFiltered(productsFiltered);

      expense += productsFiltered.reduce((sum, a) => sum += parseInt(a.initial), 0);
      setExpense(expense);
    } else {
      setProductsFiltered([]);
      setExpense(0);
    }
  }, [expenseDateRange])

  // Filter the Finance Data
  useEffect(() => {
    let financeFiltered = {};
    if (financeDateRange.from && financeDateRange.to) {
      financeFiltered = Object.keys(financeData).map((key) => {
        return financeData[key].filter((item) => (
          item.date >= financeDateRange.from &&
          item.date <= financeDateRange.to
        ))
      })
    }
    setFinanceFiltered(financeFiltered);
  }, [financeDateRange])

  const [manufacturerdata, setManufacturerdata] = useState({});
  const [manufacturerdataTotal, setManufacturerdataTotal] = useState({});
  const [manufacturerdataSold, setManufacturerdataSold] = useState({});
  const [doughnutBackground, setDoughnutBackground] = useState([]);
  const [doughnutBackgroundTotal, setDoughnutBackgroundTotal] = useState([]);
  const [doughnutBackgroundSold, setDoughnutBackgroundSold] = useState([]);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState({});
  const [monthlyFinanceData, setMonthlyFinanceData] = useState({});

  // data for bar plot
  const [chartFinance, setChartFinance] = useState({
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
  const updateChartDataFinance = (salesData) => {
    setChartFinance({
      ...chartFinance,
      series: [
        {
          name: "sales",
          data: [...salesData[0]],
        },
        {
          name: "expenses",
          data: [...salesData[1]],
        },
        {
          name: "imbersement",
          data: [...salesData[2]],
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
    fetchFinance();
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
      totalPurchaseAmount += parseInt(purchase.data().initial);
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

  // Fetch Finance Data
  const fetchFinance = async () => {
    // get userdata
    const docSnap_user = await getDocs(query(collection(db, 'users'), where('role', '==', 'normal')));
    const users = docSnap_user.docs.map((doc) => {return doc.data().email});

    setUsers(users);

    // Retrieve Finance Data
    const finances = {};
    for (const user of users) {
      const docSnaps = await getDocs(collection(db, 'finances', user, 'finances'));
      finances[user] = docSnaps.docs.map((doc) => {
        return doc.data();
      });
    }
    
    setFinanceData(finances);

    // Construct Monthly Finance Data
    // 0: sale, 1: expense, 2: reimbursement
    let financeAmount = Array(3).fill().map(() => ({
      '2023': Array(12).fill(0),
      '2024': Array(12).fill(0),
      '2025': Array(12).fill(0),
    }));

    Object.keys(finances).forEach((key) => {
      finances[key].forEach((data) => {
        let amount = data.amount;
        const year = data.date.split('-')[0];
        const month = parseInt(data.date.split('-')[1]) - 1;
        if (data.type === 'sale') {
          financeAmount[0][year][month] += parseInt(amount);
        } else if (data.type === 'expense') {
          financeAmount[1][year][month] += parseInt(amount);
        } else {
          financeAmount[2][year][month] += parseInt(amount);
        }
      });
    });

    // Set Data for Chart Drawing
    let chartdata = {
      '2023': [],
      '2024': [],
      '2025': []
    }
    Object.keys(chartdata).map((year) => {
      financeAmount.map((data) => {
        // console.log(data)
        chartdata[year].push(data[year]);
      })
    })
    updateChartDataFinance(chartdata['2023']);
    setMonthlyFinanceData(chartdata);
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
        let expense = product.initial;
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
        {/* chart */}
        <div className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">

          <div>
            <div className="mb-3 text-l">
            <span>
              aperçu des finances
              <span className="ml-5 text-2xl">
                {/* ${chart.series[0].data.reduce((sum, a) => sum + a, 0)} */}
              </span>
            </span>
            </div>
            <div>
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
               onChange={(e) => updateChartDataFinance(monthlyFinanceData[e.target.value])}>
                <option>2023</option>
                <option>2024</option>
                <option>2025</option>
              </select>
            </div>
          </div>
          <div>
          <Chart
            options={chartFinance.options}
            series={chartFinance.series}
            type="bar"
          />
          </div>
        </div>
        {/* table */}
        <div className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">
            <div className="mb-3 text-l">
            <span>
              Employee Finances
              <span className="ml-5 text-2xl">
                {/* ${revenue} */}
              </span>
            </span>
            <span 
              className="text-blue-600 px-2 cursor-pointer hover:bg-slate-300 font-bold p-2 rounded" 
              style={{float: 'right'}}
              onClick={() => setFinanceDateRange({
                from: '',
                to: ''
              })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </span>
            </div>
          <div className="grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="salesDateFrom"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                de
              </label>
              <input
                type="date"
                name="salesDateFrom"
                id="salesDateFrom"
                value={financeDateRange.from}
                onChange={(e) =>
                  setFinanceDateRange({...financeDateRange, from: e.target.value})
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
                value={financeDateRange.to}
                onChange={(e) =>
                  setFinanceDateRange({...financeDateRange, to: e.target.value})
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
                  user
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  sales/$
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  expenses/$
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  imbersement/$
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  balance/$
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(financeFiltered).map((user) => {
                return (
                  <tr key={user}>
                    <Popover>
                      <PopoverHandler>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-900 cursor-pointer">{users[user]}</td>
                      </PopoverHandler>
                      <PopoverContent>
                        {financeFiltered[user].map((data) => {
                          return (
                            <>
                            <div className="grid grid-cols-5 gap-4">
                              <div className="grid col-span-1">
                                <p>{data.date}</p>
                              </div>
                              <div className="grid col-span-1">
                                <p>{data.type}</p>
                              </div>
                              <div className="grid col-span-1">
                                <p>{data.amount}</p>
                              </div>
                              <div className="grid col-span-1">
                                <p>{data.reason}</p>
                              </div>
                              <div className="grid col-span-1">
                                <p>{data.state}</p>
                              </div>
                            </div>
                            </>
                          )
                        })}
                      </PopoverContent>
                    </Popover>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {financeFiltered[user].reduce((sum, a) => {
                        if (a.type === 'sale') {
                          return sum += parseInt(a.amount)
                        }
                        return sum
                      }, 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {financeFiltered[user].reduce((sum, a) => {
                        if (a.type === 'expense') {
                          return sum += parseInt(a.amount)
                        }
                        return sum
                      }, 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {financeFiltered[user].reduce((sum, a) => {
                        if (a.type === 'imbersement') {
                          return sum += parseInt(a.amount)
                        }
                        return sum
                      }, 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {financeFiltered[user].reduce((sum, a) => {
                        if (a.type === 'sale' || a.type === 'imbersement') {
                          sum += parseInt(a.amount)
                        } else {
                          sum -= parseInt(a.amount)
                        }
                        return sum;
                      }, 0)}
                    </td>
                  </tr>
                )
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
              acheté des voitures
              <span className="ml-5 text-2xl">
                ${expense}
              </span>
            </span>
            <span 
              className="text-blue-600 px-2 cursor-pointer hover:bg-slate-300 font-bold p-2 rounded" 
              style={{float: 'right'}}
              onClick={() => setExpenseDateRange({
                from: '',
                to: ''
              })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </span>
            </div>

          <div className="grid gap-4 mb-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="expenseDateFrom"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                de
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
                            <p>montante/$</p>
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
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
