import React, { createContext, useState, useEffect, useCallback } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
    const [user, setUser ] = useState(null); // check authentication of (user/professor)
    const [loggedIn, setLoggedIn ] = useState(false); // track if user login status
    const [error, setError ] = useState(null); // state for errors 
    const [semesters, setSemesters] = useState([]);
    const [classes, setClasses] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [students, setStudents] = useState([]);

    // Auto-login when app starts or when user login 
    useEffect(() => {
        fetch("/check_session", { credentials: "include" })
            .then((response) => {
                if (response.ok)
                    return response.json();
                throw new Error("Not authenticated");
            })
            .then(processSessionData)
            .catch(() => setLoggedIn(false));
    }, []);

    const processSessionData = (data) => {
        if (data?.id) {
            setUser(data);
            setLoggedIn(true);
            if (data.semesters) {
                setSemesters(data.semesters);
                const allClasses = data.semesters.flatMap(semester => semester.classes || []);
                setClasses(allClasses);
                
                const allRegs = data.semesters.flatMap(semester => 
                    (semester.classes || []).flatMap(c => c.registrations || [])
                );
                setRegistrations(allRegs);
            }
            setStudents(data.students || []); 
        }
    };

    const login = (credentials) => {
        return fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(credentials),
        })
        .then((response) => {
            if (response.ok) return response.json(); // Directly use the response
            throw new Error("Login failed");
        })
        .then((userData) => {
            processSessionData(userData); // Process the user data from /login
            setError(null);
        })
        .catch((error) => {
            setError(error.message);
            throw error;
        });
    };

    const signup = (credentials) => {
        return fetch("/professors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(credentials),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Signup failed");
                return fetch("/check_session", { credentials: "include" });
            })
            .then((res) => res.json())
            .then((sessionData) => {
                processSessionData(sessionData);
                setError(null);
            })
            .catch((error) => {
                setError(error.message);
                throw error;
            });
    };

    const logout = () => {
        fetch("/logout", {
            method: "POST",
            credentials: "include",
        })
            .then((response) => {
                if (response.ok ) {
                    setUser(null);
                    setLoggedIn(false);
                    setSemesters([]);
                    setClasses([]);
                    setRegistrations([]);
                    setError(null);
                } else {
                    throw new Error("Failed to logout");
                }
            })
            .catch((error) => {
                setError(error.message);
                console.error("Logout error", error);
            });
    };

    // fetch class for specific semester
    const ClassesForSemester = (semesterId) => {
        return Promise.resolve(classes.filter(cls => cls.semester_id === semesterId));
    };

    // CRUD operations 
    const addSemester = (nameYear) => {
        return fetch("/semesters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name_year: nameYear }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to add semester");
            return res.json();
          })
          .then(newSemester => {
            setSemesters([...semesters, newSemester]);
            return newSemester;
          }); 
    };

    const updateSemester = useCallback((semesterId, nameYear) => {
        return fetch(`/semesters/${semesterId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name_year: nameYear })
        })
        .then(handleResponse)
        .then(updatedSemester => {
            setSemesters(sems => sems.map(s => 
              s.id === updatedSemester.id ? updatedSemester : s
            ));
            return updatedSemester;
        });
    }, []);

    const addClass = (className, credits, room, semesterId) => {
        return fetch("/classes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                class_name: className,
                credits: credits,
                class_room: room,
                semester_id: semesterId
            }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to add class");
            return res.json();
          })
          .then(newClass => {
            setClasses([...classes, newClass]);
            return newClass;
          });
    };

const getClassEnrollment = useCallback((classId) => {
    return fetch(`/classes/${classId}/enrollment`, {
        credentials: "include"
    })
    .then(handleResponse)
    .then(data => {
        setRegistrations(data.registrations);
        return data;
    });
}, []);

const createRegistration = useCallback((registrationData) => {
    return fetch("/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registrationData)
    })
    .then(handleResponse)
    .then(newRegistration => {
        // Prevent duplicates
        setRegistrations(prev => 
            prev.some(reg => reg.id === newRegistration.id) 
                ? prev 
                : [...prev, newRegistration]
        );
        return newRegistration;
    });
}, []);

const deleteRegistration = useCallback((registrationId) => {
    return fetch(`/registrations/${registrationId}`, {
        method: "DELETE",
        credentials: "include"
    })
    .then(handleResponse)
    .then(() => {
        setRegistrations(prev => prev.filter(r => r.id !== registrationId));
    });
}, []);

const updateRegistration = useCallback((registrationId, paidStatus) => {
    return fetch(`/registrations/${registrationId}`, {
        method: "PATCH",
        headers: {'Content-Type': "application/json"},
        credentials: "include",
        body: JSON.stringify({paid_status: paidStatus})
    })
    .then(handleResponse)
    .then(updatedRegistration => {
        setRegistrations(prev => prev.map(reg => 
            reg.id === updatedRegistration.id ? updatedRegistration : reg
        ));
        return updatedRegistration;
    });
}, []);

    const addStudent = useCallback((studentData) => {
        return fetch("/students", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(studentData),
        })
        .then(handleResponse)
        .then(newStudent => {
            return newStudent;
        });
    }, []);

    const handleResponse = (response) => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || "Request failed");
            });
        }
        return response.json();
    };

    return (
        <UserContext.Provider
            value={{
            // state 
            user,
            loggedIn,
            error,
            semesters,
            registrations,
            students,
            setRegistrations,
            
            // authorization functions
            login,
            signup,
            logout,

            ClassesForSemester,
            addSemester,
            updateSemester,

            addClass,

            getClassEnrollment,
            createRegistration,
            deleteRegistration,
            updateRegistration,

            addStudent,
        }} >
            {children}
        </UserContext.Provider>
    );
}

export { UserContext, UserProvider };