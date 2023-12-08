import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, query, getDocs, where, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";
import { Popover, PopoverContent, PopoverHandler } from "@material-tailwind/react";
import { saveAs } from "file-saver";

const ExcelJS = require('exceljs');

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {

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

  // const [salesData, setSalesData] = useState({});
  // const [salesDataFiltered, setSalesDataFiltered] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [revenueDataFiltered, setRevenueDataFiltered] = useState({});

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
  const [productsFiltered, setProductsFiltered] = useState([])
  const [revenue, setRevenue] = useState(0);

  // Filter the Expense Data
  useEffect(()=> {
    // let salesDataFiltered = {};
    let revenueDataFiltered = {};
    let revenue = [];
    if (expenseDateRange.from && expenseDateRange.to) {
      Object.keys(revenueData).map((key) => {
        if (
          revenueData[key].salesDate >= expenseDateRange.from &&
          revenueData[key].salesDate <= expenseDateRange.to
        ) {
          revenueDataFiltered[key] = revenueData[key]
        }
      })

      setRevenueDataFiltered(revenueDataFiltered);
      revenue = Object.values(revenueDataFiltered).map((revenue) =>{
        return (
          parseInt(revenue.salesAmount - revenue.expenseAmount - revenue.importAmount)
        )
      })
      setRevenue(revenue.reduce((sum,a) => sum += a, 0));
    } else {
      setRevenueDataFiltered({});
      setRevenue(0);
    }
  }, [expenseDateRange])

  // Filter the Finance Data
  useEffect(() => {
    const financeFilter = async () => {
      let financeFiltered = {};
      let productsFiltered = [];
  
      if (financeDateRange.from && financeDateRange.to) {
        // filter finance data
        Object.keys(financeData).map((key) => {
          financeFiltered = {
            ...financeFiltered,
            [key]: []
          }
          for (let i in financeData[key]) {
            if (
              financeData[key][i].date >= financeDateRange.from &&
              financeData[key][i].date <= financeDateRange.to
            ) {
              financeFiltered[key].push(financeData[key][i])
            }
          }
        });
        // filter product data
        productsFiltered = productsTotal.filter((product) => {
          return (product.purchaseDate >= financeDateRange.from && product.purchaseDate <= financeDateRange.to);
        });

        for (let i in productsFiltered) {
          let additionalSnap = await getDocs(collection(db, 'products', productsFiltered[i]._id, 'additional'))
          let additional = additionalSnap.docs.map((doc) => doc.data());
          productsFiltered[i].additional = additional;
        }
      }
  
      setFinanceFiltered(financeFiltered);
      setProductsFiltered(productsFiltered);
    };
    financeFilter();
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

  // Fetch  sales amount
  const fetchTotalSaleAmount = async () => {
    let totalSaleAmount = 0;
    let normal = 0;
    let good = 0;
    let bad = 0;
    try {
      const docSnap = await getDocs(collection(db, 'sales'));
      const salesData = await docSnap.docs.map((doc) => (doc.data()));
      salesData.forEach((sale)=>{
        sale.state.map((state, i) => {
          if (state === 'approved') {
            totalSaleAmount += parseInt(sale.income[i])
          }
        })
        // totalSaleAmount += sale.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0);
        sale.price <= sale.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0) 
        ?
        good += 1
        :
        0.7 * sale.price <= sale.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0)
        ?
        normal += 1
        :
        bad += 1
      });
      setSaleAmount(totalSaleAmount);
      setSalesState({
        good: good,
        normal: normal,
        bad: bad
      });

      const revenueData = {}

      for (const sale of salesData) {
        let salesDetail, salesAmount = 0, expenseAmount = 0, salesDate = 0, importAmount = 0;
        sale.income.map((value, i) => {
          if (sale.state[i] === 'approved')  {
            salesAmount += parseInt(value);
          }
        });

        salesDetail = sale;

        salesDate = sale.salesDate[0];

        const q = query(collection(db, 'products'), where('vin', '==', sale.vin));
        const docSnap = (await getDocs(q)).docs[0];
        const additionalDocs = await getDocs(collection(db, 'products', docSnap.id, 'additional'))
        const additional = additionalDocs.docs.map((doc) => {
          return doc.data();
        });

        expenseAmount = 
          parseInt(docSnap.data().initial) + 
          additional.reduce((sum, a) => {
            if (a.state === 'approved') {
              sum += parseInt(a.amount)
            }
            return sum
          }, 0);

        if (sale.importState ===  'approved') {
          importAmount = sale.import;
        }

        revenueData[sale.vin] = {
          salesDetail: salesDetail,
          salesAmount: salesAmount,
          expenseAmount: expenseAmount,
          importAmount: importAmount,
          salesDate: salesDate,
        }
        setRevenueData(revenueData);
      }

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
      return {...doc.data(), _id: doc.id};
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
        if (data.state === 'approved') {
          let amount = parseInt(data.amount);
          let date = data.date
          let year = date.split('-')[0];
          let month = parseInt(date.split('-')[1]) - 1;
          if (data.type === 'sale') {
            financeAmount[0][year][month] += amount;
          } else if (data.type === 'expense') {
            financeAmount[1][year][month] += amount;
          } else {
            financeAmount[2][year][month] += amount;
          }
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
      const docSnap = await getDocs(collection(db, 'sales'));
      const products = [];
      docSnap.forEach((doc) => {
        const data = doc.data();
        products.push(data);
      });
      products.forEach((product) => {
        product.state.map((state, i) => {
          if (state === 'approved') {
            // let expense = product.income.reduce((sum, a) => sum += parseInt(a), 0);
            let expense = product.income[i];
            // const year = product.salesDate[0].split('-')[0];
            const year = product.salesDate[i].split('-')[0];
            // const monthIndex = parseInt(product.salesDate[0].split('-')[1]) - 1;
            const monthIndex = parseInt(product.salesDate[i].split('-')[1]) - 1;
            expenseAmount[year][monthIndex] += parseInt(expense);
          }
        })
      })
      setMonthlyExpenseData(expenseAmount);
      updateChartDataExpense(expenseAmount['2023']);
    } catch (err) {
      console.log(err);
    }
  }

  // export revenue data
  const exportSalesReport = async () => {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    
    const data = [
      ['VIN', 'informations sur la voiture', 'date', 'depenses/CFA', 'ventes/CFA', 'impot/CFA', 'revenu/CFA', 'type de paiement', 'prix/CFA', 'nom du client', 'email',]
    ];

    await Object.keys(revenueDataFiltered).map((key) => {
      data.push(
        [
          key,
          `${revenueDataFiltered[key].salesDetail.manufacturer} ${revenueDataFiltered[key].salesDetail.model} (${revenueDataFiltered[key].salesDetail.year})`,
          revenueDataFiltered[key].salesDate,
          revenueDataFiltered[key].expenseAmount.toLocaleString(),
          revenueDataFiltered[key].salesAmount.toLocaleString(),
          parseInt(revenueDataFiltered[key].importAmount).toLocaleString(),
          (parseInt(revenueDataFiltered[key].salesAmount) - parseInt(revenueDataFiltered[key].expenseAmount) - parseInt(revenueDataFiltered[key].importAmount)).toLocaleString(),
          revenueDataFiltered[key].salesDetail.paymentType,
          parseInt(revenueDataFiltered[key].salesDetail.price).toLocaleString(),
          revenueDataFiltered[key].salesDetail.customerName,
          revenueDataFiltered[key].salesDetail.email,
        ]
      )
    });

    data.forEach(row => {
      worksheet.addRow(row);
    })

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor:{argb:'FFCCCCCC'},
      };
    });

    for (let i in data[0]) {
      i = Number(i)
      const col = worksheet.getColumn(i+1);
      col.width = 25;
    }

    // Find the last row with data in column A
    const lastRow = worksheet.actualRowCount;

    // Set the formula for the next cell in column A to calculate the sum from A1 to the last row
    for (let i = 2; i <= lastRow; i++) {
      worksheet.getCell(`G${lastRow + 1}`).value += parseInt(worksheet.getCell(`G${i}`).value.replaceAll(',', ''));
      worksheet.getCell(`D${lastRow + 1}`).value += parseInt(worksheet.getCell(`D${i}`).value.replaceAll(',', ''));
      worksheet.getCell(`E${lastRow + 1}`).value += parseInt(worksheet.getCell(`E${i}`).value.replaceAll(',', ''));
      worksheet.getCell(`F${lastRow + 1}`).value += parseInt(worksheet.getCell(`F${i}`).value.replaceAll(',', ''));
    }
    worksheet.getCell(`G${lastRow + 1}`).value = worksheet.getCell(`G${lastRow + 1}`).value.toLocaleString()
    worksheet.getCell(`D${lastRow + 1}`).value = worksheet.getCell(`D${lastRow + 1}`).value.toLocaleString()
    worksheet.getCell(`E${lastRow + 1}`).value = worksheet.getCell(`E${lastRow + 1}`).value.toLocaleString()
    worksheet.getCell(`F${lastRow + 1}`).value = worksheet.getCell(`F${lastRow + 1}`).value.toLocaleString()
    // worksheet.getCell(`F${lastRow + 1}`).formula = `SUM(F2:F${lastRow})`;
    worksheet.getRow(lastRow + 1).eachCell((cell) => {
      cell.font = { bold: true };
    })

    // Write the workbook to a file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Trigger download using FileSaver
      saveAs(blob, `${(new Date).toLocaleDateString()}_sales_report.xlsx`);
    });
  }

  const exportFinanceReport = async () => {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    
    const data = [
      ['manager', 'ventes/CFA', 'depenses/CFA', 'impot/CFA', 'budget/CFA', 'balance/CFA']
    ];

    await Object.keys(financeData).map((user) => {

      let saleAmount = financeFiltered[user].reduce((sum, a) => {
        if (a.type === 'sale' && a.state === 'approved') {
          return sum += parseInt(a.amount)
        }
        return sum
      }, 0)

      let expenseAmount = financeFiltered[user].reduce((sum, a) => {
        if (a.type === 'expense' && a.state === 'approved') {
          return sum += parseInt(a.amount)
        }
        return sum
      }, 0)

      let importAmount = financeFiltered[user].reduce((sum, a) => {
        if (a.type === 'expense' && a.state === 'approved' && a.reason.includes('impot')) {
          return sum += parseInt(a.amount)
        }
        return sum
      }, 0)

      let imbersementAmount = financeFiltered[user].reduce((sum, a) => {
        if (a.type === 'imbersement' && a.state === 'approved') {
          return sum += parseInt(a.amount)
        }
        return sum
      }, 0)

      let balance = saleAmount + imbersementAmount - expenseAmount;

      data.push(
        [
          user,
          saleAmount.toLocaleString(),
          (expenseAmount - importAmount).toLocaleString(),
          importAmount.toLocaleString(),
          imbersementAmount.toLocaleString(),
          balance.toLocaleString(),
        ]
      )
      
    });

    data.forEach(row => {
      worksheet.addRow(row);
    })

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor:{argb:'FFCCCCCC'},
      };
    });

    for (let i in data[0]) {
      i = Number(i)
      const col = worksheet.getColumn(i+1);
      col.width = 25;
    }  

    // Find the last row with data in column A
    const lastRow = worksheet.actualRowCount;
    const cols = ['B', 'C', 'D', 'E', 'F']

    // Set the formula for the next cell in column A to calculate the sum from A1 to the last row
    for (let i = 2; i <= lastRow; i++) {
      for (let col of cols) {
        worksheet.getCell(`${col}${lastRow + 1}`).value += parseInt(worksheet.getCell(`${col}${i}`).value.replaceAll(',', ''));
      }
    }
    for (let col of cols) {
      worksheet.getCell(`${col}${lastRow + 1}`).value = worksheet.getCell(`${col}${lastRow + 1}`).value.toLocaleString()
    }

    worksheet.getRow(lastRow + 1).eachCell((cell) => {
      cell.font = { bold: true };
    })

    // Write the workbook to a file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Trigger download using FileSaver
      saveAs(blob, `${(new Date).toLocaleDateString()}_financial_report.xlsx`);
    });
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
                CFA {" "}
                {
                  revenue
                  ?
                  revenue.toLocaleString()
                  :
                  saleAmount.toLocaleString()}
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
                CFA 
                {" "}
                {
                  productsFiltered[0]
                  ?
                    (productsFiltered.reduce((sum, product) => {
                      sum += (parseInt(product.initial) + (
                        product.additional.reduce((subsum, a) => {
                          return subsum += parseInt(a.amount)
                        }, 0)
                      ))
                      return sum
                    }, 0)
                    +
                    Object.values(financeFiltered).reduce((sum, user) => {
                      for (let finance of user) {
                        if (finance.type === 'expense' && finance.state === 'approved') {
                          sum += parseInt(finance.amount)
                        }
                      }
                      return sum
                    }, 0)).toLocaleString()
                  :
                    (purchaseAmount + 
                      Object.values(financeData).reduce((sum, user) => {
                        for (let finance of user) {
                          if (finance.type === 'expense' && finance.state === 'approved') {
                            sum += parseInt(finance.amount)
                          }
                        }
                        return sum
                      }, 0))
                      .toLocaleString()
                  }{" "}
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
      {/* Fiannce Overview */}
      <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 lg:grid-cols-2  p-4 ">
        {/* chart */}
        <div className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">

          <div>
            <div className="mb-3 text-l">
            <span>
              Aperçu des finances
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
        <div className="overflow-x-auto flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">
            <div className="mb-3 text-l">
              <span>
                Aperçu des finances
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
              {
                Object.keys(financeFiltered).length ?         
                <span 
                  className="text-blue-600 px-2 cursor-pointer hover:bg-slate-300 font-bold p-2 rounded"
                  style={{float: 'right'}}
                  onClick={() => exportFinanceReport()}
                >
                  Export
                </span>
                :
                <></>
              }   
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
                  ventes/CFA
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  depenses/CFA
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  imbersement/CFA
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  balance/CFA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(financeFiltered).map((user) => {
                return (
                  <tr key={user}>
                    <Popover>
                      <PopoverHandler>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-900 cursor-pointer">{user}</td>
                      </PopoverHandler>
                      <PopoverContent>
                        {financeFiltered[user].map((data, index) => {
                          return (
                            <div key={`${user}-${index}`}>
                              <div className="grid grid-cols-12 gap-4">
                                <div className="grid col-span-2">
                                  <p>{data.date}</p>
                                </div>
                                <div className="grid col-span-2">
                                  <p>{data.type}</p>
                                </div>
                                <div className="grid col-span-2">
                                  <p>{parseInt(data.amount).toLocaleString()}</p>
                                </div>
                                <div className="grid col-span-4">
                                  <p>{data.reason}</p>
                                </div>
                                <div className="grid col-span-2">
                                  <p>{data.state}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </PopoverContent>
                    </Popover>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {financeFiltered[user].reduce((sum, a) => {
                        if (a.type === 'sale' && a.state === 'approved') {
                          return sum += parseInt(a.amount)
                        }
                        return sum
                      }, 0).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {financeFiltered[user].reduce((sum, a) => {
                        if (a.type === 'expense' && a.state === 'approved') {
                          return sum += parseInt(a.amount)
                        }
                        return sum
                      }, 0).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {financeFiltered[user].reduce((sum, a) => {
                        if (a.type === 'imbersement' && a.state === 'approved') {
                          return sum += parseInt(a.amount)
                        }
                        return sum
                      }, 0).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {financeFiltered[user].reduce((sum, a) => {
                        if (a.state === 'approved') {
                          if (a.type === 'sale' || a.type === 'imbersement') {
                            sum += parseInt(a.amount);
                          } else {
                            sum -= parseInt(a.amount);
                          }
                        }
                        return sum;
                      }, 0).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* expenses for cars */}
          <table id="myTb" className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  VIN
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  make
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  model
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  depenses/CFA
                </th>
              </tr>
            </thead>
            <tbody>
              {productsFiltered.map((product) => {
                return (
                  <>
                    <tr>
                      <Popover>
                        <PopoverHandler>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-900 cursor-pointer">
                            {product.vin}
                          </td>
                        </PopoverHandler>
                        <PopoverContent>
                          <div className="grid grid-cols-6 gap-4">
                            <div className="grid col-span-3">
                              <p>annie</p>
                              <p>date</p>
                              <p>initial depense</p>
                              <p>emplacement</p>
                              <p>statut</p>
                            </div>
                            <div className="grid col-span-3">
                              <p>{product.year}</p>
                              <p>{product.purchaseDate}</p>
                              <p>CFA {parseInt(product.initial).toLocaleString()}</p>
                              <p>{product.location}</p>
                              <p>{product.state}</p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                        {product.manufacturer}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                        {product.model}
                      </td>
                      <Popover>
                        <PopoverHandler>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-900 cursor-pointer">
                            {
                              product.additional[0] 
                              ?
                              (parseInt(product.initial) +
                              product.additional.reduce((sum, a) => {
                                if (a.state === 'approved') {
                                  sum += parseInt(a.amount)
                                }
                                return sum
                              }, 0)).toLocaleString()
                              :
                              parseInt(product.initial).toLocaleString()
                            }
                          </td>
                        </PopoverHandler>
                        <PopoverContent>
                          {product.additional.map((expense) => {
                            return (
                              <div className="grid grid-cols-10 gap-4">
                                <div className="grid col-span-2">{expense.date}</div>
                                <div className="grid col-span-2">CFA {parseInt(expense.amount).toLocaleString()}</div>
                                <div className="grid col-span-4">{expense.reason}</div>
                                <div className="grid col-span-2">{expense.state}</div>
                              </div>
                            )
                          })}
                        </PopoverContent>
                      </Popover>
                    </tr>
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 lg:grid-cols-2  p-4 ">
        <div className="flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">

          <div>
            <div className="mb-3 text-l">
            <span>
              Aperçu des ventes:
              <span className="ml-5 text-2xl">
                CFA {saleAmount.toLocaleString()}
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
        <div className="overflow-x-auto flex flex-col gap-4 rounded-lg border  border-gray-100 bg-white p-6  ">
            <div className="mb-3 text-l">
              <span>
                Aperçu des ventes:
                <span className="ml-5 text-2xl">
                  CFA {parseInt(revenue).toLocaleString()}
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
              {
                Object.keys(revenueDataFiltered).length ?
                <span 
                  className="text-blue-600 px-2 cursor-pointer hover:bg-slate-300 font-bold p-2 rounded" 
                  style={{float: 'right'}}
                  onClick={() => exportSalesReport()}
                >
                  Export
                </span> :
                <></>
              }
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
                  dépenses/CFA
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  impot/CFA
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  ventes/CFA
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  revenu/CFA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(revenueDataFiltered).map((key) => {
                return (
                  <tr key={`${key}-product`}>
                    <Popover>
                      <PopoverHandler>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-900 cursor-pointer">{key}</td>
                      </PopoverHandler>
                      <PopoverContent>
                              <div className="grid grid-cols-6 gap-4">
                                <div className="grid col-span-3">
                                  <p>customerName</p>
                                  <p>email</p>
                                  <p>manufacturer</p>
                                  <p>model</p>
                                  <p>year</p>
                                  <p>paymentType</p>
                                  <p>price/CFA</p>
                                </div>
                                <div className="grid col-span-3">
                                  <p>{revenueDataFiltered[key].salesDetail.customerName}</p>
                                  <p>{revenueDataFiltered[key].salesDetail.email}</p>
                                  <p>{revenueDataFiltered[key].salesDetail.manufacturer}</p>
                                  <p>{revenueDataFiltered[key].salesDetail.model}</p>
                                  <p>{revenueDataFiltered[key].salesDetail.year}</p>
                                  <p>{revenueDataFiltered[key].salesDetail.paymentType}</p>
                                  <p>{parseInt(revenueDataFiltered[key].salesDetail.price).toLocaleString()}</p>
                                </div>
                              </div>
                      </PopoverContent>
                    </Popover>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{revenueDataFiltered[key].salesDate}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{revenueDataFiltered[key].expenseAmount.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{parseInt(revenueDataFiltered[key].importAmount).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{revenueDataFiltered[key].salesAmount.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">{(parseInt(revenueDataFiltered[key].salesAmount) - parseInt(revenueDataFiltered[key].expenseAmount) - parseInt(revenueDataFiltered[key].importAmount)).toLocaleString()}</td>
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
