import { Dialog, Transition } from "@headlessui/react";
import { addDoc, arrayUnion, collection, doc, onSnapshot, query, setDoc, updateDoc } from "firebase/firestore";
import { Fragment, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { useParams } from "react-router-dom";
import Column from "../component/list";
import { UseCurrentUser } from "../config/CurrentUserContext";
import { db } from "../config/firebaseConfig";

const initialData = {
    tasks: {
        'task-1': { id: 'task-1', content: 'Take out the garbage' },
        'task-2': { id: 'task-2', content: 'Watch my favorite show' },
        'task-3': { id: 'task-3', content: 'Charge my phone' },
        'task-4': { id: 'task-4', content: 'Cook dinner' }
    },
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'To do',
            taskIds: ['task-1', 'task-2', 'task-3', 'task-4']
        },
        'column-2': {
            id: 'column-2',
            title: 'In progress',
            taskIds: []
        },
        'column-3': {
            id: 'column-3',
            title: 'Done',
            taskIds: []
        }
    },
    // Facilitate reordering of the columns
    columnOrder: ['column-1', 'column-2', 'column-3']
}

export default function MakeKanban() {
    const [data, setData] = useState(initialData)
    const [lists, setLists] = useState([])
    const [cards, setCards] = useState([])
    const { wID, bID } = useParams()
    const [addList, setAddList] = useState(false)
    const [addCard, setAddCard] = useState(false)
    const cancelButtonRef = useRef(null);
    const cancelButtonRef2 = useRef(null);

    useEffect(() => {
        if (bID) {
            const q = query(collection(db, "workspaces", wID, "boards", bID, "lists"));
            onSnapshot(q, (docs) => {
                let array = []
                docs.forEach(doc => {
                    array.push({ ...doc.data(), id: doc.id });
                });
                setLists(array)
            })
        }
    }, [bID])

    function addListToDB(e){
        e.preventDefault()
        addDoc(collection(db, "workspaces", wID, "boards", bID, "lists"), {
            title: e.target.title.value
        }).then(() => {
            console.log("success");
            setAddList(false)
        }).catch((e) => {
            console.log(e.message);
        })
    }

    const [newCardTitle, setNewCardTitle] = useState()
    const [newCardDesc, setNewCardDesc] = useState()
    const {user} = UseCurrentUser()
    function addCardToDB(e){
        e.preventDefault()
        setNewCardTitle(e.target.title.value)
        setNewCardDesc(e.target.desc.value)
        const titleTemp = e.target.title.value
        const descTemp = e.target.desc.value
        addDoc(collection(db, "workspaces", wID, "boards", bID, "lists", e.target.list.value, "cards"), {
            title: e.target.title.value
        }).then((e) => {
            console.log("success");
            insertCard(e.id, titleTemp, descTemp)
            insertCardToUser(user.uid, e.id, titleTemp)
        }).catch((e) => {
            console.log(e.message);
        })
    }

    function insertCard(docID, title, desc){
        setDoc(doc(db, "cards", docID), {
            id: docID,
            title: title,
            description: desc,
            label: "",
            attachment: [],
            listOfChecklist: [],
            latitude: "",
            longitude: "",
            startdate: new Date(),
            duedate: "none",
            remind: 'none',
            link: false
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })
    }

    function insertCardToUser(userID, docID, title){
        updateDoc(doc(db, "users", userID), {
            myCards: arrayUnion({
                cardId: docID,
                cardName: title
            })
        }).then(() => {
            console.log("success");
            setAddCard(false)
        }).catch((e) => {
            console.log(e.message);
        })
    }

    function handleOnDragEnd(result) {
        const { destination, source, draggableId } = result
        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        if (destination.droppableId === source.droppableId) {
            const listIndex = lists
        }

        const start = data.columns[source.droppableId]
        const finish = data.columns[destination.droppableId]

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds)
            newTaskIds.splice(source.index, 1)
            newTaskIds.splice(destination.index, 0, draggableId)

            const newColumn = {
                ...start,
                taskIds: newTaskIds
            }

            const newState = {
                ...data,
                columns: {
                    ...data.columns,
                    [newColumn.id]: newColumn
                }
            }

            setData(newState)
            return
        }

        const startTaskIds = Array.from(start.taskIds)
        startTaskIds.splice(source.index, 1)
        const newStart = {
            ...start,
            taskIds: startTaskIds
        }

        const finishTaskIds = Array.from(finish.taskIds)
        finishTaskIds.splice(destination.index, 0, draggableId)
        const newFinish = {
            ...finish,
            taskIds: finishTaskIds
        }

        const newState = {
            ...data,
            columns: {
                ...data.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish
            }
        }

        setData(newState)
    }

    return (
        <div>
            <div className="pt-6 pl-32 gap-x-6">
                <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() => setAddList(true)}>
                    Add List
                </button>
                <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() => setAddCard(true)}>
                    Add Card
                </button>
            </div>
            <DragDropContext>
                <div className="flex gap-4 px-4">
                    {lists.map((list) => {
                        // const column = lists.columns[listId]
                        // const tasks = column.taskIds.map(
                        // taskId => data.tasks[taskId]
                        // )
                        return (
                            <Column key={list.id} list={list}></Column>
                        )
                    })}
                </div>
            </DragDropContext>

            <Transition.Root show={addList} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 inset-0 overflow-y-auto"
                    initialFocus={cancelButtonRef}
                    onClose={setAddList}
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
                                    <div className="sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <button className="bg-transparent border-0 text-black float-right"
                                                onClick={() => setAddList(false)}>
                                                ✖
                                            </button>
                                            <div className="mt-2 pt-2 pb-4">
                                                <form className="space-y-6" onSubmit={addListToDB}>
                                                    <div>
                                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                            List Title
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

            <Transition.Root show={addCard} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 inset-0 overflow-y-auto"
                    initialFocus={cancelButtonRef2}
                    onClose={setAddCard}
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
                                    <div className="sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <button className="bg-transparent border-0 text-black float-right"
                                                onClick={() => setAddCard(false)}>
                                                ✖
                                            </button>
                                            <div className="mt-2 pt-2 pb-4">
                                                <form className="space-y-6" onSubmit={addCardToDB}>
                                                    <div>
                                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                            Card Title
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
                                                            Card Description
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
                                                    <div className="flex">
                                                        <label htmlFor="list" className="block text-sm font-medium text-gray-700">
                                                            Select a list
                                                        </label>
                                                        <select className="px-3" name="list" id="list">
                                                            {lists.map((list) => (
                                                                <option className="option" value={list.id}>{list.title}</option>
                                                            ))}
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

