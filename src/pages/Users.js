import { db } from "../config/firebase.config";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../AuthContext";
import SearchByVIN from "../components/SearchByVIN";
import AddUser from "../components/AddUser";
import ConfirmationModal from "../components/ConfirmationModal";

function Users() {

  const collectionRef = collection(db, 'users');

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showUserModal, setUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);

  const [idForDeletion, setIdForDeletion] = useState('');
  
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchUserData();
  }, [updatePage]);

  // Fetch Data of ALl User Items
  const fetchUserData= async () => {
    try {
      const findAllUserData = await getDocs(collectionRef);
      let userData = findAllUserData.docs.map((doc) => ({...doc.data(), _id:doc.id}));
      setUsers(userData);
    } catch (err) {
      console.log(err);
    }
  }

  // Delete Item
  const deleteItem = async (id = idForDeletion) => {
    try {
      const documentRef = doc(db, 'users', id);
      await deleteDoc(documentRef);
      handlePageUpdate();
      confirmationModalSetting();
    } catch (err) {
      console.log(err);
    }
  }

  // Confirmation Modal Setting
  const confirmationModalSetting = () => {
    setShowConfirmationModal(!showConfirmationModal)
  }

  // Modal for User Add
  const addUserModalSetting = () => {
    setUserModal(!showUserModal);
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10  flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">

        {showUserModal && (
          <AddUser
            collectionRef={collectionRef}
            addUserModalSetting={addUserModalSetting}
            handlePageUpdate={handlePageUpdate}
            authContext = {authContext}
          />
        )}

        {showConfirmationModal && (
            <ConfirmationModal 
                executeFunction={deleteItem}
                confirmationModalSetting={confirmationModalSetting}
            />
        )}

        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">Purchase</span>
              <SearchByVIN />
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs  rounded"
                onClick={addUserModalSetting}
              >
                Add New User
              </button>
            </div>
          </div>
            <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
              <thead>
                <tr>
                <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    Name
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    Email
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    phoneNumber
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    Password
                  </th>
                  <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-gray-900">
                    Super User?
                  </th>
                </tr>
              </thead>

              <tbody id="myTb" className="divide-y divide-gray-200">
                {users.map((element, index) => {
                  return (
                    <tr key={element._id} className={element.state === 'on sale' ? 'bg-green-100' : element.state === 'sold' ? 'bg-slate-200' : 'bg-white'}>
                      <td className="whitespace-nowrap px-2 py-2  text-gray-900">
                        {element.firstName} {element.lastName}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-gray-700">
                        {element.email}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-gray-700">
                        {element.phoneNumber}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-gray-700">
                        {element.password}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-gray-700">
                        {element.role === 'super'
                        ?
                        'Yes'
                        :
                        'No'}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-gray-700">
                        {
                            element.email === 'peter95613@gmail.com'
                            ?
                            <span>Default User</span>
                            :
                            <span
                                className="text-red-600 px-4 cursor-pointer"
                                onClick={() => {setIdForDeletion(element._id); confirmationModalSetting()}}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </span>
                        }
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

export default Users;
