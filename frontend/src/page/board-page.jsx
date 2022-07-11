/* This example requires Tailwind CSS v2.0+ */
import { DotsVerticalIcon } from '@heroicons/react/solid'
import { getDocs, collection, addDoc, query, onSnapshot, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { useEffect, useRef, useState, Fragment } from 'react';
import { UseCurrentUser } from '../config/CurrentUserContext';
import { db } from '../config/firebaseConfig';
import { PlusIcon } from '@heroicons/react/solid'
import { Transition, Dialog } from '@headlessui/react'
import { useParams } from 'react-router-dom';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MakeBoard() {
    const { user } = UseCurrentUser();
    const [open, setOpen] = useState(false)
    const [boards, setBoards] = useState([])
    const cancelButtonRef = useRef(null);
    const { wID } = useParams()

    function createBoard(e) {
        e.preventDefault()
        const title = e.target.title.value
        const visibility = e.target.visibility.value
        addDoc(collection(db, "workspaces", wID, "boards"), {
            title: title,
            description: e.target.desc.value,
            visibility: visibility,
            isClose: false,
            members: [{
                memberId: user.uid,
                memberName: user.email,
                isAdmin: true
            }]
        }).then((e) => {
            console.log("submitted");
            const docId = e ? e.id : "id"
            console.log(docId);
            addBoardInUser(docId, title)
            setOpen(false)
        }).catch((e) => {
            console.log("error :", e.message);
        })
    }

    function addBoardInUser(docId, title) {
        updateDoc(doc(db, 'users', user.uid), {
            myBoards: arrayUnion({
                boardId: docId,
                boardName: title
            })
        }).then(() => {
            console.log("submitted");
        }).catch((e) => {
            console.log(e.message);
        })
    }

    const userID = user ? user.uid : "Loading"

    useEffect(() => {
        const q = query(collection(db, "workspaces", wID, "boards"));
        onSnapshot(q, (docs) => {
            let array = []
            docs.forEach(doc => {
                if(!doc.data().isClose)
                    array.push({ ...doc.data(), id: doc.id });
            });
            setBoards(array)
        })
    }, [userID])


    return (
        <div>
            <div className="flex items-center">
                <div><h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">My Boards</h2></div>
                <button className="px-2"
                    onClick={() => setOpen(true)}>
                    <PlusIcon className="h-5 w-5 text-gray-500" />
                </button>
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {boards.map((board) => (
                    <li key={board.title} className="col-span-1 flex shadow-sm rounded-md">
                        <div
                            className={classNames(
                                'bg-pink-600',
                                'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
                            )}
                        >
                            {board.title[0].toUpperCase() + board.title[1].toUpperCase()}
                        </div>
                        <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                            <div className="flex-1 px-5 py-5 text-sm truncate">
                                <a href={'/w/' + wID + '/b/' + board.id} className="text-gray-900 font-medium hover:text-gray-600">
                                    {board.title}
                                </a>

                            </div>
                            <div className="flex-shrink-0 pr-2">
                                <button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <span className="sr-only">Open options</span>

                                    <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

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
                                                Let's build a Board
                                            </Dialog.Title>
                                            <Dialog.Description className="py-3">
                                                A board is made up of cards ordered on lists. Use it to manage projects, track information, or organize anything.
                                            </Dialog.Description>

                                            <div className="mt-2 pt-2 pb-4">
                                                <form className="space-y-6" onSubmit={createBoard}>
                                                    <div>
                                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                            Board Name
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
                                                            Board Description
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
                                                        <label htmlFor="desc" className="block text-sm font-medium text-gray-700">
                                                            Board Visibility
                                                        </label>
                                                        <select name="visibility" id="visibility" className="text-sm font-medium">
                                                            <option value="public" className="text-sm font-medium">Public</option>
                                                            <option value="workspace" className="text-sm font-medium">Workspace-Visibility</option>
                                                            <option value="board" className="text-sm font-medium">Board-Visibility</option>
                                                        </select>
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

        </div>
    )
}
