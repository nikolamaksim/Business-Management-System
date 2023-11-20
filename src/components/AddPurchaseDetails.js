import { addDoc, getDocs, serverTimestamp, query, where } from "firebase/firestore";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AddPurchaseDetails({
  collectionRef,
  addSaleModalSetting,
  handlePageUpdate,
}) {

  const [purchase, setPurchase] = useState({
    vin: "",
    manufacturer: "",
    model: "",
    year: "",
    purchaseDate: "",
    location: "",
    initial: "",
    additional: [],
    mainImageName: '',
    mainImageUrl: '',
    slideImageUrl: [],
  });

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  // Handling Input Change for input fields
  const handleInputChange = (key, value) => {
    if (value && (key === 'manufacturer' || key === 'model')) {
      value = value[0].toUpperCase() + value.slice(1).toLowerCase();  
    }
    setPurchase({ ...purchase, [key]: value });
  };

  // Add Purchase Data
  const addSale = async () => {
    if (!purchase.vin || 
        !purchase.manufacturer || 
        !purchase.model || 
        !purchase.year || 
        !purchase.purchaseDate || 
        !purchase.location || 
        !purchase.location || 
        !purchase.initial) {
          alert('Veuillez remplir correctement le formulaire.')
        } else {
          try {
            const docCheck = await getDocs(query(collectionRef, where('vin', '==', purchase.vin)));
            if (docCheck.empty) {
              try {
                await addDoc(collectionRef, {...purchase, timestamp: serverTimestamp(), state: 'not on sale'});
                addSaleModalSetting();
                handlePageUpdate();
              } catch (err) {
                console.log(err);
              }
            } else {
              alert ('Les informations sur la voiture existent déjà. Veuillez vérifier à nouveau le numéro VIN.')
            }
          } catch (err) {
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
                        détails des dépenses
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="vin"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              VIN nombre
                            </label>
                            <input
                              id="vin"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              name="vin"
                              placeholder="Input VIN Number"
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="manufacturer"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              fabricante
                            </label>
                            <input
                              type="text"
                              name="manufacturer"
                              id="manufacturer"
                              value={purchase.manufacturer}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Input Manufacturer"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="model"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              modèle
                            </label>
                            <input
                              type="text"
                              name="model"
                              id="model"
                              value={purchase.model}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Input Model"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="year"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              année
                            </label>
                            <input
                              type="number"
                              name="year"
                              id="price"
                              value={purchase.year}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Year"
                            />
                          </div>
                          <div>
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              htmlFor="purchaseDate"
                            >
                              date des dépenses
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="date"
                              id="purchaseDate"
                              name="purchaseDate"
                              value={purchase.purchaseDate}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="location"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              emplacement
                            </label>
                            <select
                              id="location"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              name="location"
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            >
                              <option selected disabled>emplacement</option>
                              <option>Cotonou, Benin</option>
                              <option>Lome, Togo</option>
                              <option>Niamey, Niger</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="initial"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              montant des dépenses initiales
                            </label>
                            <input
                              type="number"
                              name="initial"
                              id="initial"
                              value={purchase.initial}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Initial Amount"
                            />
                          </div>
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
                    ajouter
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
