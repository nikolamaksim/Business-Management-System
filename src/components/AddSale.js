import { db } from "../config/firebase.config";
import { collection, doc, addDoc, serverTimestamp, getDocs, where, updateDoc, query } from 'firebase/firestore';

import { Fragment, useRef, useState } from "react";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

export default function AddSale({
  collectionRef,
  addSaleModalSetting,
  handlePageUpdate,
  vinArray,
}) {

  const useremail = JSON.parse(localStorage.getItem('user')).email;

  const [searchQuery, setQuery] = useState('');
  const vinArrayFiltered = 
    searchQuery === ''
    ? vinArray
    : vinArray.filter((vin) => {
      return vin.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const [sale, setSale] = useState({
    vinNumber: '',
    salesDate: '',
    paymentType: '',
    price: '',
    income: '',
    import: 0,
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

  const setVinNumber = (vin) => {
    handleInputChange('vinNumber', vin);
  }

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
      alert('Veuillez remplir correctement le formulaire.')
    } else {
      try {
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
            import: sale.import,
            importState: 'not approved',
            state: ['not approved'],
            customerName: sale.customerName,
            phoneNumber: sale.phoneNumber,
            email: sale.email,
            receipt: false,
            timestamp: serverTimestamp(),
          });

          await addDoc(collection(db, 'finances', useremail, 'finances'), {
            amount: sale.income,
            date: sale.salesDate,
            reason: `${sale.income} from ${sale.customerName} (${sale.phoneNumber}, ${sale.email}) for ${manufacturer} ${model} (${year}).`,
            state: 'not approved',
            type: 'sale',
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
                            <Combobox
                              name="vinNumber"
                              value={sale.vinNumber}
                              onChange={setVinNumber}
                            >
                              <div className="relative mt-1">
                                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                                  <Combobox.Input
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    displayValue={(vin) => vin}
                                    onChange={(event) => setQuery(event.target.value)}
                                  />
                                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon
                                      className="h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                  </Combobox.Button>
                                </div>
                                <Transition
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                  afterLeave={() => setQuery('')}
                                >
                                  <Combobox.Options 
                                    name='vinNumber'
                                    className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                    {vinArrayFiltered.length === 0 && searchQuery !== '' ? (
                                      <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                        Nothing found.
                                      </div>
                                    ) : (
                                      vinArrayFiltered.map((vin, i) => (
                                        <Combobox.Option
                                          key={vin}
                                          className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                              active ? 'bg-gray-700 text-white' : 'text-gray-700'
                                            }`
                                          }
                                          value={vin}
                                        >
                                          {({ selected, active }) => (
                                            <>
                                              <span
                                                className={`block truncate ${
                                                  selected ? 'font-medium' : 'font-normal'
                                                }`}
                                              >
                                                {vin}
                                              </span>
                                              {selected ? (
                                                <span
                                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                    active ? 'text-white' : 'text-gray-700'
                                                  }`}
                                                >
                                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                              ) : null}
                                            </>
                                          )}
                                        </Combobox.Option>
                                      ))
                                    )}
                                  </Combobox.Options>
                                </Transition>
                              </div>
                            </Combobox>
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
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            >
                              <option disabled selected>choisir type de paiement</option>
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
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                          <div className="h-fit w-fit">
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              htmlFor="import"
                            >
                              impot
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="number"
                              id="import"
                              name="import"
                              value={sale.import}
                              disabled
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
                              nom complet du client
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
                              téléphone du client
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
                              email client
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
                    ajouter ventes                    
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => addSaleModalSetting()}
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
