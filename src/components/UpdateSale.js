import { doc, updateDoc, getDoc,} from 'firebase/firestore';

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function UpdateSale({
  collectionRef,
  updateSaleModalSetting,
  handlePageUpdate,
  vinArray,
  updateInfo,
}) {

  const [sale, setSale] = useState({
    salesDate: '',
    paymentType: updateInfo.paymentType,
    price: updateInfo.price,
    income: '',
    customerName: updateInfo.customerName,
    phoneNumber: updateInfo.phoneNumber,
    email: updateInfo.email,
  });
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  // Handling Input Change for input fields
  const handleInputChange = (key, value) => {
    setSale({ ...sale, [key]: value });
  };

  // POST Data
  const addSale = async () => {
          try {
            const docRef = doc(collectionRef, updateInfo._id);
            const docSnap = await getDoc(docRef);
            let salesData = docSnap.data();
            if (sale.salesDate && sale.income) {
              if (sale.income > sale.price - salesData.income.reduce((sum, a) => sum += a, 0)) {
                window.alert('Veuillez confirmer à nouveau le montant de vos ventes.')
              } else {
                salesData.salesDate.push(sale.salesDate);
                salesData.income.push(sale.income);
                salesData.state.push('not approved');
                salesData.receipt = false;
              }
            }
            salesData.paymentType = sale.paymentType;
            salesData.price = sale.price;
            salesData.customerName = sale.customerName;
            salesData.phoneNumber = sale.phoneNumber;
            salesData.email = sale.email;
            salesData.receipt = false;
            await updateDoc(docRef, salesData);
            updateSaleModalSetting();
            handlePageUpdate();
          } catch (err) {
            console.log(err);
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
                        ajouter ventes
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="vinNumber"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              VIN nombre
                            </label>
                            <select
                              disabled
                              name="vinNumber"
                              id="vinNumber"
                              value={sale.vin}                
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            >
                              <option>{updateInfo.vin}</option>
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
                              ventes date
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
                              placeholder={updateInfo.salesDate}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="paymentType"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              type de paiement
                            </label>
                            <select
                              id="paymentType"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              name="paymentType"
                            >
                              <option>{updateInfo.paymentType}</option>
                              <option>Partial Payment</option>
                              <option>Full Payment</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="price"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              prix
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
                              placeholder={updateInfo.price}
                            />
                          </div>
                          <div className="h-fit w-fit">
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              htmlFor="income"
                            >
                              revenu
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="number"
                              id="income"
                              name="income"
                              value={sale.income}
                              placeholder={updateInfo.income.reduce((sum, a) => sum += parseInt(a), 0)}
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
                              nom du client
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="phone"
                              id="customerName"
                              name="customerName"
                              value={sale.customerName}
                              placeholder={updateInfo.customerName}
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
                              téléphone du client
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="phone"
                              id="phoneNumber"
                              name="phoneNumber"
                              value={sale.phoneNumber}
                              placeholder={updateInfo.phoneNumber}
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
                              email client
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="email"
                              id="email"
                              name="email"
                              value={sale.email}
                              placeholder={updateInfo.email}
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
                    mettre à jour les ventes
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => updateSaleModalSetting()}
                    ref={cancelButtonRef}
                  >
                    annuler
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
