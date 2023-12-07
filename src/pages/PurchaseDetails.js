import { db } from "../config/firebase.config";
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { storage } from "../config/firebase.config";

import React, { useState, useEffect, useContext } from "react";
import AddPurchaseDetails from "../components/AddPurchaseDetails";
import AuthContext from "../AuthContext";
import UpdatePurchaseDetail from "../components/UpdatePurchaseDetail";
import SearchByVIN from "../components/SearchByVIN";
import { deleteObject, listAll, ref } from "firebase/storage";
import AddVinExpense from "../components/AddVinExpense";
import { Popover, PopoverContent, PopoverHandler } from "@material-tailwind/react";

function PurchaseDetails() {

  const collectionRef = collection(db, 'products');

  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [purchase, setAllPurchaseData] = useState([]);
  const [additional, setAdditional] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [showVinExpenseModal, setShowVinExpenseModal] = useState(false);

  const [updatePage, setUpdatePage] = useState(false);
  const [updateSort, setUpdateSort] = useState(false);
  
  const authContext = useContext(AuthContext);

  const [sortOrderBySale, setSortOrderBySale] = useState(true);
  const [sortOrderByExpense, setSortOrderByExpense] = useState(true);
  const [sortOrderByDate, setSortOrderByDate] = useState(true);
  const [sortOrderByYear, setSortOrderByYear] = useState(true);

  // sort by sales status
  useEffect(() => {
    let order;
    if (sortOrderBySale) {
      order = {
        'on sale': 1,
        'not on sale': 2,
        'sold': 3,
      };
    } else {
      order = {
        'not on sale': 1,
        'on sale': 2,
        'sold': 3,
      };
    }
    purchase.sort((a, b) => {
      return order[a.state] - order[b.state];
    });
    setAllPurchaseData(purchase);
    handleSortUpdate();
  }, [sortOrderBySale]);

  // sort by approval status
  useEffect(() => {
    let order;
    if (sortOrderByExpense) {
      order = {
        'approved': 1,
        'not approved': 2
      };
    } else {
      order = {
        'not approved': 1,
        'approved': 2
      };
    }
    purchase.sort((a, b) => {
      if (additional[a._id].length !== 0) {
        if (additional[b._id].length !== 0) {
          return order[additional[a._id][additional[a._id].length - 1].state] -
                  order[additional[b._id][additional[b._id].length - 1].state]
        } else {
          return -1
        }
      } else {
        return 1
      }
    });
    setAllPurchaseData(purchase);
    handleSortUpdate();
  }, [sortOrderByExpense])

  // sort by date
  useEffect(() => {
    if (sortOrderByDate) {
      purchase.sort((a, b) => {
        if (a.purchaseDate < b.purchaseDate) {
          return -1
        } else {
          return 1
        }
      })
    } else {
      purchase.sort((a, b) => {
        if (a.purchaseDate < b.purchaseDate) {
          return 1
        } else {
          return -1
        }
      });
    }
    setAllPurchaseData(purchase);
    handleSortUpdate();
  }, [sortOrderByDate])

  // sort by year
  useEffect(() => {
    if (sortOrderByYear) {
      purchase.sort((a, b) => {
        if (a.year < b.year) {
          return -1
        } else {
          return 1
        }
      })
    } else {
      purchase.sort((a, b) => {
        if (a.year < b.year) {
          return 1
        } else {
          return -1
        }
      })
    }
    setAllPurchaseData(purchase);
    handleSortUpdate();
  }, [sortOrderByYear])

  useEffect(() => {
    fetchPurchaseData();
  }, [updatePage]);

  // Fetch Data of All Purchase Items
  const fetchPurchaseData = async () => {
    try {
      const findALlPurchaseData = await getDocs(collectionRef);
      let purchaseData = findALlPurchaseData.docs.map((doc) => ({...doc.data(), _id:doc.id}));
      setAllPurchaseData(purchaseData);
      const additional = {};
      for (const element of purchaseData) {
        const docSnaps = await getDocs(collection(db, 'products', element._id, 'additional'));
        const docData = docSnaps.docs.map((doc) => {
          return doc.data();
        })
        additional[element._id] = docData;
        console.log(additional[element._id].length)
      }
      setAdditional(additional);
    } catch (err) {
      console.log(err);
    }
  }

  // Delete Storage Images
  const deleteDirectory = async (vin) => {
    // Create a reference to the directory
    const directoryRef = ref(storage, `images/${vin}`);
    try {
      // Get a list of all items (files and subdirectories) in the directory
      const items = await listAll(directoryRef);
  
      // Delete each item (file or subdirectory) in the directory
      await Promise.all(items.items.map(async (item) => {
        if (item.isDirectory) {
          // Recursively delete subdirectory
          await deleteDirectory(item.fullPath);
        } else {
          // Delete file
          await deleteObject(item);
        }

      }));
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Item
  const deleteItem = async (id, vin) => {
    try {
      const documentRef = doc(db, 'products', id);
      const confirm = window.confirm("Êtes-vous sûr de supprimer cet élément ?");
      if (confirm === true) {
        await deleteDoc(documentRef);
        await deleteDirectory(vin);
        alert('Supprimé avec succès.')
        handlePageUpdate();
      }
    } catch (err) {
      console.log(err);
    }
  }

  // approve the Item for sale
  const approveItem = async (id) => {
    try {
      const docRef = doc(collectionRef, id);
      let docSnap = await getDoc(docRef);
      await updateDoc(docRef, {
        state: docSnap.data().state === 'on sale' ? 'not on sale' : 'on sale',
      });
      handlePageUpdate();
    } catch (err) {
      console.log(err);
    }
  }

  // approve Expense
  const approveExpense = async (element) => {
    try {
      const collectionRef = collection(db, 'products', element._id, 'additional');
      const docSnaps = (await getDocs(collectionRef)).docs;
      for (const document of docSnaps) {
        await updateDoc(doc(collectionRef, document.id), {
          state: 'approved'
        });
      }
      handlePageUpdate();
    } catch (err) {
      console.log(err);
    }
  }

  // undo sale
  const undoSale = async (element) => {
    const confirm = window.confirm('Les données commerciales stockées dans la base de données seront supprimées. Veuillez vous assurer que vous avez stocké les données de vente en lieu sûr avant de les supprimer. Vous devrez également supprimer les données pertinentes de la page Finances.')
    if (confirm) {
      try {
        await updateDoc(doc(db, 'products', element._id), {
          state: 'on sale'
        });
        var q = query(collection(db, 'sales'), where('vin', '==', element.vin));
        var querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docToDelete = querySnapshot.docs[0];
          await deleteDoc(docToDelete.ref);
        } else {
          console.log('No matching document found.');
        }
        handlePageUpdate();
      } catch (err) {
        console.log(err)
      }
     }
  }

  // Modal for Purchase Add
  const addSaleModalSetting = () => {
    setPurchaseModal(!showPurchaseModal);
  };
  
  // Modal for Purchase Update
  const updateProductModalSetting = (element) => {
    setShowUpdateModal(!showUpdateModal);
    setUpdateProduct(element);
  };

  const addExpenseModalSetting = (element) => {
    setShowVinExpenseModal(!showVinExpenseModal);
    setUpdateProduct(element);
  }

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };  
  
  // Handle Page Update
  const handleSortUpdate = () => {
    setUpdateSort(!updateSort);
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">

        {showPurchaseModal && (
          <AddPurchaseDetails
            collectionRef={collectionRef}
            addSaleModalSetting={addSaleModalSetting}
            handlePageUpdate={handlePageUpdate}
            authContext = {authContext}
          />
        )}

        {showUpdateModal && (
          <UpdatePurchaseDetail
            collectionRef={collectionRef}
            updateModalSetting={updateProductModalSetting}
            handlePageUpdate={handlePageUpdate}
            updatePurchaseData={updateProduct}
          />
        )}

        {showVinExpenseModal && (
          <AddVinExpense
            handlePageUpdate={handlePageUpdate}
            addExpenseModalSetting={addExpenseModalSetting}
            updateProduct={updateProduct}
          />
        )}

        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">dépenses</span>
              <SearchByVIN />
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={addSaleModalSetting}
              >
                ajouter dépenses
              </button>
            </div>
          </div>
          {
            JSON.parse(localStorage.getItem('user')).role === 'super'
            ?
            <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
              <thead>
                <tr>
                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    VIN
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    fabricante
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    modèle
                  </th>
                  <th 
                    className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900 cursor-pointer"
                    onClick={() => setSortOrderByYear(!sortOrderByYear)}
                  >
                    <div className="flex justify-between">
                      <span>
                        année
                      </span>
                      <span>
                        {
                          sortOrderByYear === true
                          ?
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                          </svg>
                          :
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                          </svg>
                        }
                      </span>
                    </div>
                  </th>
                  <th 
                    className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900 cursor-pointer"
                    onClick={() => setSortOrderByDate(!sortOrderByDate)}
                  >
                    <div className="flex justify-between">
                      <span>
                        date
                      </span>
                      <span>
                        {
                          sortOrderByDate === true
                          ?
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                          </svg>
                          :
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                          </svg>
                        }
                      </span>
                    </div>
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    emplacement
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    initiales Exp/CFA
                  </th>
                  <th 
                    className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900 flex justify-between cursor-pointer"
                    onClick={() => setSortOrderByExpense(!sortOrderByExpense)}
                  >
                    <span>
                      supplémentaire Exp/CFA
                    </span>
                    <span>
                      {
                        sortOrderByExpense === true
                        ?
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                        </svg>
                      }
                    </span>
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    totale Exp/CFA
                  </th>
                  <th
                    className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900 cursor-pointer flex justify-between"
                    onClick={() => setSortOrderBySale(!sortOrderBySale)}
                  >
                    <span>
                      statut approuvé
                    </span>
                    <span>
                      {
                        sortOrderBySale === true
                        ?
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                        </svg>
                      }
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody id="myTb" className="divide-y divide-gray-200">
                {purchase.map((element, index) => {
                  return (
                    <tr key={element._id} className={element.state === 'on sale' ? 'bg-green-100' : element.state === 'sold' ? 'bg-slate-200' : 'bg-white'}>
                      <td className="whitespace-nowrap px-2  text-gray-900">
                        {element.vin}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.manufacturer}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.model}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.year}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {new Date(element.purchaseDate).toLocaleDateString() ===
                        new Date().toLocaleDateString()
                          ? "Today"
                          : new Date(element.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.location}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {parseInt(element.initial).toLocaleString()}
                      </td>
                      <Popover>
                        <PopoverHandler>
                          <td className="whitespace-nowrap px-2 text-gray-700 cursor-pointer">
                            {additional[element._id] ? additional[element._id].reduce((sum, a) => sum += parseInt(a.amount), 0).toLocaleString() : 0}
                          </td>
                        </PopoverHandler>
                        <PopoverContent>
                          {additional[element._id] && additional[element._id].map((data) => {
                            return (
                              <>
                              <div className="grid grid-cols-12 gap-4">
                                <div className="grid col-span-2">
                                  <p>{data.date}</p>
                                </div>
                                <div className="grid col-span-2">
                                  <p>CFA {parseInt(data.amount).toLocaleString()}</p>
                                </div>
                                <div className="grid col-span-5">
                                  <p>{data.reason}</p>
                                </div>
                                <div className="grid col-span-1">
                                </div>
                                <div className="grid col-span-2">
                                  <p>{data.state}</p>
                                </div>
                              </div>
                              </>
                            )
                          })}
                        </PopoverContent>
                      </Popover>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {
                          additional[element._id] ?
                          (
                            parseInt(element.initial) + additional[element._id].reduce((sum, a) => {
                              if (a.state === 'approved') {
                                sum += parseInt(a.amount)
                              }
                              return sum
                            }, 0)
                          ).toLocaleString() : 
                          element.initial
                        }
                      </td>
                      <td>
                        {element.state}
                      </td>
                      {
                        element.state === 'sold'
                        ?
                        <>
                          <td className="px-2 py-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                            </svg>
                          </td>
                          <td></td>
                          <td></td>
                          <td>
                            <span
                              className="text-green-700 cursor-pointer"
                              onClick={() => undoSale(element)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                              </svg>
                            </span>
                          </td>
                          <td></td>
                        </>
                        :
                        <>
                          <td className="whitespace-nowrap px-2 text-gray-700">
                            <span
                              className="text-green-700 cursor-pointer"
                              onClick={() => updateProductModalSetting(element)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-2 text-gray-700">
                            <span
                              className="text-green-700 cursor-pointer"
                              onClick={() => approveExpense(element)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          </td>
                          <td style={{minWidth:'100px'}}>
                              <button
                                className="text-blue-600 px-2 cursor-pointer hover:bg-slate-300 font-bold p-2 rounded"
                                onClick={() => approveItem(element._id)}
                              >
                                {element.state}
                              </button>
                          </td>
                          <td>
                            <span
                              className="text-red-600 px-4 cursor-pointer"
                              onClick={() => deleteItem(element._id, element.vin)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </span>
                          </td>
                          <td></td>
                        </>
                      }        
                    </tr>
                  );
                })}
              </tbody>
            </table>
            :
            <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
              <thead>
                <tr>
                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    VIN
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    fabricante
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    modèle
                  </th>
                  <th 
                    className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900 cursor-pointer"
                    onClick={() => setSortOrderByYear(!sortOrderByYear)}
                  >
                    <div className="flex">
                      <span>
                        année
                      </span>
                      <span>
                        {
                          sortOrderByYear === true
                          ?
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                          </svg>
                          :
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                          </svg>
                        }
                      </span>
                    </div>
                  </th>
                  <th 
                    className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900 cursor-pointer"
                    onClick={() => setSortOrderByDate(!sortOrderByDate)}
                  >
                    <div className="flex">
                      <span>
                        date
                      </span>
                      <span>
                        {
                          sortOrderByDate === true
                          ?
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                          </svg>
                          :
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                          </svg>
                        }
                      </span>
                    </div>
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    emplacement
                  </th>
                  <th 
                    className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900 cursor-pointer"
                    onClick={() => setSortOrderByExpense(!sortOrderByExpense)}
                  >
                    <div className="flex">
                      <span>
                        supplémentaire Exp/CFA
                      </span>
                      <span>
                        {
                          sortOrderByExpense === true
                          ?
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                          </svg>
                          :
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                          </svg>
                        }
                      </span>
                    </div>
                  </th>
                  <th
                    className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900 cursor-pointer"
                    onClick={() => setSortOrderBySale(!sortOrderBySale)}
                  >
                    <div className="flex">
                      <span>
                        statut approuvé
                      </span>
                      <span>
                        {
                          sortOrderBySale === true
                          ?
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
                          </svg>
                          :
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
                          </svg>
                        }
                      </span>
                    </div>
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody id="myTb" className="divide-y divide-gray-200">
                {purchase.map((element, index) => {
                  return (
                    <tr key={element._id} className={element.state === 'on sale' ? 'bg-green-100' : element.state === 'sold' ? 'bg-slate-200' : 'bg-white'}>
                      <td className="whitespace-nowrap px-2  text-gray-900">
                        {element.vin}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.manufacturer}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.model}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.year}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {new Date(element.purchaseDate).toLocaleDateString() ===
                        new Date().toLocaleDateString()
                          ? "Today"
                          : new Date(element.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.location}
                      </td>
                      <Popover>
                        <PopoverHandler>
                          <td className="whitespace-nowrap px-2 text-gray-700 cursor-pointer">
                            {additional[element._id] ? additional[element._id].reduce((sum, a) => sum += parseInt(a.amount), 0).toLocaleString() : 0}
                          </td>
                        </PopoverHandler>
                        <PopoverContent>
                          {additional[element._id] && additional[element._id].map((data) => {
                            return (
                              <>
                              <div className="grid grid-cols-12 gap-4">
                                <div className="grid col-span-2">
                                  <p>{data.date}</p>
                                </div>
                                <div className="grid col-span-2">
                                  <p>CFA {data.amount}</p>
                                </div>
                                <div className="grid col-span-5">
                                  <p>{data.reason}</p>
                                </div>
                                <div className="grid col-span-1">
                                </div>
                                <div className="grid col-span-2">
                                  <p>{data.state}</p>
                                </div>
                              </div>
                              </>
                            )
                          })}
                        </PopoverContent>
                      </Popover>
                      <td className="whitespace-nowrap px-2 py-2 text-gray-700">
                        <span>
                          {element.state}
                        </span>
                      </td>
                      {
                        element.state === 'sold'
                        ?
                        <>
                        <td className="px-2 py-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                          </svg>
                        </td>
                        </>
                        :     
                        <>
                        <td className="px-2 py-2 text-green-700">
                          <span className="cursor-pointer" onClick={() => addExpenseModalSetting(element)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </td>
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
}

export default PurchaseDetails;
