import { Fragment, useRef, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import {
    CalendarIcon,
    InboxIcon,
    UsersIcon,
    CogIcon
} from '@heroicons/react/outline'
import { SearchIcon } from '@heroicons/react/solid'
import MakeBoard from '../../page/board-page'
import MakeMember from '../../page/workspace-members-page'
import { MyCalendar } from '../../page/calendar-page'
import MakeWorkspaceSettings from '../../page/workspace-settings-page'

const navigation = [
    { name: 'Boards', href: '#', icon: InboxIcon, current: false, isClick: 1 },
    { name: 'Members', href: '#', icon: UsersIcon, current: false, isClick: 2 },
    { name: 'Calendar', href: '#', icon: CalendarIcon, current: false, isClick: 3 },
    { name: 'Settings', href: '#', icon: CogIcon, current: false, isClick: 4 },
]
const userNavigation = [
    { name: 'Your Profile', href: '#' },
    { name: 'Settings', href: '#' },
    { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MakeWorkspaceNavigation() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [open, setOpen] = useState(false)
    const cancelButtonRef = useRef(null);
    const [tab, setTab] = useState([1])

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-48">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex flex-col h-0 flex-1">
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">
                                {navigation.map((item) => (
                                    
                                    <button
                                        key={item.name}
                                        href={item.href}
                                        className={classNames(
                                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                        )}
                                        onClick={() => setTab(item.isClick)}
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
                            </nav>
                        </div>
                    </div>
                </div>

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-10">
                        <div className="w-screen mx-auto px-4 sm:px-6 md:px-8">
                            {/* Replace with your content */}
                            <div className="p-5">
                                {tab == 1 ? (<MakeBoard />) : ""}
                                {tab == 2 ? (<MakeMember />) : ""}
                                {tab == 3 ? (<MyCalendar />) : ""}
                                {tab == 4 ? (<MakeWorkspaceSettings />) : ""}
                            </div>
                            {/* /End replace */}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
