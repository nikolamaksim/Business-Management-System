import { db } from "../config/firebase.config";
import { collection, doc, addDoc, serverTimestamp, getDocs, where, updateDoc, query, } from 'firebase/firestore';

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AddSale({
  collectionRef,
  addSaleModalSetting,
  handlePageUpdate,
  vinArray,
}) {

  const [sale, setSale] = useState({
    vinNumber: '',
    salesDate: '',
    paymentType: '',
    price: '',
    income: '',
    customerName: '',
    phoneNumber: '',
    email: '',
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);


  // Handling Input Change for input fields
  const handleInputChange = (key, value) => {
    setSale({ ...sale, [key]: value });
  };

  // POST Data
  const addSale = async () => {
    if (
      !sale.vinNumber ||
      !sale.salesDate ||
      !sale.paymentType ||
      !sale.price ||
      !sale.income ||
      !sale.customerName ||
      !sale.phoneNumber ||
      !sale.email
    ) {
      alert('Please fill out the form correctly.')
    } else {
      try {
<<<<<<< HEAD
          await addDoc(collectionRef, {
            vin: sale.vinNumber,
            salesDate: [sale.salesDate],
            paymentType: sale.paymentType,
            price: sale.price,
            income: [sale.income],
            state: ['not approved'],
            phoneNumber: sale.phoneNumber,
            email: sale.email,
            receipt: false,
            timestamp: serverTimestamp(),
          });
=======

>>>>>>> main
          const q2 = query(collection(db, 'products'), where('vin', '==', sale.vinNumber));
          const docSnap = await getDocs(q2);
          let product_id = docSnap.docs[0].id;
          updateDoc(doc(db, 'products', product_id), {
            state: 'sold',
          });

          const manufacturer = docSnap.docs[0].data().manufacturer;
          const model = docSnap.docs[0].data().model;
          const year = docSnap.docs[0].data().year;

          await addDoc(collectionRef, {
            vin: sale.vinNumber,
            manufacturer: manufacturer,
            model: model,
            year: year,
            salesDate: [sale.salesDate],
            paymentType: sale.paymentType,
            price: sale.price,
            income: [sale.income],
            state: ['not approved'],
            customerName: sale.customerName,
            phoneNumber: sale.phoneNumber,
            email: sale.email,
            receipt: false,
            timestamp: serverTimestamp(),
          });
          addSaleModalSetting();
          handlePageUpdate();
        } catch (err) {
          alert(err);
          console.log(err);
        } 
      }
    }

  return (
    // Modal
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon
                        className="h-6 w-6 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left ">
                      <Dialog.Title
                        as="h3"
                        className="text-lg  py-4 font-semibold leading-6 text-gray-900 "
                      >
                        Add Sale
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="vinNumber"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              VIN Number
                            </label>
                            <select
                              name="vinNumber"
                              id="vinNumber"
                              value={sale.vin}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            >
                              <option disabled selected>Select VIN Number</option>
                              {vinArray.map((element, id) => {
                                return (
                                  <option key = {`${element}${id}`} value={element}>
                                    {element}
                                  </option>
                                )
                              })}
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="salesDate"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Sales Date
                            </label>
                            <input
                              type="date"
                              name="salesDate"
                              id="salesDate"
                              value={sale.salesDate}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="paymentType"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Payment Type
                            </label>
                            <select
                              id="paymentType"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              name="paymentType"
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            >
                              <option disabled selected>Select Payment Type</option>
                              <option>Partial Payment</option>
                              <option>Full Payment</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="price"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Price
                            </label>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              value={sale.price}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                          <div className="h-fit w-fit">
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              htmlFor="income"
                            >
                              Income
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="number"
                              id="income"
                              name="income"
                              value={sale.income}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                          <div className="h-fit w-fit">
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              htmlFor="customerName"
                            >
                              Customer Full Name
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="customerName"
                              id="customerName"
                              name="customerName"
                              value={sale.customerName}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                          <div className="h-fit w-fit">
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              htmlFor="phoneNumber"
                            >
                              Customer Phone Number
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="phone"
                              id="phoneNumber"
                              name="phoneNumber"
                              value={sale.phoneNumber}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                          <div className="h-fit w-fit">
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              htmlFor="email"
                            >
                              Customer Email
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="email"
                              id="email"
                              name="email"
                              value={sale.email}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={addSale}
                  >
                    Add Sale
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => addSaleModalSetting()}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
