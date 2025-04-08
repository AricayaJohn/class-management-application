import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./Context";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import WelcomePage from "./WelcomePage";
import SemesterHandler from "./SemesterHandler";
import AddClassPage from "./AddClassPage";
import RegistrationPage from "./RegistrationPage";
import AuthRoute from "./AuthRoute";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthRoute type="auth"> <LoginPage /></AuthRoute>} />
          <Route path="/login" element={<AuthRoute type="auth"> <LoginPage /> </AuthRoute>}/>
          <Route path="/signup" element={<AuthRoute type="auth"> <SignUpPage /> </AuthRoute>} />
          <Route path="/welcome" element={<AuthRoute type="protected"> <WelcomePage /> </AuthRoute>} />
          <Route path="/add-semester" element={<AuthRoute type="protected"> <SemesterHandler /> </AuthRoute>} />
          <Route path="/add-class" element={<AuthRoute type="protected"> <AddClassPage /> </AuthRoute>} />
          <Route path="/classes/:classId/registrations" element={<AuthRoute type="protected"> <RegistrationPage /> </AuthRoute>} />
          
         <Route path="*" element={<AuthRoute notFound />} />
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App;