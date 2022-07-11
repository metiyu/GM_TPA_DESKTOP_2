import { ProviderId } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { useState } from "react";
import { useEffect } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { db } from "../config/firebaseConfig";
import Task from "./task";
import { TrashIcon } from "@heroicons/react/outline";

export default function Column(props) {

    const isDragging = props.isDraggingOver
    const className = isDragging ? "p-8 transition-colors delay-200 ease-linear bg-blue-400 flex-grow min-h-100" : "p-8 transition-colors delay-200 ease-linear bg-white flex-grow min-h-100"
    const { wID, bID } = useParams()
    const [cards, setCards] = useState([])

    useEffect(() => {
        if (props.list.id) {
            const q = query(collection(db, "workspaces", wID, "boards", bID, "lists", props.list.id, "cards"));
            onSnapshot(q, (docs) => {
                let array = []
                docs.forEach(doc => {
                    array.push({ ...doc.data(), id: doc.id });
                });
                setCards(array)
            })
        }
    }, [bID])

    const deleteList = async(id) => {
        const del = doc(db, "workspaces", wID, "boards", bID, "lists", id);
        await deleteDoc(del)
        console.log("done")
    }

    return (

        <div className="justify-center mt-8 w-56 rounded-md shadow-inner border border-gray-300">
            <div className="flex justify-end pr-3 pt-3">
                <div>
                    <button onClick={() => deleteList(props.list.id)}>
                        <TrashIcon className='flex-grow right-0 h-6 w-6' />
                    </button>
                </div>
            </div>
            <h3 className="px-8">
                {props.list.title}
            </h3>
            <Droppable droppableId={props.list.id} type="TASK">
                {(provided, snapshot) => (
                    <div className={className}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {cards.map((card, index) => (
                            <Task key={card.id} task={card} list={props} index={index}></Task>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
