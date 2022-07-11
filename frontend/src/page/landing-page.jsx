export default function MakeLandingPage() {
    return (
        <div>
            <div className="flex justify-between items-center px-4 py-6 sm:px-6 md:justify-start md:space-x-10">
                <div className="hidden md:flex-1 md:flex md:items-center md:justify-between">
                    <div as="nav" className="flex space-x-10">
                        <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900">
                            Chello
                        </a>
                    </div>
                    <div className="flex items-center md:ml-12">
                        <a href="/sign-in" className="text-base font-medium text-gray-500 hover:text-gray-900">
                            Sign in
                        </a>
                        <a
                            href="/sign-up"
                            className="ml-8 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                            CHello
                        </p>
                        <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                            Collaborate, manage projects, and reach new productivity peaks. From high rises to the home office, the way your team works is unique—accomplish it all with Trello.
                        </p>
                    </div>
                </div>
            </div>
        </div>

    )
}
