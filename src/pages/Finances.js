import { db } from "../config/firebase.config";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";

import React, { useState, useEffect } from "react";
import AddExpense from "../components/AddExpense";

function Finance() {

  const userData = JSON.parse(localStorage.getItem('user'))

  const collectionRef = collection(db, 'finances', userData.email, 'finances');

  const [expense, setExpense] = useState([]);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [updatePage, setUpdatePage] = useState(true);

  useEffect(() => {
    fetchExpenseData();
  }, [updatePage]);

  // Fetch Data of ALl Expense Items
  const fetchExpenseData = async () => {
    try {
      const ExpenseData = await getDocs(collectionRef);
      let expense = ExpenseData.docs.map((doc) => ({...doc.data(), _id:doc.id}));
      setExpense(expense);
    } catch (err) {
      console.log(err);
    }
  }

  // Delete Item
  const deleteItem = async (id) => {
    try {
      const documentRef = doc(collectionRef, id);
      const confirm = window.confirm("Êtes-vous sûr de supprimer cet élément ?");
      if (confirm === true) {
        await deleteDoc(documentRef);
        handlePageUpdate();
      }
    } catch (err) {
      console.log(err);
    }
  }

  // Modal for Expense Add
  const addExpenseModalSetting = () => {
    setShowAddExpenseModal(!showAddExpenseModal);
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        
        {showAddExpenseModal && (
          <AddExpense 
            collectionRef={collectionRef}
            userData = {userData}
            addExpenseModalSetting={addExpenseModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}

        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">{userData.firstName} {userData.lastName}'s finances</span>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={addExpenseModalSetting}
              >
                ajouter finances
              </button>
            </div>
          </div>
            <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
              <thead>
                <tr>
                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    date
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    genre
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    montante
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    explication
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    statut
                  </th>
                </tr>
              </thead>

              <tbody id="myTb" className="divide-y divide-gray-200">
                {expense.map((element, index) => {
                  return (
                    <tr key={element._id} className={element.state === 'on sale' ? 'bg-green-100' : element.state === 'sold' ? 'bg-slate-200' : 'bg-white'}>
                      <td className="whitespace-nowrap px-2  text-gray-900">
                        {element.date}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.type}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.amount}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.reason}
                      </td>
                      <td className="whitespace-nowrap px-2 text-gray-700">
                        {element.state}
                      </td>
                        <td>
                          <span
                            className="text-red-600 px-4 cursor-pointer"
                            onClick={() => deleteItem(element._id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </span>
                        </td>    
                    </tr>
                  );
                })}
              </tbody>
              
            </table>
        </div>
      </div>
    </div>
  );
}

export default Finance;
