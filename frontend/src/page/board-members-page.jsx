import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import { addDoc, collection, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import { Fragment, useRef, useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UseCurrentUser } from "../config/CurrentUserContext";
import { db } from "../config/firebaseConfig";

export default function MakeMember() {
    const { user } = UseCurrentUser();
    const { wID, bID } = useParams()
    const [members, setMembers] = useState([])
    const [openInv, setOpenInv] = useState(false)
    const [link, setLink] = useState()
    const [emailForInv, setEmailForInv] = useState()
    const cancelButtonRef = useRef(null);
    const [isAdmin, setIsAdmin] = useState()
    const [listOfMember, setListOfMember] = useState()
    const [listOfBoard, setListOfBoard] = useState()

    const userID = user ? user.uid : "Loading"

    useEffect(() => {
        const q = query(collection(db, "workspaces", wID, "boards"));
        onSnapshot(q, (docs) => {
            let array = []
            docs.forEach(doc => {
                array.push({ ...doc.data(), id: doc.id });
            });
            for (var i = 0; i < array.length; i++) {
                if (array[i].id === bID) {
                    setMembers(array[i].members)
                    for (var j = 0; j < array[i].members.length; j++) {
                        if (array[i].members[j].memberId === userID) {
                            setIsAdmin(array[i].members[j].isAdmin)
                        }
                    }
                }
            }
        })

        const q2 = query(collection(db, "workspaces", wID, "boards"))
        onSnapshot(q2, (docs) => {
            docs.forEach(doc => {
                if (doc.id === bID)
                    setListOfMember(doc.data().members);
            })
        })

        const q3 = query(collection(db, "users"))
        onSnapshot(q3, (docs) => {
            docs.forEach(doc => {
                if (doc.id === userID)
                    setListOfBoard(doc.data().myBoards)
            })
        })

    }, [userID])

    function generateLink() {
        addDoc(collection(db, "inviteList"), {
            type: "board",
            linkWorkspace: wID,
            linkBoard: bID,
            date: new Date()
        }).then((e) => {
            setLink("http://localhost:3000/sign-in/" + e.id)
        })
    }

    const [linkForEmail, setLinkForEmail] = useState()
    function generateLink2() {
        addDoc(collection(db, "inviteList"), {
            type: "board",
            linkWorkspace: wID,
            linkBoard: bID,
            date: new Date()
        }).then((e) => {
            setLinkForEmail("http://localhost:3000/sign-in/" + e.id)
        })
    }

    useEffect(() => {
        sendInvitation()
    }, [linkForEmail])

    async function sendInvitation() {
        try {
            await axios({
                method: "POST",
                url: "http://localhost:3001/sendInvitation",
                data: {
                    to: emailForInv,
                    link: linkForEmail,
                },
            })
        } catch (error) {

        }
    }

    function leaveBoardValidation(){
        if (listOfMember.length == 1) {
            alert("Choose to Close or Delete Board")
            return
        }
        else{
            leaveBoard()
        }
    }

    const navigate = useNavigate()
    function leaveBoard() {
        let arr = []
        for (let index = 0; index < listOfMember.length; index++) {
            if(userID !== listOfMember[index].memberId){
                arr.push(listOfMember[index])
            }
        }

        updateDoc(doc(db, "workspaces", wID, "boards", bID), {
            members: arr
        }).then(() => {
            console.log("submitted");
        }).catch((e) => {
            console.log(e.message);
        })

        let arr2 = []
        for (let index = 0; index < listOfBoard.length; index++) {
            if(bID !== listOfBoard[index].boardId){
                arr2.push(listOfBoard[index])
            }
        }

        updateDoc(doc(db, "users", userID), {
            myBoards: arr2
        }).then(() => {
            console.log("submitted");
            navigate('/my-workspace')
        }).catch((e) => {
            console.log(e.message);
        })
    }

    function grantAdmin(id, name) {
        let arr = []
        for (let index = 0; index < listOfMember.length; index++) {
            if (id !== listOfMember[index].memberId) {
                arr.push(listOfMember[index])
            }
        }
        arr.push({
            isAdmin: true,
            memberId: id,
            memberName: name
        })
        console.log(arr);
        updateDoc(doc(db, "workspaces", wID, "boards", bID), {
            members: arr
        }).then(() => {
            console.log("submitted");
        }).catch((e) => {
            console.log(e.message);
        })
    }

    function revokeAdmin(id, name) {
        let arr = []
        for (let index = 0; index < listOfMember.length; index++) {
            if (id !== listOfMember[index].memberId) {
                arr.push(listOfMember[index])
            }
        }
        arr.push({
            isAdmin: false,
            memberId: id,
            memberName: name
        })

        updateDoc(doc(db, "workspaces", wID, "boards", bID), {
            members: arr
        }).then(() => {
            console.log("submitted");
        }).catch((e) => {
            console.log(e.message);
        })
    }

    function removeMember(memberID) {
        let arr = []
        for (let index = 0; index < listOfMember.length; index++) {
            if(memberID !== listOfMember[index].memberId){
                arr.push(listOfMember[index])
            }
        }

        updateDoc(doc(db, "workspaces", wID, "boards", bID), {
            members: arr
        }).then(() => {
            console.log("submitted");
        }).catch((e) => {
            console.log(e.message);
        })

        let arr2 = []
        for (let index = 0; index < listOfBoard.length; index++) {
            if(bID !== listOfBoard[index].boardId){
                arr2.push(listOfBoard[index])
            }
        }

        updateDoc(doc(db, "users", memberID), {
            myBoards: arr2
        }).then(() => {
            console.log("submitted");
            navigate('/my-workspace')
        }).catch((e) => {
            console.log(e.message);
        })
    }

    return (
        <div>
            <div className="w-4/5 ">
                <div>
                    <button
                        type="button"
                        className="w-full inline-flex rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => {
                            setOpenInv(true)
                            setLink("")
                        }}
                    >
                        Invite Member
                    </button>
                    <button
                        type="button"
                        className="w-full inline-flex rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={leaveBoardValidation}
                    >
                        Leave Workspace
                    </button>
                </div>
                <div className="flow-root mt-6">
                    <ul className="-my-5 divide-y divide-gray-200">
                        {members.map((member) => (
                            <li key={member.memberId} className="py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <img className="h-8 w-8 rounded-full" src="https://picsum.photos/200" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{member.memberName}</p>
                                        <p className="text-sm text-gray-500 truncate">{member.memberName}</p>
                                    </div>
                                    <div className="gap-4">
                                        <div className="gap-4">
                                            {member.isAdmin ? (
                                                <span href="" className="bg-yellow-300 inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700">
                                                    Admin
                                                </span>

                                            ) : ""}
                                            {isAdmin && !member.isAdmin ? (
                                                <button href=""
                                                    className="bg-green-300 inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700"
                                                    onClick={() => grantAdmin(member.memberId, member.memberName)}>
                                                    Grant Admin
                                                </button>
                                            ) : ""}
                                            {isAdmin && member.isAdmin && member.memberId !== userID ? (
                                                <button href=""
                                                    className="bg-red-300 inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700"
                                                    onClick={() => revokeAdmin(member.memberId, member.memberName)}>
                                                    Revoke Admin
                                                </button>
                                            ) : ""}
                                            {isAdmin && member.memberId !== userID ? (
                                                <button href=""
                                                    className="bg-rose-300 inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700"
                                                    onClick={() => removeMember(member.memberId)}>
                                                    Remove Member
                                                </button>
                                            ) : ""}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
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
                                                <div>
                                                    <label htmlFor="linkInv" className="block text-sm font-medium text-gray-700">
                                                        Share this Board with a link
                                                    </label>
                                                    <button className="block text-sm font-medium text-gray-700 underline" onClick={generateLink}>
                                                        Create Link
                                                    </button>
                                                    <div className="mt-1">
                                                        <input
                                                            id="linkInv"
                                                            name="linkInv"
                                                            type="linkInv"
                                                            autoComplete="linkInv"
                                                            readOnly
                                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            value={link}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <div>
                                                        <label htmlFor="emailInv" className="block text-sm font-medium text-gray-700">
                                                            Board Members
                                                        </label>
                                                        <div className="mt-1">
                                                            <input
                                                                id="emailInv"
                                                                name="emailInv"
                                                                type="emailInv"
                                                                autoComplete="emailInv"
                                                                required
                                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                onChange={(e) => setEmailForInv(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="submit"
                                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            onClick={generateLink2}
                                                        >
                                                            Continue
                                                        </button>
                                                    </div>
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
