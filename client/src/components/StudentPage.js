import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { UserContext } from "./Context";

function StudentPage() {
    const { classId } = useParams();
    const { 
        ClassStudents,
        getAllStudents,
        addRegistration,
        deleteStuent, } = useContext(UserContext);

    const [ students, setStudents ] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("")

    useEffect(() => {
        ClassStudents(classId)
          .then((data) => setStudents(Array.isArray(data) ? data : []))
          .catch((err) => {
            console.error("Error loading class students:", err);
            setStudents([]);
          });

        getAllStudents()
          .then((data) => setAllStudents(Array.isArray(data) ? data : []))
          .catch((err) => console.error("Error loading all students:", err));
    }, [classId, ClassStudents, getAllStudents]);

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

export default StudentPage;
