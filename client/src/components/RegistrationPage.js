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
            student_id: selected
        })
            .then(() =>  getClassEnrollment(classId))
            .then(() => {
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
                .catch(err => {
                    setError(err.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const handlePaidStatus = (registrationId, currentStatus) => {
        setUpdatingId(registrationId);
        const newStatus = !currentStatus;

        updateRegistration(registrationId, newStatus)
            .then(() => getClassEnrollment(classId))
            .catch(err => setError(err.message))
            .finally(() => setUpdatingId(null));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Registered Students</h1>
            <ul>
            {registrations.map(reg => (
                <li key={reg.id}>
                    {reg.student.nam} - {reg.student.major}
                    <button
                        onClick={() => handlePaidStatus(reg.id, reg.paid_status)}
                        disabled={updatingId === reg.id}
                        className={`paid-status ${reg.paid_status ? 'paid' : 'unpaid'}`}
                    >
                        {updatingId === reg.id ? 'Updating...' :
                        reg.paid_status ? 'Paid' : 'Unpaid'} 
                    </button>
                    <button
                        onClick={() => handleRemove(reg.id)}
                        disabled={removingId === reg.id}
                    >
                        {removingId === reg.id ? "Removing..." : "Remove"}
                    </button>
                </li>
            ))}
            </ul>

            <h2>Enroll Students</h2>
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
