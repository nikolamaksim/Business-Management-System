import {collection, getDocs, doc, where, updateDoc, getDoc, query} from 'firebase/firestore'

import { db } from '../config/firebase.config'

import emailjs from 'emailjs-com';
import React, { useState, useEffect } from "react";
import AddSale from "../components/AddSale";
import {Popover,
        PopoverHandler,
        PopoverContent,
        } from '@material-tailwind/react';
import SearchByVIN from "../components/SearchByVIN";
import UpdateSale from '../components/UpdateSale';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReceiptPDF from './ReceiptPDF';

function Sales() {

  const collectionRef = collection(db, 'sales');

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [sales, setAllSalesData] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [vinArray, setVINArray] = useState([]);
  const [updateInfo, setUpdateInfo] = useState([]);

  useEffect(() => {
    fetchSalesData();
    fetchVINNumber();
  }, [updatePage]);

  // Fetching Data of All Sales
  const fetchSalesData = async () => {
    try {
      const docSnap = await getDocs(collectionRef);
      let salesData = docSnap.docs.map((document) => ({...document.data(), _id: document.id}))
      setAllSalesData(salesData);
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch VIN Numbers of cars on sale
  const fetchVINNumber = async () => {
    try {
      const q = query(collection(db, 'products'), where('state', '==', 'on sale'));
      const docSnap = await getDocs(q);
      const vinarr = docSnap.docs.map((doc) => doc.data().vin);
      setVINArray(vinarr);
    } catch (err) {
      console.log(err);
    }
  }

  // approve the Sale
  const approveSale = async (id) => {
    try {
      const docRef = doc(collectionRef, id);
      let docSnap = (await getDoc(docRef)).data();
      for (let i in docSnap.state) {
        docSnap.state[i] = 'approved'
      }
      updateDoc(docRef, docSnap);
      handlePageUpdate();
    } catch (err) {
      console.log(err);
    }
  }

  // Modal for Sale Add
  const addSaleModalSetting = () => {
    setShowSaleModal(!showSaleModal);
  };

  // Modal for Sale update
  const updateSaleModalSetting = (element) => {
    setUpdateInfo(element);
    setShowUpdateModal(!showUpdateModal);
  }

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  // Send Receipt
  const sendReceipt = async (element) => {
    try {
      const confirm = window.confirm('Are you sure?');
      if (confirm == true) {      // Configure EmailJS with your credentials
        await emailjs.init('BGnkmVYSCeuwRTU6g'); 
    
        const serviceId = 'service_2k35nxg';
        const templateId = 'template_zvmgj4s';
        const userId = 'BGnkmVYSCeuwRTU6g';
    
        const emailParams = {
          to_email: element.email,
          from_name: 'RAZ AUTO SALE',
          vin: element.vin,
          manufacturer: element.manufacturer,
          model: element.model,
          year: element.year,
          customerName: element.customerName,
          paymentType: element.paymentType,
          price: element.price,
          salesDate: element.salesDate[0],
          lastSalesDate: element.salesDate[element.salesDate.length - 1],
          lastPay: element.income[element.income.length - 1],
          totalPay: element.income.reduce((sum, a) => sum += parseInt(a), 0),
          balance: element.price - element.income.reduce((sum, a) => sum += parseInt(a), 0),
          date: new Date().toLocaleDateString(),
        };
    
        emailjs.send(serviceId, templateId, emailParams, userId).then(
          (response) => {
            alert('Email sent successfully:', response.text);
    
            updateDoc(doc(db, 'sales', element._id), {
              receipt: true,
            }).then(() => {
              handlePageUpdate();
            }
            );
          },
          (error) => {
            console.error('Failed to send email:', error);
          }
        );
      } 

      } catch (err) {
      console.log(err);
    }

  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">

        {showSaleModal && (
          <AddSale
            collectionRef={collectionRef}
            addSaleModalSetting={addSaleModalSetting}
            handlePageUpdate={handlePageUpdate}
            vinArray={vinArray}
          />
        )}

        {showUpdateModal && (
          <UpdateSale
            collectionRef={collectionRef}
            updateSaleModalSetting={updateSaleModalSetting}
            handlePageUpdate={handlePageUpdate}
            vinArray={vinArray}
            updateInfo={updateInfo}
          />
        )}

        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">ventes</span>
              <SearchByVIN />
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={addSaleModalSetting}
              >
                ajouter ventes
              </button>
            </div>
          </div>

          {
            JSON.parse(localStorage.getItem('user')).role === 'super'
            ?
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
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    ventes montante/$
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    ventes équilibre/$
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    statut approuvé
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    nom du client
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    numéro de téléphone du client
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    email client
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sales.map((element, index) => {
                  return (
                    <tr key={element._id} className={element.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0) >= element.price ? 'bg-green-100' : element.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0) >= 0.7 * element.price ? 'bg-yellow-100' : 'bg-pink-100'}>
                      <td className="whitespace-nowrap px-4 py-2  text-gray-900">
                        {element.vin}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.salesDate[element.salesDate.length - 1]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.paymentType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.price}
                      </td>
                      <Popover>
                        <PopoverHandler>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 cursor-pointer hover:bg-slate-100">
                            <span>{element.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0)}</span>
                          </td>
                        </PopoverHandler>
                        <PopoverContent>
                          <div className="grid grid-cols-3">
                            <div className="grid">
                              {element.salesDate.map((date, index) => {
                                return <p key={`${element._id}${date}${index}`}>{date}: </p>
                              })}
                            </div>
                            <div className="ml-3">
                              {element.income.map((item, index) => {
                                return <p key={`${element._id}${item}${index}`}>${item}</p>
                              })}
                            </div>
                            <div className="ml-3">
                              {element.state.map((item, index) => {
                                return <p key={`${element._id}${item}${index}`}>{item}</p>
                              })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.price - element.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.state.length ? element.state[element.state.length - 1] : ''}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.customerName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 cursor-pointer hover:bg-slate-100 rounded">
                        <a href={`tel: ${element.phoneNumber}`}>
                          {element.phoneNumber}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 cursor-pointer hover:bg-slate-100 rounded">
                        <a href={`mailto: ${element.email}`}>
                          {element.email}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                        <span
                            className="text-green-700 cursor-pointer"
                            onClick={() => updateSaleModalSetting(element)}
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        <span
                            className="text-green-700 cursor-pointer"
                            onClick={() => approveSale(element._id)}
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </span>
                      </td>
                      {
                        element.state[element.state.length - 1] === 'approved'
                        ?
                        <>
                          <td className="whitespace-nowrap px-4 py-2 text-green-700 cursor-pointer hover:bg-slate-100 rounded">
                            <PDFDownloadLink document={<ReceiptPDF sales={element} />} fileName={`RAS_Receipt_${element.vin} (${new Date().toLocaleDateString()}).pdf`}>
                              {({ blob, url, loading, error }) =>
                                loading ? 'Loading document...'
                                : 
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                </svg>
                              }
                            </PDFDownloadLink>
                          </td>
                          <td className="whitespace-nowrap px-2 text-gray-700">
                            {
                              element.receipt === true
                              ?
                              <></>
                              :
                            <span
                                className="text-green-700 cursor-pointer"
                                onClick={() => sendReceipt(element)}
                              >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                              </svg>
                            </span>
                            }
                          </td>
                        </>
                        :
                        <>
                        <td></td>
                        <td></td>
                        </>
                      }
                    </tr>
                  );
                })}
              </tbody>
            </table>
            :
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
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    ventes montant/$
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    ventes équilibre/$
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    statut approuvé
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    nom du client
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    téléphone du client
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                    email client
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sales.map((element, index) => {
                  return (
                    <tr key={element._id} className={element.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0) >= element.price ? 'bg-green-100' : element.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0) >= 0.7 * element.price ? 'bg-yellow-100' : 'bg-pink-100'}>
                      <td className="whitespace-nowrap px-4 py-2  text-gray-900">
                        {element.vin}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.salesDate[element.salesDate.length - 1]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.paymentType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.price}
                      </td>
                      <Popover>
                        <PopoverHandler>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 cursor-pointer hover:bg-slate-100">
                            <span>{element.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0)}</span>
                          </td>
                        </PopoverHandler>
                        <PopoverContent>
                          <div className="grid grid-cols-3">
                            <div className="grid">
                              {element.salesDate.map((date, index) => {
                                return <p key={`${element._id}${date}${index}`}>{date}: </p>
                              })}
                            </div>
                            <div className="ml-3">
                              {element.income.map((item, index) => {
                                return <p key={`${element._id}${item}${index}`}>${item}</p>
                              })}
                            </div>
                            <div className="ml-3">
                              {element.state.map((item, index) => {
                                return <p key={`${element._id}${item}${index}`}>{item}</p>
                              })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.price - element.income.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a), 0)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.state.length ? element.state[element.state.length - 1] : ''}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.customerName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 cursor-pointer hover:bg-slate-100 rounded">
                        <a href={`tel: ${element.phoneNumber}`}>
                          {element.phoneNumber}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 cursor-pointer hover:bg-slate-100 rounded">
                        <a href={`mailto: ${element.email}`}>
                          {element.email}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                        <span
                            className="text-green-700 cursor-pointer"
                            onClick={() => updateSaleModalSetting(element)}
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </span>
                      </td>
                      {
                        element.state[element.state.length - 1] === 'approved'
                        ?
                        <>
                          <td className="whitespace-nowrap px-4 py-2 text-green-700 cursor-pointer hover:bg-slate-100 rounded">
                            <PDFDownloadLink document={<ReceiptPDF sales={element} />} fileName={`RAS_Receipt_${element.vin} (${new Date().toLocaleDateString()}).pdf`}>
                              {({ blob, url, loading, error }) =>
                                loading ? 'Loading document...'
                                
                                : 
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                </svg>
                              }
                            </PDFDownloadLink>
                          </td>
                          <td className="whitespace-nowrap px-2 text-gray-700">
                            {
                              element.receipt === true
                              ?
                              <></>
                              :
                            <span
                                className="text-green-700 cursor-pointer"
                                onClick={() => sendReceipt(element)}
                              >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                              </svg>
                            </span>
                            }
                          </td>
                        </>
                        :
                        <>
                          <td></td>
                          <td></td>
                        </>
                      }
                    </tr>
                  );
                })}
              </tbody>
            </table>
          }
          
        </div>
      </div>
    </div>
  );
};

export default Sales;
