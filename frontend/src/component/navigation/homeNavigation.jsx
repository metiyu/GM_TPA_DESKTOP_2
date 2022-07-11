/* This example requires Tailwind CSS v2.0+ */
import { ClipboardListIcon, GlobeAltIcon } from '@heroicons/react/solid'
import sendEmail from '../emailInvitation'
// import { Link } from "react-router-dom";

const navigation = [
    { name: 'My Workspaces', href: '/my-workspace', icon: ClipboardListIcon, current: false },
    { name: 'Public Workspaces', href: '/public-workspace', icon: GlobeAltIcon, current: false },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MakeHomeNavigation() {
    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-48">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex flex-col h-0 flex-1">
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1" aria-label="Sidebar">
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={classNames(
                                            item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                        )}
                                        aria-current={item.current ? 'page' : false}
                                    >
                                        <item.icon
                                            className={classNames(
                                                item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                                'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                                            )}
                                            aria-hidden="true"
                                        />
                                        <span className="truncate">{item.name}</span>
                                    </a>

                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
