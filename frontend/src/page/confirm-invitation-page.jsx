import { arrayUnion, collection, doc, onSnapshot, query, updateDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { UseCurrentUser } from "../config/CurrentUserContext"
import { db } from "../config/firebaseConfig"

export default function MakeConfirmPage() {

    const navigate = useNavigate()
    const { user } = UseCurrentUser()
    const { invID } = useParams()
    const [workspace, setWorkspace] = useState()
    const [board, setBoard] = useState()
    const [card, setCard] = useState()
    const [wName, setWName] = useState()
    const [bName, setBName] = useState()
    const [cName, setCName] = useState()
    const [isMember, setIsMember] = useState(false)

    const userID = user ? user.uid : ""

    useEffect(() => {
        const q = query(collection(db, "inviteList"))
        onSnapshot(q, (docs) => {
            let array = []
            docs.forEach((doc) => {
                array.push({ ...doc.data(), id: doc.id })
            })
            for (let index = 0; index < array.length; index++) {
                if (array[index].id === invID) {
                    if (array[index].type === "workspace") {
                        setWorkspace(array[index].link)
                    }
                    else if (array[index].type === "board") {
                        setWorkspace(array[index].linkWorkspace)
                        setBoard(array[index].linkBoard)
                    }
                    else if (array[index].type === "card") {
                        setWorkspace(array[index].linkWorkspace)
                        setBoard(array[index].linkBoard)
                        setCard(array[index].linkCard)
                    }
                }
            }
        })
    }, [invID])

    useEffect(() => {
        const q = query(collection(db, "workspaces"))
        onSnapshot(q, (docs) => {
            let array = []
            docs.forEach((doc) => {
                array.push({ ...doc.data(), id: doc.id })
            })
            for (let index = 0; index < array.length; index++) {
                if (array[index].id === workspace) {
                    setWName(array[index].title)
                    for (let j = 0; j < array.length; j++) {
                        setIsMember(array[index].members[0].memberId === user.uid);
                    }
                }
            }
        })
    }, [workspace])

    console.log(workspace);
    console.log(board);

    if (workspace) {
        // useEffect(() => {
        const q = query(collection(db, "workspaces", workspace, "boards"))
        onSnapshot(q, (docs) => {
            let arr = []
            docs.forEach((doc) => {
                arr.push({ ...doc.data(), id: doc.id })
            })
            for (let index = 0; index < arr.length; index++) {
                if (arr[index].id === board)
                    setBName(arr[index].title)
            }
        })
        // }, [board])
    }

    if (card){
        const q = query(collection(db, "cards"))
        onSnapshot(q, (docs) => {
            let arr = []
            docs.forEach((doc) => {
                arr.push({ ...doc.data(), id: doc.id })
            })
            for (let index = 0; index < arr.length; index++) {
                if (arr[index].id === card)
                    setCName(arr[index].title)
            }
        })

        navigate('/w/' + workspace + '/b/' + board)
    }

    console.log(wName);
    console.log(bName);
    console.log(cName);

    function accInvitation() {
        if (bName) {
            accInvitationBoard()
        }
        else {
            accInvitationWorkspace()
        }
    }

    function accInvitationBoard() {
        if (!isMember) {
            updateDoc(doc(db, 'users', userID), {
                myWorkspaces: arrayUnion({
                    workspaceId: workspace,
                    workspaceName: wName
                })
            }).then(() => {
                console.log("submitted");
            }).catch((e) => {
                console.log(e.message);
            })

            updateDoc(doc(db, 'workspaces', workspace), {
                members: arrayUnion({
                    isAdmin: false,
                    memberId: userID,
                    memberName: user.email
                })
            }).then(() => {
                console.log('submitted');
            }).catch((e) => {
                console.log(e.message);
            })
        }
        updateDoc(doc(db, 'users', userID), {
            myBoards: arrayUnion({
                boardId: board,
                boardName: bName
            })
        }).then(() => {
            console.log("submitted");
        }).catch((e) => {
            console.log(e.message);
        })

        updateDoc(doc(db, 'workspaces', workspace, "boards", board), {
            members: arrayUnion({
                isAdmin: false,
                memberId: userID,
                memberName: user.email
            })
        }).then(() => {
            console.log('submitted');
        }).catch((e) => {
            console.log(e.message);
        })

        navigate('/w/' + workspace)
    }

    function accInvitationWorkspace() {
        updateDoc(doc(db, 'users', userID), {
            myWorkspaces: arrayUnion({
                workspaceId: workspace,
                workspaceName: wName
            })
        }).then(() => {
            console.log("submitted");
        }).catch((e) => {
            console.log(e.message);
        })

        updateDoc(doc(db, 'workspaces', workspace), {
            members: arrayUnion({
                isAdmin: false,
                memberId: userID,
                memberName: user.email
            })
        }).then(() => {
            console.log('submitted');
        }).catch((e) => {
            console.log(e.message);
        })

        navigate('/w/' + workspace)
    }

    function rejInvitation() {
        navigate("/my-workspace")
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="max-w-xl mt-5 mx-auto text-xl">
                        Are you sure to join the workspace ?
                    </p>
                    <div className="grid justify-items-center items-stretch">
                        <div className="flex items-stretch gap-4 p-4">
                            <div>
                                <button
                                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    onClick={accInvitation}
                                >
                                    Accept
                                </button>
                            </div>
                            <div>
                                <button
                                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    onClick={rejInvitation}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}