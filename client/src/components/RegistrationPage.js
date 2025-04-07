import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { UserContext } from "./Context";

function RegistrationPage() {
    const { classId } = useParams();
    const { 
        getClassEnrollment,
        createRegistration,
        deleteRegistration
    } = useContext(UserContext);

    const [registrations, setRegistrations ] = useState([]);
    const [available, setAvailable] = useState([]);
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await getClassEnrollment(classId);
                setRegistrations(data.registrations);
                setAvailable(data.available);
            }catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [classId, getClassEnrollment])

    const handleEnroll = () => {
        if (!selectedStudentId) return;
        addRegistration(parseInt(selectedStudentId), parseInt(classId))
        .then(() => {
            const newStudent = allStudents.find(s => s.id === parseInt(selectedStudentId));
            setStudents([...students, newStudent]);
            setSelectedStudentId("");
        })
        .catch((err) => {
            alert("Failed to enroll student: " + err.message);
        });
    };

    const handleDeleteStudent = (studentId) => {
        deleteStudent(studentId)
          .then(() => {
            setStudents(students.filter((student) => student.id !== studentId));
          })
          .catch((error) => {
            console.error("Error deleting student:", error);
          });
    };

    const availableStudents = allStudents.filter(
        (s) => !students.find((enrolled) => enrolled.id === s.id)
    );

    return (
        <div>
            <h1> Enroll Students</h1>

            {availableStudents.length > 0 ? (
                <>
                    <select 
                        value= {selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                        <option value="">Select a student...</option>
                        {availableStudents.map((student) => (
                            <option key={student.id} value= {student.id}>
                                {student.name} ({student.major})
                            </option>
                        ))}
                    </select>
                    <button onClick={handleEnroll}>Enroll Student</button>
                </>
            ): (
                <p>No Students Available for enrollment.</p>
            )}
            <ul>
                {students.length > 0 ? (
                    students.map((student) => (
                        <li key={student.id}>
                         {student.name} - {student.major}
                         <button onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <p>No students enrolled yet.</p>
                )}
            </ul>
        </div>
    )
}

export default RegistrationPage;
