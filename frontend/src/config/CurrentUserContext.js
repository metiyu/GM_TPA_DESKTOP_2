import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore"
import React, { createContext, useContext, useState } from "react"
import { useEffect } from "react"
import { db } from "./firebaseConfig"

let CurrentUserContext = createContext();

export const CurrentUserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [username, setUsername] = useState()
    const [isAdmin, setIsAdmin] = useState()

    useEffect(() => {
        onAuthStateChanged(getAuth(), (user) => {
            setUser(user)
        })
    })

    useEffect(() => {
        const q = query(collection(db, "users"));
        onSnapshot(q, (docs) => {
            let array = []
            docs.forEach(doc => {
                array.push({ ...doc.data(), id: doc.id });
            });
            for (var i = 0; i < array.length; i++) {
                if (array[i].id == user.uid) {
                    setUsername(array[i].username)
                }
            }
        })
    })

    const userAtr = {
        uid: "",
        username: username
    }

    return (
        <CurrentUserContext.Provider value={{ user, userAtr }}>
            {children}
        </CurrentUserContext.Provider>
    )
}

export const UseCurrentUser = () => useContext(CurrentUserContext)