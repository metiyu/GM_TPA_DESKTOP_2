import './App.css';
import React from 'react'
import MakeNavbar from './component/navigation/navbar';
import { Route, Routes } from 'react-router-dom';
import MakeLandingPage from './page/landing-page';
import MakeSignUp from './page/signup-page';
import MakeSignIn from './page/signin-page';
import { CurrentUserProvider } from './config/CurrentUserContext';
import MakeHomeNavigation from './component/navigation/homeNavigation';
import MakeHome from './page/home-page';
import MakeWorkspaceNavigation from './component/navigation/workspaceNavigation';
import MakeSettings from './page/settings-page';
import MakePublic from './page/public-page';
import Sidebar from './component/navigation/boardNavigation';
import MakeConfirmPage from './page/confirm-invitation-page';

function MakeMyWorkspace() {
  return (
    <CurrentUserProvider>
      <div>
        <MakeNavbar />
        <div className=" flex">
          <MakeHomeNavigation />
          <div className="p-14 justify-center">
            <MakeHome />
          </div>
        </div>
      </div>
    </CurrentUserProvider>
  )
}

function MakePublicWorkspace() {
  return (
    <CurrentUserProvider>
      <div>
        <MakeNavbar />
        <div className=" flex">
          <MakeHomeNavigation />
          <div className="p-14 justify-center">
            <MakePublic />
          </div>
        </div>
      </div>
    </CurrentUserProvider>
  )
}

function MakeMyBoards() {
  return (
    <CurrentUserProvider>
      <div>
        <MakeNavbar />
        <div className=" flex">
          <MakeWorkspaceNavigation />
        </div>
      </div>
    </CurrentUserProvider>
  )
}

function MakeMyKanban() {
  return (
    <CurrentUserProvider>
      <div>
        <MakeNavbar />
        <div className="flex">
          <Sidebar />
        </div>
      </div>
    </CurrentUserProvider>
  )
}

function MakeMySettings() {
  return (
    <CurrentUserProvider>
      <div>
        <MakeNavbar />
        <div className=" flex">
          <MakeHomeNavigation />
          <div className="p-14 justify-center">
            <MakeSettings />
          </div>
        </div>
      </div>
    </CurrentUserProvider>
  )
}

function MakeConfirmationPage() {
  return (
    <CurrentUserProvider>
      <MakeConfirmPage />
    </CurrentUserProvider>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={MakeLandingPage()}></Route>
      <Route path="/sign-up" element={MakeSignUp()}></Route>
      <Route path="/sign-in" element={MakeSignIn()}></Route>
      <Route path="/sign-in/:invID" element={<MakeSignIn />}></Route>
      <Route path="/confirmation/:invID" element={MakeConfirmationPage()}></Route>
      <Route path="/my-workspace" element={MakeMyWorkspace()}></Route>
      <Route path="/public-workspace" element={MakePublicWorkspace()}></Route>
      <Route path="/settings" element={MakeMySettings()}></Route>
      <Route path="/w/:wID" element={MakeMyBoards()}></Route>
      <Route path="/w/:wID/b/:bID" element={MakeMyKanban()}></Route>
      <Route path="/w/:wID/b/:bID/c/:cID" element={MakeMyKanban()}></Route>
      {/* <Route path="/testing" element={<MapContainer />}></Route> */}
    </Routes>
  );
}

export default App;
