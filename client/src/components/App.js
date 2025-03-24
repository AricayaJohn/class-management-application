import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./Context";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />}/>
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App;