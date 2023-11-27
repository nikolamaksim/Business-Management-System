import React from "react";
import { Link } from "react-router-dom";

function SideMenu() {
  const localStorageData = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      {JSON.parse(localStorage.getItem('user')).role === 'super'
          ?
          <div className="w-full h-full flex-col justify-between bg-white hidden lg:flex ">
            <div className="px-4 py-6">
              <nav aria-label="Main Nav" className="mt-6 flex flex-col space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-2 rounded-lg hover:bg-gray-100 focus:ring px-4 py-2 text-gray-700"
                >
                  <img
                  className="w-5"
                    alt="dashboard-icon"
                    src={require("../assets/new_icons/dashboard.png")}
                  />
                  <span className="text-sm font-medium"> tableau de bord </span>
                </Link>

                <Link
                  to="/inventory"
                  className="flex items-center gap-2 rounded-lg hover:bg-gray-100 focus:ring px-4 py-2 text-gray-700"
                >
                  <img
                  className="w-5"
                    alt="inventory-icon"
                    src={require("../assets/new_icons/inventory.png")}
                  />
                  <span className="text-sm font-medium"> inventaire </span>
                </Link>

                <Link
                  to="/purchase"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 focus:ring hover:text-gray-700"
                >
                  <img
                  className="w-5"
                    alt="purchase-icon"
                    src={require("../assets/new_icons/purchase.png")}
                  />
                  <span className="text-sm font-medium"> dépenses </span>
                </Link>

                <Link
                  to="/sales"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 focus:ring hover:text-gray-700"
                >
                  <img
                  className="w-5"
                   alt="sale-icon"
                   src={require("../assets/new_icons/sales.png")}
                    />
                  <span className="text-sm font-medium"> ventes</span>
                </Link>

                <Link
                  to="/users"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 focus:ring hover:text-gray-700"
                >
                  <img 
                    className="w-5"
                    alt="user-icons" 
                    src={require("../assets/new_icons/users.png")} 
                  />
                  <span className="text-sm font-medium"> utilisateur </span>
                </Link>

                <Link
                  to="/imageupload"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 focus:ring hover:text-gray-700"
                >
                  <img 
                    className="w-5"
                    alt="user-icons" 
                    src={require("../assets/new_icons/image.png")} 
                  />
                  <span className="text-sm font-medium"> Téléchargement d'images </span>
                </Link>

              </nav>
            </div>
            <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">

                <div>
                  <p className="text-xs">
                    <strong className="block font-medium">
                      {localStorageData.firstName + " " + localStorageData.lastName}
                    </strong>

                    <span> {localStorageData.email} </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          :
          <div className="h-full flex-col justify-between bg-white hidden lg:flex ">
          <div className="px-4 py-6">
            <nav aria-label="Main Nav" className="mt-6 flex flex-col space-y-1">
            <Link
                  to="/inventory"
                  className="flex items-center gap-2 rounded-lg hover:bg-gray-100 focus:ring px-4 py-2 text-gray-700"
                >
                  <img
                  className="w-5"
                    alt="inventory-icon"
                    src={require("../assets/new_icons/inventory.png")}
                  />
                  <span className="text-sm font-medium"> inventaire </span>
                </Link>

                <Link
                  to="/purchase"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 focus:ring hover:text-gray-700"
                >
                  <img
                  className="w-5"
                    alt="purchase-icon"
                    src={require("../assets/new_icons/purchase.png")}
                  />
                  <span className="text-sm font-medium"> dépenses </span>
                </Link>

                <Link
                  to="/sales"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 focus:ring hover:text-gray-700"
                >
                  <img className="w-5" alt="sale-icon" src={require("../assets/new_icons/sales.png")} />
                  <span className="text-sm font-medium"> ventes</span>
                </Link>

                <Link
                  to="/imageupload"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 focus:ring hover:text-gray-700"
                >
                  <img 
                    className="w-5"
                    alt="user-icons" 
                    src={require("../assets/new_icons/image.png")} 
                  />
                  <span className="text-sm font-medium"> Téléchargement d'images </span>
                </Link>

                <Link
                  to="/finance"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 focus:ring hover:text-gray-700"
                >
                  <img 
                    className="w-5"
                    alt="user-icons" 
                    src={require("../assets/new_icons/image.png")} 
                  />
                  <span className="text-sm font-medium"> finances </span>
                </Link>

            </nav>
          </div>
          <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">

              <div>
                <p className="text-xs">
                  <strong className="block font-medium">
                    {localStorageData.firstName + " " + localStorageData.lastName}
                  </strong>

                  <span> {localStorageData.email} </span>
                </p>
              </div>
            </div>
          </div>
        </div>
          } 
          </>
  );
}

export default SideMenu;
