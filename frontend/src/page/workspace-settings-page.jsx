import { Fragment, useEffect, useState } from 'react'
import { Disclosure, Menu, Switch, Transition } from '@headlessui/react'
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { UseCurrentUser } from '../config/CurrentUserContext'
import { ExclamationIcon } from '@heroicons/react/solid'
import { Link, useParams } from 'react-router-dom'
import { arrayRemove, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from '@firebase/firestore'
import { db } from '../config/firebaseConfig'

const userTest = {
    name: 'Debbie Lewis',
    handle: 'deblewis',
    email: 'debbielewis@example.com',
    imageUrl:
        'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=320&h=320&q=80',
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MakeWorkspaceSettings() {
    const [isPublic, setIsPublic] = useState(true)
    const storage = getStorage()
    const { user } = UseCurrentUser()
    const [photo, setPhoto] = useState()
    const [photoUrl, setPhotoUrl] = useState()
    const userID = user ? user.uid : "Loading"
    const [userEmail, setUserEmail] = useState()

    const { wID } = useParams()

    const [wName, setWName] = useState()
    const [wDesc, setWDesc] = useState()
    const [isAdmin, setIsAdmin] = useState()

    useEffect(() => {
        const q = query(collection(db, 'workspaces'));
        onSnapshot(q, (docs) => {
            docs.forEach(doc => {
                if (doc.id == wID) {
                    setWName(doc.data().title)
                    setWDesc(doc.data().description)
                    if (doc.data().visibility === "public")
                        setIsPublic(false)
                    else
                        setIsPublic(true)
                    for (var j = 0; j < doc.data().members.length; j++) {
                        if (doc.data().members[j].memberId === userID) {
                            setIsAdmin(doc.data().members[j].isAdmin)
                        }
                    }
                }
            });
        })

        // const q2 = query(collection(db, "workspaces", wID, "boards"))
        // onSnapshot(q, (docs) => {
        //     docs.forEach(doc => {
                
        //     })
        // })
    }, [wID])

    const deleteWorkspace = async () => {
        const del = doc(db, "workspaces", wID);
        await deleteDoc(del)
        console.log("done")

        

        updateDoc(doc(db, "users", userID), {
            myWorkspaces: arrayRemove({
                workspaceId: wID,
                workspaceName: wName
            })
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })
    }

    function saveWorkspaceChange() {
        updateDoc(doc(db, "workspaces", wID), {
            title: wName,
            description: wDesc,
            visibility: !isPublic ? "public" : "private"
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })
    }

    return (
        <div>

            <div className="max-w-screen-xl mx-auto pb-6 px-4 sm:px-6 lg:pb-16 lg:px-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                        {/* <form className="divide-y divide-gray-200 lg:col-span-9" method="GET" onSubmit={() => uploadPhoto()}> */}
                        {/* Profile section */}
                        <div className="divide-y divide-gray-200 lg:col-span-9">
                            <div className="py-6 px-4 sm:p-6 lg:pb-8">
                                <div>
                                    <h2 className="text-lg leading-6 font-medium text-gray-900">Setting</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This information will be displayed publicly so be careful what you share.
                                    </p>
                                </div>
                                <div className="mt-6 flex flex-col lg:flex-row">
                                    <form action="">
                                        <div className="flex-grow space-y-6">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                    Title
                                                </label>
                                                <div className="mt-1 rounded-md shadow-sm flex">
                                                    {isAdmin ? (
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            id="title"
                                                            autoComplete="title"
                                                            className="focus:ring-light-blue-500 focus:border-light-blue-500 flex-grow block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                                            defaultValue={wName}
                                                            onChange={(e) => setWName(e.target.value)}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            id="title"
                                                            autoComplete="title"
                                                            className="focus:ring-light-blue-500 focus:border-light-blue-500 flex-grow block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                                            defaultValue={wName}
                                                            onChange={(e) => setWName(e.target.value)}
                                                            readOnly
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="desc" className="block text-sm font-medium text-gray-700">
                                                    Description
                                                </label>
                                                <div className="mt-1 rounded-md shadow-sm flex">
                                                    {isAdmin ? (
                                                        <input
                                                            type="text"
                                                            name="desc"
                                                            id="desc"
                                                            autoComplete="desc"
                                                            className="focus:ring-light-blue-500 focus:border-light-blue-500 flex-grow block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                                            defaultValue={wDesc}
                                                            onChange={(e) => setWDesc(e.target.value)}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            name="desc"
                                                            id="desc"
                                                            autoComplete="desc"
                                                            className="focus:ring-light-blue-500 focus:border-light-blue-500 flex-grow block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                                            defaultValue={wDesc}
                                                            onChange={(e) => setWDesc(e.target.value)}
                                                            readOnly
                                                        />
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Privacy section */}
                            <div className="pt-6 divide-y divide-gray-200">
                                <div className="px-4 sm:px-6">
                                    <div>
                                        <h2 className="text-lg leading-6 font-medium text-gray-900">Visibility</h2>
                                    </div>
                                    <ul className="mt-2 divide-y divide-gray-200">
                                        <Switch.Group as="li" className="py-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <Switch.Label as="p" className="text-sm font-medium text-gray-900" passive>
                                                    Workspace Visibility
                                                </Switch.Label>
                                            </div>
                                            <div>
                                                <span className="pb-1 text-sm font-medium text-gray-700">Public</span>
                                                {isAdmin ? (
                                                    <Switch
                                                        checked={isPublic}
                                                        onChange={setIsPublic}
                                                        className={classNames(
                                                            isPublic ? 'bg-teal-500' : 'bg-gray-200',
                                                            'ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500'
                                                        )}

                                                    >
                                                        <span className="sr-only">Use setting</span>
                                                        <span
                                                            aria-hidden="true"
                                                            className={classNames(
                                                                isPublic ? 'translate-x-5' : 'translate-x-0',
                                                                'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                                                            )}
                                                        />
                                                    </Switch>
                                                ) : (
                                                    <Switch
                                                        checked={isPublic}
                                                        onChange={setIsPublic}
                                                        className={classNames(
                                                            isPublic ? 'bg-teal-500' : 'bg-gray-200',
                                                            'ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500'
                                                        )}
                                                        disabled
                                                    >
                                                        <span className="sr-only">Use setting</span>
                                                        <span
                                                            aria-hidden="true"
                                                            className={classNames(
                                                                isPublic ? 'translate-x-5' : 'translate-x-0',
                                                                'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                                                            )}
                                                        />
                                                    </Switch>
                                                )}

                                                <span className="pl-2 pb-1 text-sm font-medium text-gray-700">Private</span>
                                            </div>
                                        </Switch.Group>
                                    </ul>
                                </div>
                                <div className="pt-6 divide-y divide-gray-200">
                                    {isAdmin ? (
                                        <div className="px-4 sm:px-6">
                                            <div>
                                                <h2 className="text-lg leading-6 font-medium text-gray-900">Delete Workspace</h2>
                                            </div>
                                            <div className="flex py-3">
                                                <Link to="/my-workspace" replace>
                                                    <button
                                                        type="button"
                                                        className="w-full inline-flex rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                        onClick={deleteWorkspace}
                                                    >
                                                        <ExclamationIcon className="p-1 w-6 h-6" />
                                                        Delete Workspace
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : ""}

                                    <div className="mt-4 py-4 px-4 flex justify-end sm:px-6">
                                        <button
                                            type="button"
                                            className="ml-5 bg-gray-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-light-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                                            onClick={saveWorkspaceChange}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* </form> */}
                    </div>
                </div>
            </div>
        </div>
    )
}
