// import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";
import logo from '../assets/car.png'
import signin from '../assets/signin.png'
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase.config";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('user')) {
        localStorage.removeItem('user')
      }
    },[])

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginUser = async () => {
    if (!form.email ||
        !form.password) {
          alert('Veuillez remplir correctement le formulaire.');
        } else {
          try {
            const q = query(collection(db, 'users'), where('email', '==', form.email));
            const docSnap = await getDocs(q);
            if (!docSnap.docs[0]) {
              alert("L'utilisateur n'existe pas.")
            } else {
              if (docSnap.docs[0].data().password !== form.password) {
                alert("Le mot de passe ne correspond pas.")
              } else {
                  localStorage.setItem('user', JSON.stringify({...docSnap.docs[0].data(), _id: docSnap.docs[0].id}));
                  authContext.signin(docSnap.docs[0].id, () => {
                  navigate("/");
                })
              }
            }
          } catch (err) {
            console.log(err)
          }
        }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen  items-center place-items-center">
        <div className="flex justify-center">
          <img src={signin} alt="signin" />
        </div>
        <div className="w-full max-w-md space-y-8 p-10 rounded-lg">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src={logo}
              alt="logo"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              se connecter
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div className="my-5">
                <label htmlFor="email-address" className="sr-only">
                  adresse e-mail
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="adresse e-mail"
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={loginUser}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                </span>
                se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
