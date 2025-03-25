import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./Context";

function WelcomePage(){
    const { user, logout, Semesters, ClassesForSemester } = useContext(UserContext);
    const [ semesters, setSemesters ] = useState([]);
    const [ selectedSemester, setSelectedSemester ] = useState(null);
    const [ classes, setClasses ] = useState([])
    const [ loading, setLoading ] = useState([true]);
    const [ error, setError ] = useState(null);
    const navigate = useNavigate();

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

    const handleSemesterChange = (e) => {
        const seleceted = semesters.find((s) => s.id === parseInt(e.target.value));
        setSelectedSemester(seleceted);
    };

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

            <section className="semester-selector">
                <h2>Classes in {selectedSemester?.name_year || "Selected Semester"}</h2>
                <button onClick={() => navigate("/add-class")}>Add Class</button>
            
            <ul>
                {classes.map((cls) => (
                    <li key={cls.id} className="class-item">
                        <div className="class-info">
                            <strong>{cls.class_name}</strong>
                            <span>Credits: {cls.credits}</span>
                            <span>Room: {cls.class_room}</span>
                        </div>
                        <button onClick={() => navigate(`/classes/${cls.id}/students`)}>
                            View Students
                        </button>
                    </li>
                ))}
            </ul>
            </section>
        </div>
    );
}

export default WelcomePage;