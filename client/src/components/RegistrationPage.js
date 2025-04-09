import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { UserContext } from "./Context";
import StudentForm from "./StudentForm";

function RegistrationPage() {
    const { classId } = useParams();
    const { 
        registrations,
        getClassEnrollment,
        createRegistration,
        deleteRegistration,
        updateRegistration
    } = useContext(UserContext);

    const [available, setAvailable] = useState([]);
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [removingId, setRemovingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        setLoading(true);
        getClassEnrollment(classId)
            .then(data => {
                setAvailable(data.available);
                setError(null);
            }) 
            .catch(err => {
                setError(err.message);
            }) 
            .finally(()=> {
                setLoading(false);
            })
        }, [classId, getClassEnrollment])

    const handleEnroll = () => {
        if (!selected) return;

        setLoading(true);
        createRegistration({
            class_id: classId,
            student_id: selected,
        })
            .then(() =>  getClassEnrollment(classId))
            .then(data => {
                setAvailable(data.available);
                setSelected("");
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleRemove = (registrationId) => {
        if (window.confirm("Are you sure you want to remove this student")) {
            setRemovingId(registrationId);
            deleteRegistration(registrationId)
                .then(() =>  getClassEnrollment(classId))
                .then(data => {
                    setAvailable(data.available);
                })
                .catch(err => {
                    setError(err.message);
                })
                .finally(() => {
                    setRemovingId(null)
                });
        }
    };

    const handlePaidStatus = (registrationId, currentStatus) => {
        setUpdatingId(registrationId);
        const newStatus = !currentStatus;

        updateRegistration(registrationId, newStatus)
            .catch(err => setError(err.message))
            .finally(() => setUpdatingId(null));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Class Students</h1>
            <ul>
            {registrations && registrations.length > 0 ? (
                registrations.map(registration => (
                    <li key={registration.id}>
                        {registration.student.name} - {registration.student.major}{" "}
                        <button 
                            onClick={() => handlePaidStatus(registration.id, registration.paid_status)}
                            disabled={updatingId === registration.id}
                            className={`paid-status ${registration.paid_status ? 'Paid' : 'Unpaid'}`}
                        >
                            {updatingId === registration.id ? 'Updating...' :
                            registration.paid_status ? 'Paid' : 'Unpaid'}
                        </button>
                        <button
                            onClick={() => handleRemove(registration.id)}
                            disabled={removingId === registration.id}
                        >
                            {removingId === registration.id ? "Removing..." : "Remove"}
                        </button>
                    </li>
                ))
            ) : (
                <p> No students enrolled yet</p>
            )}
            </ul>

            <h2>Register students in class</h2>
            {available.length > 0 ? (
                <>
                    <select 
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        <option value="">Select Student </option>
                        {available.map(reg => (
                            <option key={reg.student.id} value={reg.student.id}>
                                {reg.student.name} - {reg.student.major}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleEnroll}>Enroll Student</button>
                </>
            ) : (
                <p>No Students available for enrollment.</p>
            )}
            <StudentForm setAvailable={setAvailable} setError={setError} />
            <Link to="/welcome">Back to Welcome Page</Link>
        </div>
    );
}

export default RegistrationPage;
