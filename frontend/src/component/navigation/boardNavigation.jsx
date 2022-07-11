import { CalendarIcon, CogIcon, ViewBoardsIcon, UsersIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { MyCalendar } from "../../page/calendar-page";
import MakeKanban from "../../page/kanban-page";
import MakeMember from "../../page/board-members-page";
import MakeBoardSettings from "../../page/board-settings-page";

const navigation = [
    { name: 'List & Card', href: '#', icon: ViewBoardsIcon, current: false, isClick: 1 },
    { name: 'Members', href: '#', icon: UsersIcon, current: false, isClick: 2 },
    { name: 'Calendar', href: '#', icon: CalendarIcon, current: false, isClick: 3 },
    { name: 'Settings', href: '#', icon: CogIcon, current: false, isClick: 4 },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Sidebar = () => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [tab, setTab] = useState([1])

    return (
        <div>
            <>
                {showSidebar ? (
                    <button
                        className="flex text-white items-center cursor-pointer fixed left-6 top-6 z-50"
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        ✖
                    </button>
                ) : (
                    <svg
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="fixed z-30 flex items-center cursor-pointer left-10 top-24"
                        fill="gray-800"
                        viewBox="0 0 100 80"
                        width="40"
                        height="40"
                    >
                        <rect width="100" height="10"></rect>
                        <rect y="30" width="100" height="10"></rect>
                        <rect y="60" width="100" height="10"></rect>
                    </svg>
                )}

                <div
                    className={`top-0 left-0 w-48 bg-gray-800 pl-10 text-white fixed h-full z-40  ease-in-out duration-300 ${showSidebar ? "translate-x-0 " : "-translate-x-full"
                        }`}
                >
                    <h3 className="mt-20 text-4xl font-semibold text-white">
                    </h3>
                    <div>
                        {navigation.map((item) => (
                            <button
                                key={item.name}
                                href={item.href}
                                className={classNames(
                                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                )}
                                onClick={() => {
                                    setTab(item.isClick)
                                    setShowSidebar(false)
                                }}
                            >
                                <item.icon
                                    className={classNames(
                                        item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                                        'mr-3 h-6 w-6'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </>
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
                <div className="py-10">
                    <div className="w-screen mx-auto px-4 sm:px-6 md:px-8">
                        {/* Replace with your content */}
                        <div className="p-5">
                            {tab == 1 ? (<MakeKanban />) : ""}
                            {tab == 2 ? (<MakeMember />) : ""}
                            {tab == 3 ? (<MyCalendar />) : ""}
                            {tab == 4 ? (<MakeBoardSettings />) : ""}
                        </div>
                        {/* /End replace */}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Sidebar;