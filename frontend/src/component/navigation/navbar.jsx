import { Fragment, useEffect, useRef, useState } from 'react'
import { Disclosure, Menu, Transition, Popover, Dialog } from '@headlessui/react'
import { SearchIcon } from '@heroicons/react/solid'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, setDoc, doc, updateDoc, arrayUnion, query, onSnapshot } from "firebase/firestore";
import { db } from '../../config/firebaseConfig';
import { UseCurrentUser } from '../../config/CurrentUserContext';
import axios from 'axios'

const solutions = [
    {
        name: 'Create Workspace',
        description: 'A Workspace is a group of boards and people. Use it to organioze your company, side hustle, family, or friends.',
        onclick: true
    },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MakeNavbar() {
    const [open, setOpen] = useState(false);
    const [openInv, setOpenInv] = useState(false)
    const cancelButtonRef = useRef(null);
    const { user, userAtr } = UseCurrentUser();

    const username = user ? userAtr.username : "Loading"

    const [title, setTitle] = useState()
    const [desc, setDesc] = useState()
    const [docId, setDocId] = useState()
    const [toggle, setToggle] = useState(true)

    function createWorkspace(e) {
        e.preventDefault()
        setTitle(e.target.title.value)
        setDesc(e.target.desc.value)
        const titleTemp = e.target.title.value
        const visibility = toggle ? "public" : "private"
        addDoc(collection(db, "workspaces"), {
            title: e.target.title.value,
            description: e.target.desc.value,
            visibility: visibility,
            members: [{
                memberId: user.uid,
                memberName: user.email,
                isAdmin: true
            }]
        }).then((e) => {
            console.log("submitted");
            const docId = e ? e.id : "id"
            console.log(docId);
            setDocId(docId)
            addWorkspaceInUser(user.uid, docId, titleTemp)
        }).catch((e) => {
            console.log("error :", e.message);
        })
    }

    function addWorkspaceInUser(userId, docId, title) {
        updateDoc(doc(db, 'users', userId), {
            myWorkspaces: arrayUnion({
                workspaceId: docId,
                workspaceName: title
            })
        }).then(() => {
            console.log("submitted");
            setOpen(false)
            setOpenInv(true)
        }).catch((e) => {
            console.log(e.message);
        })
    }

    async function sendInvitation(to, link){
        try {
            await axios({
                method: "POST",
                url: "http://localhost:3001/sendInvitation",
                data: {
                    to: to,
                    link: link,
                },
            })
            alert("email sent successful")
        } catch (error) {
            alert(error)
        }
    }

    const [invitedUser, setInvitedUser] = useState()
    function invitePeople(e) {
        e.preventDefault()
        const q = query(collection(db, "users"));
        onSnapshot(q, (docs) => {
            let array = []
            docs.forEach(doc => {
                array.push({ ...doc.data(), id: doc.id });
            });
            for (var i = 0; i < array.length; i++) {
                if (array[i].email === e.target.emailInv.value) {
                    setInvitedUser(array[i])
                    console.log(array[i]);
                }
            }
        })
        if (invitedUser) {
            console.log(invitedUser);
            // addWorkspaceInUser(invitedUser.id, docId, title)
            sendInvitation(invitedUser.email, "asd")
            // addUserInWorkspace(invitedUser.id, invitedUser.email)
            setOpenInv(false)
        }
    }

    const [searchString, setSearchString] = useState()

    return (
        <div>
            <Disclosure as="nav" className="bg-gray-900">
                {({ open }) => (
                    <>
                        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                            <div className="relative flex items-center justify-between h-16">
                                <div className="flex items-center px-2 lg:px-0">
                                    <div className="flex-shrink-0">
                                        <p className="text-white">CHello</p>
                                    </div>
                                    <div className="hidden lg:block lg:ml-6">
                                        <div className="flex space-x-4">
                                            <Popover className="relative">
                                                {({ open }) => (
                                                    <>
                                                        <Popover.Button
                                                            className={classNames(
                                                                open ? 'text-gray-900' : 'text-gray',
                                                                'group rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                                            )}
                                                        >
                                                            <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium" >Create</span>
                                                        </Popover.Button>

                                                        <Transition
                                                            show={open}
                                                            as={Fragment}
                                                            enter="transition ease-out duration-200"
                                                            enterFrom="opacity-0 translate-y-1"
                                                            enterTo="opacity-100 translate-y-0"
                                                            leave="transition ease-in duration-150"
                                                            leaveFrom="opacity-100 translate-y-0"
                                                            leaveTo="opacity-0 translate-y-1"
                                                        >
                                                            <Popover.Panel
                                                                static
                                                                className="absolute z-10 left-1/2 transform -translate-x-10 mt-3 px-2 w-screen max-w-xs sm:px-0"
                                                            >
                                                                <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                                                                    <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                                                                        {solutions.map((item) => (
                                                                            <button
                                                                                key={item.name}
                                                                                href={item.href}
                                                                                onClick={() => setOpen(item.onclick)}
                                                                                className="-m-3 p-3 block rounded-md hover:bg-gray-50 transition ease-in-out duration-150 text-left"
                                                                            >
                                                                                <p className="text-base font-small text-gray-900">{item.name}</p>
                                                                                <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                                                                            </button>

                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </Popover.Panel>
                                                        </Transition>
                                                    </>
                                                )}
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
                                    <div className="max-w-lg w-full lg:max-w-xs">
                                        <label htmlFor="search" className="sr-only">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                id="search"
                                                name="search"
                                                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-white focus:ring-white focus:text-gray-900 sm:text-sm"
                                                placeholder="Search"
                                                type="search"
                                                onChange={(e) => setSearchString(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex lg:hidden">
                                    {/* Mobile menu button */}
                                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                                <div className="hidden lg:block lg:ml-4">
                                    <div className="flex items-center">

                                        {/* Profile dropdown */}
                                        <Menu as="div" className="ml-4 relative flex-shrink-0">
                                            {({ open }) => (
                                                <>
                                                    <div>
                                                        <Menu.Button className="bg-gray-800 rounded-full flex text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                                            <span className="sr-only">Open user menu</span>
                                                            <img
                                                                className="h-8 w-8 rounded-full"
                                                                src=""
                                                                alt=""
                                                            />
                                                        </Menu.Button>
                                                    </div>
                                                    <Transition
                                                        show={open}
                                                        as={Fragment}
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="transform opacity-0 scale-95"
                                                        enterTo="transform opacity-100 scale-100"
                                                        leave="transition ease-in duration-75"
                                                        leaveFrom="transform opacity-100 scale-100"
                                                        leaveTo="transform opacity-0 scale-95"
                                                    >
                                                        <Menu.Items
                                                            static
                                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                                        >
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <a
                                                                        href="#"
                                                                        className={classNames(
                                                                            active ? 'bg-gray-100' : '',
                                                                            'block px-4 py-2 text-sm text-gray-700'
                                                                        )}
                                                                    >
                                                                        {username}
                                                                    </a>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <a
                                                                        href="/settings"
                                                                        className={classNames(
                                                                            active ? 'bg-gray-100' : '',
                                                                            'block px-4 py-2 text-sm text-gray-700'
                                                                        )}
                                                                    >
                                                                        Settings
                                                                    </a>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <a
                                                                        href="#"
                                                                        className={classNames(
                                                                            active ? 'bg-gray-100' : '',
                                                                            'block px-4 py-2 text-sm text-gray-700'
                                                                        )}
                                                                    >
                                                                        Sign out
                                                                    </a>
                                                                )}
                                                            </Menu.Item>
                                                        </Menu.Items>
                                                    </Transition>
                                                </>
                                            )}
                                        </Menu>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </>
                )}
            </Disclosure>

            <Transition.Root show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 inset-0 overflow-y-auto"
                    initialFocus={cancelButtonRef}
                    onClose={setOpen}
                >
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
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
                            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <button className="bg-transparent border-0 text-black float-right"
                                                onClick={() => setOpen(false)}>
                                                ✖
                                            </button>
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                Let's build a Workspace
                                            </Dialog.Title>
                                            <Dialog.Description className="py-3">
                                                Boost your productivity by making it easier for everyone to access boards in one location.
                                            </Dialog.Description>

                                            <div className="mt-2 pt-2 pb-4">
                                                <form className="space-y-6" onSubmit={createWorkspace}>
                                                    <div>
                                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                            Workspace Name
                                                        </label>
                                                        <div className="mt-1">
                                                            <input
                                                                id="title"
                                                                name="title"
                                                                type="title"
                                                                autoComplete="title"
                                                                required
                                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="desc" className="block text-sm font-medium text-gray-700">
                                                            Workspace Description
                                                        </label>
                                                        <div className="mt-1">
                                                            <textarea
                                                                id="desc"
                                                                name="desc"
                                                                type="desc"
                                                                autoComplete="desc"
                                                                rows="4"
                                                                required
                                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 pb-2">
                                                            Workspace Visibility
                                                        </label>
                                                        <div className="content-center">
                                                            <span className="pr-2 pb-1 text-sm font-medium text-gray-700">Public</span>
                                                            <label htmlFor="toggle" className="inline-flex relative items-center cursor-pointer">
                                                                <input type="checkbox" onClick={() => setToggle(!toggle)} value="" id="toggle" className="sr-only peer" />
                                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500"></div>
                                                            </label>
                                                            <span className="pb-2 ml-3 text-sm font-medium text-black">Private</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="submit"
                                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            Continue
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <Transition.Root show={openInv} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 inset-0 overflow-y-auto"
                    initialFocus={cancelButtonRef}
                    onClose={setOpenInv}
                >
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
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
                            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <button className="bg-transparent border-0 text-black float-right"
                                                onClick={() => setOpenInv(false)}>
                                                ✖
                                            </button>
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                Invite your team
                                            </Dialog.Title>
                                            <Dialog.Description className="py-3">
                                                Trello makes teamwork your best work. Invite your new team members to get going!
                                            </Dialog.Description>

                                            <div className="mt-2 pt-2 pb-4">
                                                <form className="space-y-6" onSubmit={invitePeople}>
                                                    <div>
                                                        <label htmlFor="emailInv" className="block text-sm font-medium text-gray-700">
                                                            Workspace Members
                                                        </label>
                                                        <div className="mt-1">
                                                            <input
                                                                id="emailInv"
                                                                name="emailInv"
                                                                type="emailInv"
                                                                autoComplete="emailInv"
                                                                required
                                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="submit"
                                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            Continue
                                                        </button>
                                                    </div>
                                                </form>
                                                <div className="justify-center">
                                                    <a href="" >I'll do this later</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    )
}
