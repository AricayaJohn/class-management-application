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
        setLoading(true);
        getClassEnrollment(classId)
            .then(data => {
                setRegistrations(data.registrations);
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
            student_id: selected
        })
        .then(() => {
            return getClassEnrollment(classId);
        })
        .then(newData => {
            setRegistrations(newData.registrations);
            setAvailable(newData.available);
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
            setLoading(true);
            deleteRegistration(registrationId)
                .then(() => {
                    return getClassEnrollment(classId);
                })
                .then(newData => {
                    setRegistrations(newData.registrations);
                    setAvailable(newData.available);
                })
                .catch(err => {
                    setError(err.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Registered Students</h1>
            <ul>
                {registrations.length > 0 ? (
                    registrations.map(reg => (
                        <li key={reg.id}>
                            {reg.student.name} - {reg.student.major}
                            {reg.paid_status ? " (Paid)" : " (Unpaid)"}
                            <button
                                onClick={() => handleRemove(reg.id)}
                                disabled={loading}
                                className="remove-btn"
                            >
                                Remove
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No Students enrolled yet.</p>
                )}
            </ul>

            <h2>Available to enroll from registration</h2>
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
            <Link to="/welcome">Back to Welcome Page</Link>
        </div>
    );
}

export default RegistrationPage;
