import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./Context";

function WelcomePage(){
    const { user, logout, semesters, ClassesForSemester, loading, error } = useContext(UserContext);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [semesterClasses, setSemesterClasses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (semesters.length > 0 ) {
            setSelectedSemester(semesters[0]);
        }
    }, [semesters]);

    useEffect(() => {
        if (selectedSemester?.id) {
            ClassesForSemester(selectedSemester.id)
              .then(data => setSemesterClasses(data))
              .catch((err) => console.error("Error fetching classes:", err));
        }
    }, [selectedSemester, ClassesForSemester]);

    const handleSemesterChange = (e) => {
        const selected = semesters.find((s) => s.id === parseInt(e.target.value));
        setSelectedSemester(selected);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="welcome-container">
            <header>
                <h1>Welcome, {user?.name}!</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>

            <section className="semester-selector">
                <div>
                    <label htmlFor="semester">Select Semester</label>
                    <select
                      id="semester"
                      value={selectedSemester?.id || "" }
                      onChange={handleSemesterChange}
                    >
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                            {semester.name_year}
                        </option>
                      ))}
                    </select>
                    <button onClick={()=> navigate("/add-semester")}>Add/Edit Semester</button>
                </div>
            </section>

            <section className="class-list">
                <h2>Classes in {selectedSemester?.name_year || "Selected Semester"}</h2>
                <button className="add-class-btn" onClick={() => navigate("/add-class")}>Add Class</button>

            <ul>
                {semesterClasses.map((cls) => (
                    <li key={cls.id} className="class-item">
                        <div className="class-info">
                            <strong>{cls.class_name}</strong>
                            <span>Credits: {cls.credits}</span>
                            <span>Room: {cls.class_room}</span>
                        </div>
                        <button onClick={() => navigate(`/classes/${cls.id}/registrations`)}>
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