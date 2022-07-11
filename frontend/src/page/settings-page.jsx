import { Fragment, useEffect, useState } from 'react'
import { Disclosure, Menu, Switch, Transition } from '@headlessui/react'
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { UseCurrentUser } from '../config/CurrentUserContext'

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

export default function MakeSettings() {
    const [dnd, setDnd] = useState(true)
    const storage = getStorage()
    const { user } = UseCurrentUser()
    const [photo, setPhoto] = useState()
    const [photoUrl, setPhotoUrl] = useState()
    const userID = user ? user.uid : "Loading"
    const [userEmail, setUserEmail] = useState()

    async function uploadPhoto() {
        console.log(photo);
        const photoRef = ref(storage, `userPhoto/${user.uid}`)
        await uploadBytes(photoRef, photo)
        const url = await getDownloadURL(photoRef)
        setPhotoUrl(url)
    }

    async function setProfilePic() {
        setUserEmail(user.email)
        const photoRef = ref(storage, `userPhoto/${user.uid}`)
        const url = await getDownloadURL(photoRef)
        setPhotoUrl(url)
    }

    console.log(photoUrl);

    useEffect(() => {
        setProfilePic()
    }, [userID])

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
                                    <h2 className="text-lg leading-6 font-medium text-gray-900">Profile</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This information will be displayed publicly so be careful what you share.
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-col lg:flex-row">
                                    <form action="">
                                        <div className="flex-grow space-y-6">
                                            <div>
                                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                                    Username
                                                </label>
                                                <div className="mt-1 rounded-md shadow-sm flex">
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        id="username"
                                                        autoComplete="username"
                                                        className="focus:ring-light-blue-500 focus:border-light-blue-500 flex-grow block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                                        defaultValue={userEmail}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                    Email
                                                </label>
                                                <div className="mt-1 rounded-md shadow-sm flex">
                                                    <input
                                                        type="text"
                                                        name="email"
                                                        id="email"
                                                        autoComplete="email"
                                                        className="focus:ring-light-blue-500 focus:border-light-blue-500 flex-grow block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                                        defaultValue={userEmail}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                    Password
                                                </label>
                                                <div className="mt-1 rounded-md shadow-sm flex">
                                                    <input
                                                        type="text"
                                                        name="password"
                                                        id="password"
                                                        autoComplete="password"
                                                        className="focus:ring-light-blue-500 focus:border-light-blue-500 flex-grow block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                                        defaultValue={userTest.handle}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <div className="mt-6 flex-grow lg:mt-0 lg:ml-6 lg:flex-grow-0 lg:flex-shrink-0">
                                        <p className="text-sm font-medium text-gray-700" aria-hidden="true">
                                            Photo
                                        </p>


                                        <div className="hidden relative rounded-full overflow-hidden lg:block">
                                            <img className="relative rounded-full w-40 h-40" src={photoUrl} alt="" />
                                            <label
                                                htmlFor="userPhoto"
                                                className="absolute inset-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center text-sm font-medium text-white opacity-0 hover:opacity-100 focus-within:opacity-100"
                                            >
                                                <span>Change</span>
                                                <span className="sr-only"> user photo</span>
                                                <input
                                                    type="file"
                                                    id="userPhoto"
                                                    name="userPhoto"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                                                    onChange={(e) => setPhoto(e.target.files[0])}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy section */}
                            <div className="pt-6 divide-y divide-gray-200">
                                <div className="px-4 sm:px-6">
                                    <div>
                                        <h2 className="text-lg leading-6 font-medium text-gray-900">Privacy</h2>
                                    </div>
                                    <ul className="mt-2 divide-y divide-gray-200">
                                        <Switch.Group as="li" className="py-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <Switch.Label as="p" className="text-sm font-medium text-gray-900" passive>
                                                    Do Not Disturb
                                                </Switch.Label>
                                                <Switch.Description className="text-sm text-gray-500">
                                                    The Do Not Disturb feature mutes all notifications such as invitation, mentions, etc.
                                                </Switch.Description>
                                            </div>
                                            <Switch
                                                checked={dnd}
                                                onChange={setDnd}
                                                className={classNames(
                                                    dnd ? 'bg-teal-500' : 'bg-gray-200',
                                                    'ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500'
                                                )}
                                            >
                                                <span className="sr-only">Use setting</span>
                                                <span
                                                    aria-hidden="true"
                                                    className={classNames(
                                                        dnd ? 'translate-x-5' : 'translate-x-0',
                                                        'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                                                    )}
                                                />
                                            </Switch>
                                        </Switch.Group>

                                    </ul>
                                </div>
                                <div className="mt-4 py-4 px-4 flex justify-end sm:px-6">
                                    <button
                                        type="button"
                                        className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="ml-5 bg-gray-700 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-light-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                                        onClick={uploadPhoto}
                                    >
                                        Save
                                    </button>
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
