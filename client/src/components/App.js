import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./Context";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import WelcomePage from "./WelcomePage";
import SemesterHandler from "./SemesterHandler";
import AddClassPage from "./AddClassPage";
import RegistrationPage from "./RegistrationPage";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />}/>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/add-semester" element={<SemesterHandler />} />
          <Route path="/add-class" element={<AddClassPage />} />
          <Route path="/classes/:classId/registrations" element={<RegistrationPage />} />
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App;