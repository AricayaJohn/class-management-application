import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context";
import LoginPage from "./LoginPage";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />}/>
        </Routes>
      </Router>
    </UserProvider>
  )
}