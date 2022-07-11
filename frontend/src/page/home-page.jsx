/* This example requires Tailwind CSS v2.0+ */
import { DotsVerticalIcon } from '@heroicons/react/solid'
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { UseCurrentUser } from '../config/CurrentUserContext';
import { db } from '../config/firebaseConfig';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MakeHome() {
    const { user, userAtr } = UseCurrentUser();
    const [workspaces, setWorkspaces] = useState([])
    const [boards, setBoards] = useState([])
    const [ws, setWs] = useState(true)

    const userID = user ? user.uid : "Loading"

    useEffect(() => {
        const q = query(collection(db, 'users'));
        onSnapshot(q, (docs) => {
            let array = []
            docs.forEach(doc => {
                array.push({ ...doc.data(), id: doc.id });
            });
            for (var k = 0; k < array.length; k++) {
                if (array[k].id === userID) {
                    setWorkspaces(array[k].myWorkspaces)
                    setBoards(array[k].myBoards)
                }
            }
        })
    }, [userID])

    
    return (
        <div>
            <div>
                <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">My Workspace</h2>
                <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {workspaces.map((workspace) => (
                        <li key={workspace.workspaceName} className="col-span-1 flex shadow-sm rounded-md">
                            <div
                                className={classNames(
                                    'bg-pink-600',
                                    'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
                                )}
                            >
                                {workspace.workspaceName.charAt(0).toUpperCase() + workspace.workspaceName.charAt(1).toUpperCase()}
                            </div>
                            <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                <div className="flex-1 px-5 py-5 text-sm truncate">
                                    <a href={'/w/' + workspace.workspaceId} className="text-gray-900 font-medium hover:text-gray-600">
                                        {workspace.workspaceName}
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
            </div>
            <div className="py-3">
                <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">My Board</h2>
                <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {boards.map((board) => (
                        <li key={board.boardName} className="col-span-1 flex shadow-sm rounded-md">
                            <div
                                className={classNames(
                                    'bg-pink-600',
                                    'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
                                )}
                            >
                                {board.boardName.charAt(0).toUpperCase() + board.boardName.charAt(1).toUpperCase()}
                            </div>
                            <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                <div className="flex-1 px-5 py-5 text-sm truncate">
                                    <a href={'/w/' + board.boardId} className="text-gray-900 font-medium hover:text-gray-600">
                                        {board.boardName}
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
            </div>
        </div>
    )
}
