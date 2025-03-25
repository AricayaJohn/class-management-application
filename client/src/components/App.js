import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./Context";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import WelcomePage from "./WelcomePage";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />}/>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App;