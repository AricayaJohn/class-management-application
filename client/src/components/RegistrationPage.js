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

    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionInProgress, setActionInProgress] = useState({
        remove: null,
        update: null
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await getClassEnrollment(classId);
                setAvailableStudents(data.available || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [classId, getClassEnrollment]);

    const handleEnroll = async () => {
        if (!selectedStudentId) return;
        
        setLoading(true);
        try {
            await createRegistration({
                class_id: parseInt(classId),
                student_id: parseInt(selectedStudentId)
            });
            
            const updatedData = await getClassEnrollment(classId);
            setAvailableStudents(updatedData.available || []);
            
            setSelectedStudentId("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (registrationId) => {
        if (!window.confirm("Are you sure you want to remove this student?")) return;
        
        setActionInProgress(prev => ({ ...prev, remove: registrationId }));
        try {
            const registrationToRemove = registrations.find(r => r.id === registrationId);
            await deleteRegistration(registrationId);
            if (registrationToRemove) {
                setAvailableStudents(prev => [
                    ...prev,
                    {
                        student: registrationToRemove.student,
                        existing_registrations: []
                    }
                ]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setActionInProgress(prev => ({ ...prev, remove: null }));
        }
    };

    const handlePaidStatus = async (registrationId, currentStatus) => {
        setActionInProgress(prev => ({ ...prev, update: registrationId }));
        try {
            await updateRegistration(registrationId, !currentStatus);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionInProgress(prev => ({ ...prev, update: null }));
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Class Students</h1>
            <ul>
                {registrations.length > 0 ? (
                    registrations.map(registration => (
                        <li key={registration.id}>
                            {registration.student.name} - {registration.student.major}
                            <button 
                                onClick={() => handlePaidStatus(registration.id, registration.paid_status)}
                                disabled={actionInProgress.update === registration.id}
                                className={`paid-status ${registration.paid_status ? 'Paid' : 'Unpaid'}`}
                            >
                                {actionInProgress.update === registration.id 
                                    ? 'Updating...' 
                                    : registration.paid_status ? 'Paid' : 'Unpaid'}
                            </button>
                            <button
                                onClick={() => handleRemove(registration.id)}
                                disabled={actionInProgress.remove === registration.id}
                            >
                                {actionInProgress.remove === registration.id 
                                    ? "Removing..." 
                                    : "Remove"}
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No students enrolled yet</p>
                )}
            </ul>

            <h2>Register students in class</h2>
            {availableStudents.length > 0 ? (
                <>
                    <select 
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select Student</option>
                        {availableStudents.map(student => (
                            <option key={student.student.id} value={student.student.id}>
                                {student.student.name} - {student.student.major}
                            </option>
                        ))}
                    </select>
                    <button 
                        onClick={handleEnroll}
                        disabled={!selectedStudentId || loading}
                    >
                        {loading ? "Enrolling..." : "Enroll Student"}
                    </button>
                </>
            ) : (
                <p>No students available for enrollment.</p>
            )}
            
            <StudentForm 
                setError={setError}
                onSuccess={(newStudent) => {
                    setAvailableStudents(prev => {
                        if (prev.some(s => s.student.id === newStudent.id)) {
                            return prev;
                        }
                        return [...prev, { student: newStudent, existing_registrations: [] }];
                    });
                }}
            />
            <Link to="/welcome">Back to Welcome Page</Link>
        </div>
    );
}

export default RegistrationPage;