import React, { useState, useEffect } from "react";
import SearchByVIN from "../components/SearchByVIN";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase.config";

function Inventory() {
  const collectionRef = collection(db, 'products');
  const [products, setAllProducts] = useState([]);

  useEffect(() => {
    fetchProductsData();
  }, []);

  // Fetching Data of All Products
  const fetchProductsData = async () => {
    try {
      const q = query(collectionRef, where('state', 'in', ['not on sale', 'on sale']));
      const findAllProductData = await getDocs(q);
      let productData = findAllProductData.docs.map((doc) => ({...doc.data(), _id:doc.id}));
      setAllProducts(productData);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className=" flex flex-col gap-5 w-11/12">
        {/* Table  */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold">Inventory</span>
              <SearchByVIN />
            </div>
          </div>
          <table id="myTb" className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  VIN
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Make
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Model
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Year
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Condition
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Availability
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {products.map((element, index) => {
                return (
                  <tr key={element._id} className={element.state === 'on sale' ? 'bg-green-100' : 'bg-white'}>
                    <td className="whitespace-nowrap px-4 py-2  text-gray-900">
                      {element.vin}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.manufacturer}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.model}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.year}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.condition}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {element.state}
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

export default Inventory;
