import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./Context";

function WelcomePage(){
    const { user, logout, Semester, ClassesForSemester } = useContext(UserContext);
    const [ semesters, setSemesters ] = useState([]);
    const [ selectedSemester, setSelectedSemester ] = useState(null);
    const [ classes, setClasses ] = useState([])
    const [ loading, setLoading ] = useState([true]);
    const [ error, setError ] = useState(null);
    const navigate = useState();

    useEffect(() => {
        if (user?.id) {
            Semesters()
              .then((data) => {
                setSemesters(data);
                setSelectedSemester(data[0] || null); //might be causeing a semester and class to show up even without assigning? 
                setLoading(false);
              })
              .catch((error) => {
                setError(error.message);
                setLoading(false);
              });
        }
    }, [user, Semesters]);

    useEffect(() => {
        if (selectedSemester?.id) {
            ClassesForSemester(selectedSemester.id)
              .then((data) => {
                setClasses(data)
              })
              .catch((error) => {
                setError(error.message);
              });
        }
    }, [selectedSemester, ClassesForSemester]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>

    return (
        <div className="welcome-container">
            <header>
                <h1>Welcome, {user?.name}!</h1>
                <button onClick ={handleLogout}>Logout</button>
            </header>
        </div>
    )
}