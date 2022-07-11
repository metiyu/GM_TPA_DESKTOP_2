import { Dialog, Transition } from "@headlessui/react"
import { BookmarkIcon, CalendarIcon, CheckCircleIcon, ClockIcon, InboxIcon, LinkIcon, LocationMarkerIcon, UsersIcon, CursorClickIcon, MinusCircleIcon, PencilAltIcon, PaperClipIcon, PlusIcon } from "@heroicons/react/solid"
import { addDoc, arrayUnion, collection, doc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore"
import { Fragment, useRef, useState } from "react"
import { Draggable } from "react-beautiful-dnd"
import { useParams } from "react-router-dom"
import { UseCurrentUser } from "../config/CurrentUserContext"
import { db } from "../config/firebaseConfig"
import CircularProgressBar from "./progressBar"
import DatePicker from 'sassy-datepicker';
import moment from "moment"
import { BlockPicker } from 'react-color'

export default function Task(props) {

    const isDragging = props.isDragging

    const [openLabel, setOpenLabel] = useState(false)
    const [openMap, setOpenMap] = useState(false)
    const [openDate, setOpenDate] = useState(false)
    const [openLink, setOpenLink] = useState(false)
    const [openChecklist, setOpenChecklist] = useState(false)

    const navigation = [
        { name: 'Labels', href: '#', icon: BookmarkIcon, current: false, isClick: () => setOpenLabel(true) },
        { name: 'Checklist', href: '#', icon: CheckCircleIcon, current: false, isClick: () => setOpenChecklist(true) },
        { name: 'Dates', href: '#', icon: ClockIcon, current: false, isClick: () => setOpenDate(true) },
        { name: 'Attachment', href: '#', icon: PaperClipIcon, current: false, isClick: (e) => makeAttachment(e) },
        { name: 'Location', href: '#', icon: LocationMarkerIcon, current: false, isClick: () => setOpenMap(true) },
        {
            name: 'Share', href: '#', icon: LinkIcon, current: false, isClick: (e) => {
                setOpenLink(true)
                makeCardLink(e)
            }
        },
    ]

    var checkListNew = [
        { name: 'Apple', isChecked: false },
        { name: 'Banana', isChecked: false },
        { name: 'Tea', isChecked: false },
        { name: 'Coffee', isChecked: false },
    ]

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    const className = isDragging ? "border drop-shadow-xl rounded-md p-8 mb-8 transition-colors delay-200 ease-linear bg-green-400" :
        "border drop-shadow-xl rounded-md p-8 mb-8 transition-colors delay-200 ease-linear bg-white"
    const [open, setOpen] = useState(false)

    const cancelButtonRef = useRef(null);
    const [title, setTitle] = useState(props.task.title)
    const [desc, setDesc] = useState()
    const [checked, setChecked] = useState([]);
    const [label, setLabel] = useState()
    const [isThereLabel, setIsThereLabel] = useState(false)
    const [isThereChecklist, setIsThereChecklist] = useState(false)
    const [isThereAttach, setIsThereAttach] = useState(false)
    const [attachList, setAttachList] = useState()
    const [isThereDuedate, setIsThereDuedate] = useState(false)
    const [isThereLink, setIsThereLink] = useState(false)

    const [currCard, setCurrCard] = useState()
    function getCardDetail(cardID) {
        setCurrCard(cardID)
        console.log(cardID);
        const q = query(collection(db, "cards"), where("id", "==", cardID))
        onSnapshot(q, (doc) => {
            const { id, title, description } = doc.docs[0].data()
            setTitle(title)
            setDesc(description)
            setIsThereAttach(doc.docs[0].data().attachment.length)
            setAttachList(doc.docs[0].data().attachment)
            setLatitude(doc.docs[0].data().latitude)
            setLongitude(doc.docs[0].data().longitude)
            setBlockPickerColor(doc.docs[0].data().labelColor)
            if (doc.docs[0].data().label !== "") {
                setIsThereLabel(true)
                setLabel(doc.docs[0].data().label)
            }
            if (doc.docs[0].data().latitude !== "")
                setIsThereLocation(true)
            if (!(doc.docs[0].data().duedate === "none" || doc.docs[0].data().duedate === "")) {
                setDuedate(new Date(doc.docs[0].data().duedate).toDateString())
                setIsThereDuedate(true)
            }
            
        })
    }

    const [listOfChecklist, setListOfChecklist] = useState()
    function getCardChecklist(cardID) {
        const q = query(collection(db, "cards", cardID, "checklist"))
        onSnapshot(q, (docs) => {
            let arr = []
            docs.forEach(doc => {
                arr.push({ ...doc.data(), id: doc.id })
            })
            console.log(arr);
            setListOfChecklist(arr);
            setIsThereChecklist(arr.length)
            console.log(isThereChecklist);
        })
    }

    const { user } = UseCurrentUser()
    const { wID, bID } = useParams()

    //label
    const [blockPickerColor, setBlockPickerColor] = useState("#37d67a");
    function addLabelToCard(cardID, e) {
        e.preventDefault()
        updateDoc(doc(db, "cards", cardID), {
            label: e.target.label.value,
            labelColor: blockPickerColor
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })

        setIsThereLabel(true)
    }

    //checklist
    const [checklistName, setChecklistName] = useState()
    const [checklistItem, setChecklistItem] = useState()
    const [tempChecklistName, setTempChecklistName] = useState()
    const [items, setItems] = useState([])
    function makeChecklist(cardID) {
        let arr = []
        items.forEach( item => {
            arr.push({ name: item, isChecked: false })
        })
        console.log(arr);
        addDoc(collection(db, "cards", cardID, "checklist"), {
            checklistName: tempChecklistName,
            listOfChecklist: arr
        }).then((e) => {
            console.log("success");
            let arr2 = []
            arr.forEach(item => {
                arr2.push({ name: item.name, isChecked: false, docID: e.id })
            })
            console.log(arr2);
            updateDoc(doc(db, "cards", cardID, "checklist", e.id), {
                listOfChecklist: arr2
            })
        }).catch((e) => {
            console.log(e.message);
        })
        setOpenChecklist(false)
    }

    const [howMuchCheck, setHowMuchCheck] = useState()
    function countIsCheck(e) {
        let sumCheck = 0
        for (let index = 0; index < e.length; index++) {
            if (e[index].isChecked === true)
                sumCheck++
        }
        return (sumCheck);
    }

    function handleCheck(item, id) {
        let arr = []
        console.log(listOfChecklist[0].listOfChecklist);
        for (let index = 0; index < listOfChecklist[0].listOfChecklist.length; index++) {
            if(item.name !== listOfChecklist[0].listOfChecklist[index].name){
                arr.push(listOfChecklist[0].listOfChecklist[index])
            }
        }
        arr.push({ docID: item.docID, name: item.name, isChecked: !item.isChecked })
        console.log(id);
        updateDoc(doc(db, "cards", currCard, "checklist", item.docID), {
            listOfChecklist: arr
        }).then(() => {
            console.log("success");
        })
    }

    const [tempItem, setTempItem] = useState()
    function addItem() {
        let tempList = []
        tempList = items
        tempList.push(tempItem)
        setItems(tempList)
        setTempItem('')
    }

    //attachment
    function makeAttachment(cardID) {
        updateDoc(doc(db, "cards", cardID), {
            attachment: arrayUnion({
                link: ""
            })
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })
    }

    //location
    const [isThereLocation, setIsThereLocation] = useState(false)
    const [latitude, setLatitude] = useState()
    const [longitude, setLongitude] = useState()
    function addLocationToCard(cardID, e) {
        e.preventDefault()
        updateDoc(doc(db, "cards", cardID), {
            latitude: e.target.latitude.value,
            longitude: e.target.longitude.value
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })
        setIsThereLocation(true)
    }

    function deleteLocation(cardID) {
        console.log(cardID);
        updateDoc(doc(db, "cards", cardID), {
            latitude: "",
            longitude: ""
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })
        setIsThereLocation(false)
    }

    //due date
    const [duedate, setDuedate] = useState(new Date())
    const [remindDate, setRemindDate] = useState('none')
    function addDuedate(cardID) {
        if (remindDate === 'none') {
            updateDoc(doc(db, "cards", cardID), {
                duedate: duedate,
                remind: 'none'
            }).then(() => {
                console.log("success");
            }).catch((e) => {
                console.log(e.message);
            })
        }
        else if (remindDate === '1 days') {
            const remind = new Date(duedate)
            remind.setDate(remind.getDate() + 1)
            updateDoc(doc(db, "cards", cardID), {
                duedate: duedate,
                remind: remind
            }).then(() => {
                console.log("success");
            }).catch((e) => {
                console.log(e.message);
            })
        }
        else if (remindDate === '3 days') {
            const remind = new Date(duedate)
            remind.setDate(remind.getDate() + 3)
            updateDoc(doc(db, "cards", cardID), {
                duedate: duedate,
                remind: remind
            }).then(() => {
                console.log("success");
            }).catch((e) => {
                console.log(e.message);
            })
        }
        else if (remindDate === '7 days') {
            const remind = new Date(duedate)
            remind.setDate(remind.getDate() + 7)
            updateDoc(doc(db, "cards", cardID), {
                duedate: duedate,
                remind: remind
            }).then(() => {
                console.log("success");
            }).catch((e) => {
                console.log(e.message);
            })
        }
        setIsThereDuedate(true)
    }

    function deleteDuedate(cardID) {
        console.log(cardID);
        updateDoc(doc(db, "cards", cardID), {
            duedate: "",
            remind: ""
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })
        setIsThereDuedate(false)
    }

    //link
    const [link, setLink] = useState()

    function makeCardLink(cardID) {
        addDoc(collection(db, "inviteList"), {
            type: "card",
            linkWorkspace: wID,
            linkBoard: bID,
            linkCard: cardID,
            date: new Date()
        }).then((e) => {
            console.log("success");
            setLink("http://localhost:3000/sign-in/" + e.id)
        }).catch((e) => {
            console.log(e.message);
        })
    }

    //save
    function saveCardChange(cardID, listID) {
        updateDoc(doc(db, "cards", cardID), {
            title: title,
            description: desc
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })

        updateDoc(doc(db, "workspaces", wID, "boards", bID, "lists", listID, "cards", cardID), {
            title: title
        }).then(() => {
            console.log("success");
        }).catch((e) => {
            console.log(e.message);
        })
    }

    return (
        <div>
            <a onClick={() => {
                setOpen(true)
                getCardDetail(props.task.id)
                getCardChecklist(props.task.id)
            }}>
                <Draggable
                    draggableId={props.task.id}
                    index={props.index}>
                    {(provided, snapshot) => (
                        <div className={className}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}>
                            {props.task.title}
                        </div>
                    )}
                </Draggable>
            </a>

            <Transition.Root show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 top-0 left-96 overflow-y-auto"
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
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left pr-32">

                                            <div className="flex">
                                                <span className="pr-2 text-lg font-medium">Card Link</span>
                                                <button>
                                                    <PencilAltIcon className="w-5 h-5 justify-center" />
                                                </button>
                                            </div>
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                Card Title
                                            </Dialog.Title>
                                            <textarea className="text-lg " name="title" id="title" rows="1" value={title} onChange={(e) => setTitle(e.target.value)}></textarea>
                                            <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                Card Description
                                            </Dialog.Title>
                                            <textarea className="text-lg " name="title" id="title" rows="1" value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
                                            {isThereLabel ? (
                                                <div>
                                                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                        Card Label
                                                    </Dialog.Title>
                                                    <div style={{
                                                        background: `${blockPickerColor}`
                                                    }}>{label}</div>
                                                </div>
                                            ) : ""}
                                            {isThereDuedate ? (
                                                <div className="flex pb-2">
                                                    <div>
                                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                            Card Due Date
                                                        </Dialog.Title>
                                                        <input type="checkbox" name="cardDateDone" id="cardDateDone" />
                                                        <span>{moment(duedate).format('MMM Do') + ' at ' + moment(duedate).format('h:mm a')}</span>
                                                    </div>
                                                    <div className="p-3">
                                                        <button>
                                                            <MinusCircleIcon className="w-4 h-4" onClick={() => deleteDuedate(props.task.id)} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : ""}
                                            {isThereLocation ? (
                                                <div className="flex">
                                                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                                        Card Location
                                                    </Dialog.Title>
                                                    <div className="pl-1">
                                                        <button>
                                                            <LocationMarkerIcon className="w-4 h-4" onClick={() => window.open(`https://maps.google.com/?q=${latitude},${longitude}`)} />
                                                        </button>
                                                    </div>
                                                    <div className="pl-3">
                                                        <button>
                                                            <MinusCircleIcon className="w-4 h-4" onClick={() => deleteLocation(props.task.id)} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : ""}
                                            {isThereChecklist > 0 ? (
                                                <div className="divide-y divide-gray-800">
                                                    <div className="py-2 lg:pb-8">
                                                        <h2 className="pb-2 text-lg leading-6 font-medium text-gray-900">Checklist</h2>
                                                        {listOfChecklist.map((checklist) => (
                                                            () => setChecklistName(checklist.checklistName),
                                                            () => setChecklistItem(checklist.listOfChecklist),
                                                            <div>
                                                                <CircularProgressBar
                                                                    selectedValue={Math.round((countIsCheck(checklist.listOfChecklist) / checklist.listOfChecklist.length) * 100)}
                                                                    maxValue={100}
                                                                    radius={40}
                                                                    activeStrokeColor='#0f4fff'
                                                                />
                                                                <div className="checkList">
                                                                    <textarea className="title" rows="1" defaultValue={checklist.checklistName} value={checklistName} onChange={(e) => setChecklistName(e.target.value)}></textarea>
                                                                    <div className="list-container">
                                                                        {checklist.listOfChecklist.map((item, index) => (
                                                                            <div key={item.name}>
                                                                                {item.isChecked ? (
                                                                                    <div>
                                                                                        <input defaultChecked={true} type="checkbox" onChange={() => handleCheck(item, props.task.id)} />
                                                                                        <span className="line-through" >{item.name}</span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div>
                                                                                        <input defaultChecked={false} type="checkbox" onChange={() => handleCheck(item)} />
                                                                                        <span className="no-underline" >{item.name}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : ""}
                                            {isThereAttach > 0 ? (
                                                <div className="divide-y divide-gray-800">
                                                    <div className="py-2 lg:pb-8">
                                                        <h2 className="pb-2 text-lg leading-6 font-medium text-gray-900">Attachment</h2>
                                                        <ul className="">
                                                            {attachList.map((attach) => (
                                                                <li className="">
                                                                    <div>
                                                                        <textarea defaultValue={attach.link} rows="1" placeholder="Fill your link" />
                                                                        <button onClick={() => window.open(attach.link)}>
                                                                            <CursorClickIcon className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ) : ""}
                                        </div>
                                        <div className="inset-y-0 right-0">
                                            <h5>Add to card</h5>
                                            {navigation.map((item) => (
                                                <div className="py-1">
                                                    <button
                                                        key={item.name}
                                                        href={item.href}
                                                        className={classNames('bg-gray-200 text-black hover:bg-gray-300',
                                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                                        )}
                                                        onClick={(e) => item.isClick(props.task.id)}
                                                    >
                                                        <item.icon
                                                            className='text-black mr-3 h-6 w-6'
                                                            aria-hidden="true"
                                                        />
                                                        {item.name}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="bg-transparent border-0 text-black absolute top-3 right-3"
                                            onClick={() => setOpen(false)}>
                                            ✖
                                        </button>
                                    </div>
                                    <div className="pb-3">
                                        <span className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium"
                                            onClick={() => saveCardChange(props.task.id, props.list.list.id)}>
                                            Save
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Label */}
            <Transition.Root show={openLabel} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 top-0 right-64 overflow-y-auto"
                    onClose={setOpenLabel}
                >
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            leave="ease-in duration-200"
                        >
                            <Dialog.Overlay className="fixed inset-0" />
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
                                    <form action="" onSubmit={(e) => addLabelToCard(props.task.id, e)}>
                                        <div className="sm:flex sm:items-start">
                                            <div className="inset-3 p-5">
                                                <label htmlFor="label" className="pr-3">
                                                    Select label
                                                </label>
                                                <select name="label" id="label">
                                                    <option value="Label 1">Label 1</option>
                                                    <option value="Label 2">Label 2</option>
                                                    <option value="Label 3">Label 3</option>
                                                </select>
                                                <div className="blockpicker">
                                                    <h6>Color Picker</h6>
                                                    {/* Div to display the color  */}
                                                    <div
                                                        style={{
                                                            backgroundColor: `${blockPickerColor}`,
                                                            width: 100,
                                                            height: 50,
                                                            border: "2px solid white",
                                                        }}
                                                    ></div>
                                                    {/* Block Picker from react-color and handling color on onChange event */}
                                                    <BlockPicker
                                                        color={blockPickerColor}
                                                        onChange={(color) => {
                                                            setBlockPickerColor(color.hex);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button className="bg-transparent border-0 text-black absolute top-3 right-3"
                                                onClick={() => setOpenLabel(false)}>
                                                ✖
                                            </button>
                                        </div>
                                        <div className="pb-3">
                                            <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium">
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Location */}
            <Transition.Root show={openMap} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 top-0 right-64 overflow-y-auto"
                    onClose={setOpenMap}
                >
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            leave="ease-in duration-200"
                        >
                            <Dialog.Overlay className="fixed inset-0" />
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
                                    <form action="" onSubmit={(e) => addLocationToCard(props.task.id, e)}>
                                        <div className="sm:flex sm:items-start">
                                            <div className="inset-3 p-5">
                                                <div>
                                                    <label htmlFor="latitude" className="pr-3">
                                                        Input latitude
                                                    </label>
                                                    <input id="latitude" name="latitude" type="text" placeholder="Input your latitude here" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                                                </div>
                                                <div>
                                                    <label htmlFor="longitude" className="pr-3">
                                                        Input longitude
                                                    </label>
                                                    <input id="longitude" name="longitude" type="text" placeholder="Input your longitude here" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                                                </div>
                                            </div>
                                            <button className="bg-transparent border-0 text-black absolute top-3 right-3"
                                                onClick={() => setOpenMap(false)}>
                                                ✖
                                            </button>
                                        </div>
                                        <div className="pb-3">
                                            <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium">
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Date */}
            <Transition.Root show={openDate} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 top-0 right-64 overflow-y-auto"
                    onClose={setOpenDate}
                >
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            leave="ease-in duration-200"
                        >
                            <Dialog.Overlay className="fixed inset-0" />
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
                                    <DatePicker onChange={(e) => setDuedate(e.toString())} />
                                    <div className="inset-3 p-5">
                                        <label htmlFor="reminder" className="pr-3">
                                            Set reminder
                                        </label>
                                        <select name="reminder" id="label" onChange={(e) => setRemindDate(e.target.value)}>
                                            <option value="none">None</option>
                                            <option value="1 days">1 Days Before</option>
                                            <option value="3 days">3 Days Before</option>
                                            <option value="7 days">7 Days Before</option>
                                        </select>
                                    </div>
                                    <button className="bg-transparent border-0 text-black absolute top-3 right-3"
                                        onClick={() => setOpenDate(false)}>
                                        ✖
                                    </button>
                                    <div className="pb-3">
                                        <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium" onClick={() => addDuedate(props.task.id)}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Link */}
            <Transition.Root show={openLink} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 top-0 right-64 overflow-y-auto"
                    onClose={setOpenLink}
                >
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            leave="ease-in duration-200"
                        >
                            <Dialog.Overlay className="fixed inset-0" />
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
                                        <div className="inset-3 p-5">
                                            <label htmlFor="link" className="pr-3">
                                                Card link
                                            </label>
                                            <input id="link" name="link" type="text" value={link} readOnly />
                                        </div>
                                    </div>
                                    <button className="bg-transparent border-0 text-black absolute top-3 right-3"
                                        onClick={() => setOpenLink(false)}>
                                        ✖
                                    </button>
                                    <div className="pb-3">
                                        <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium" onClick={() => addDuedate(props.task.id)}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Checklist */}
            <Transition.Root show={openChecklist} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed z-10 top-0 right-64 overflow-y-auto"
                    onClose={setOpenChecklist}
                >
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            leave="ease-in duration-200"
                        >
                            <Dialog.Overlay className="fixed inset-0" />
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
                                        <div className="inset-3 p-5">
                                            <div>
                                                <label htmlFor="name" className="pr-3">
                                                    Card Checklist Name
                                                </label>
                                                <input id="name" name="name" type="text" value={tempChecklistName} onChange={(e) => setTempChecklistName(e.target.value)} />
                                            </div>
                                            <label htmlFor="items" className="pr-3">
                                                Card Checklist Item
                                            </label>
                                            {items.map((item) => (
                                                <ul className="list-disc">
                                                    <li>{item}</li>
                                                </ul>
                                            ))}
                                            <div>
                                                <input id="item" name="item" type="text" value={tempItem} onChange={(e) => setTempItem(e.target.value)} />
                                            </div>
                                            <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium" onClick={addItem}>add item</button>
                                        </div>
                                    </div>
                                    <button className="bg-transparent border-0 text-black absolute top-3 right-3"
                                        onClick={() => setOpenChecklist(false)}>
                                        ✖
                                    </button>
                                    <div className="pb-3">
                                        <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium" onClick={() => makeChecklist(props.task.id)}>
                                            Save
                                        </button>
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