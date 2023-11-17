import React, { useEffect, useState } from "react";

import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from "../config/firebase.config";

import SearchByVIN from "../components/SearchByVIN";

function ImageUpload() {

    const [updatePage, setUpdatePage] = useState(true);
    const [purchaseData, setAllPurchaseData] = useState([]);

    useEffect(() => {
        fetchPurchaseData();
    }, [updatePage]);

    // Fetch Data of ALl Purchase Items
    const fetchPurchaseData = async () => {
        try {
        const findALlPurchaseData = await getDocs(collection(db, 'products'));
        let purchaseData = findALlPurchaseData.docs.map((doc) => ({...doc.data(), _id:doc.id}));
        setAllPurchaseData(purchaseData);
        } catch (err) {
        console.log(err);
        }
    }

    // Upload Image
    const upload = async (e, element) => {
        console.log(e.target.id.split(' ')[0]);
        console.log(e.target.files[0]);
        const storageRef = ref(storage, `images/${element.vin}/${e.target.id.split(' ')[0]}/${e.target.files[0].name}`);
        try {
            await uploadBytes(storageRef, e.target.files[0]);
            const docSnap = (await getDoc(doc(db, 'products' , element._id))).data();
            getDownloadURL(storageRef)
            .then((url) => {
                console.log(url);
                if (e.target.id.split(' ')[0] === 'mainImage') {
                    updateDoc(doc(db, 'products', element._id), {
                        mainImageUrl: url,
                        mainImageName: e.target.files[0].name,
                    })
                    .then(() => {
                        alert('Main Image Uploaded Successfully.')
                    })
                } else {
                    docSnap.slideImageUrl.push(
                        {[e.target.files[0].name]: url},
                        );
                    updateDoc(doc(db, 'products', element._id), {
                        slideImageUrl: docSnap.slideImageUrl,
                    })
                    .then(() => {
                        alert('SlideShow Image Uploaded Successfully.')
                    })
                }
            });
            console.log('sucess');
            handlePageUpdate();
        } catch (err) {
            console.log(err);
        }
    }

    // Delete Main Image
    const deleteMainImage = async (element) => {
        const storageRef = ref(storage, `images/${element.vin}/mainImage/${element.mainImageName}`);
        try {
            await deleteObject(storageRef);
            await updateDoc(doc(db, 'products', element._id), {
                mainImageName: '',
                mainImageUrl: '',
            });
            handlePageUpdate();
        } catch (err) {
            console.log(err);
        }
    }    
    
    // Delete Slide Image
    const deleteSlideImage = async (name, element) => {
        const storageRef = ref(storage, `images/${element.vin}/slideImage/${name}`);
        try {
            await deleteObject(storageRef);
            const docSnap = (await getDoc(doc(db, 'products' , element._id))).data();
            const slideImageUrl = docSnap.slideImageUrl.filter(item => !(name in item));
            await updateDoc(doc(db, 'products', element._id), {
                slideImageUrl: slideImageUrl,
            });
            handlePageUpdate();
        } catch (err) {
            console.log(err);
        }
    }

    // Handle Page Update
    const handlePageUpdate = () => {
        setUpdatePage(!updatePage);
    };

    return (
        <div className="col-span-12 lg:col-span-10 flex justify-center">
          <div className=" flex flex-col gap-5 w-11/12">
            {/* Table  */}
            <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 ">
              <div className="flex justify-between pt-5 pb-3 px-3">
                <div className="flex gap-4 justify-center items-center ">
                  <span className="font-bold">Search Images</span>
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
                      Main Image
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900" style={{minWidth: '350px'}}>
                      Images for slideshow
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                      Upload Main Image
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                      Upload Slide Images
                    </th>
                  </tr>
                </thead>
    
                <tbody className="divide-y divide-gray-200">
                  {purchaseData.map((element) => {
                    return (
                      <tr key={element.vin}>
                        <td className="whitespace-nowrap px-4 py-2  text-gray-900">
                          {element.vin}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                          <span className="flex justify-between inline-block rounded-md shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <img 
                                className="h-8"
                                src={element.mainImageUrl}
                                alt='main'
                            />
                            <svg onClick={() => deleteMainImage(element)} xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 cursor-pointer">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                        </td>
                        <td className="flex justify-start gap-2 whitespace-nowrap px-4 py-2 text-gray-700" style={{minWidth: '350px'}}>
                          {element.slideImageUrl.map((item) => {
                            const name = Object.keys(item)[0];
                            return (
                                <span style={{minWidth: '70px'}} key={Object.keys(item)} className="flex inline-block rounded-md shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <img
                                        className="h-8"
                                        src={Object.values(item)}
                                        alt='slide'
                                    />
                                    <svg onClick={() => deleteSlideImage(name, element)} xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 cursor-pointer">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </span>
                            )
                          })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                            {
                                element.mainImageName
                                ?
                                <>Only One is Allowed</>
                                :
                                <div>
                                    <label
                                        htmlFor={"mainImage " + element.vin}
                                        className="cursor-pointer inline-block rounded-md shadow-sm py-2 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg
                                        className="w-6 h-6 inline-block mr-2"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        >
                                        <path
                                            d="M3 16V21H21V16H3ZM5 18H19V16H5V18ZM3 6H21V14H3V6ZM5 10H19V8H5V10Z"
                                            fill="currentColor"
                                        />
                                        </svg>
                                        <span className="inline-block">
                                            Upload Main Image
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        id={"mainImage " + element.vin}
                                        className="hidden"
                                        accept=".png, .jpeg, .jpg"
                                        onChange={(e) => upload(e, element)}
                                    />
                                </div>
                            }
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                            <div>
                                <label
                                    htmlFor={"slideImage " + element.vin}
                                    className="cursor-pointer inline-block rounded-md shadow-sm py-2 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <svg
                                    className="w-6 h-6 inline-block mr-2"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path
                                        d="M3 16V21H21V16H3ZM5 18H19V16H5V18ZM3 6H21V14H3V6ZM5 10H19V8H5V10Z"
                                        fill="currentColor"
                                    />
                                    </svg>
                                    <span className="inline-block">
                                        Upload Slide Images
                                    </span>
                                </label>
                                <input
                                    type="file"
                                    id={"slideImage " + element.vin}
                                    className="hidden"
                                    accept=".png, .jpeg, .jpg"
                                    onChange={(e) => upload(e, element)}
                                />
                            </div>
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

export default ImageUpload;
