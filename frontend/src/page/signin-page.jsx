import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, onSnapshot, query, snapshotEqual, where } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect } from 'react'
import { useState } from "react";
import { db } from "../config/firebaseConfig";

export default function MakeSignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { invID } = useParams()
    const [workspace, setWorkspace] = useState()

    const auth = getAuth();
    const navigate = useNavigate()
    console.log(invID);
    

    useEffect(() => {
        const q = query(collection(db, "inviteList"))
        onSnapshot(q, (docs) => {
            let array = []
            docs.forEach((doc) => {
                array.push({ ...doc.data(), id: doc.id })
            })
            for (let index = 0; index < array.length; index++) {
                if (array[index].id === invID)
                    setWorkspace(array[index])
            }
        })
    }, [invID])

    async function GetSignIn() {
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed in 
                const user = userCredential.user;
                const q = query(collection(db, 'users'), where('id', '==', user.uid))
                const snap = onSnapshot(q, (doc) => {
                    // getMyWorkspace(doc.docs[0].id)
                })
                if (invID) {
                    const now = new Date()
                    if (now.getTime() / 1000 - workspace.date.seconds > 604800) {
                        console.log("expire");
                    }
                    else {
                        navigate('/confirmation/' + invID)
                    }
                }
                else
                    navigate('/my-workspace')
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign In to your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* <form className="space-y-6"> */}
                    <div className="space-y-6">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                }}
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={GetSignIn}
                        >
                            Sign In
                        </button>
                    </div>
                    {/* </form> */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500"></span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-3" />
                        <a
                            href="/sign-up"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign Up
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
