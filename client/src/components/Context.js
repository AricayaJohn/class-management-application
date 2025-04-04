import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
    const [user, setUser ] = useState(null); //check authentication of (user/professor)
    const [loggedIn, setLoggedIn ] = useState(false); // track if user login status
    const [error, setError ] = useState(null); // State for errors 
    const [semesters, setSemesters] = useState([])
    const [classes, setClasses] = useState([])
    const [students, setStudents] = useState([])
    const [registrations, setRegistrations] = useState([])

//Auto-login when app starts or when user login 
useEffect(() => {
    fetch("/check_session", { credentials: "include" })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Not authenticated");
        })
        .then((data) => {
                // console.log(data.semesters)
                // console.log(data.classes)
                processSessionData(data);
        })
        .catch((error) => {
            setError(error.message);
            setLoggedIn(false);
        });
}, []);

//helper function for session data
const processSessionData = (data) => {
    if (data?.id) {
        setUser(data);
        setLoggedIn(true);

        if (data.semesters) {
            setSemesters(data.semesters);
            
            //get all classes for semester
            const allClasses = data.semesters.flatMap(semester => semester.classes || []);
            setClasses(allClasses);

            //get all registrations 
            const allRegistrations = allClasses.flatMap(cls => cls.registrations || []);
            setRegistrations(allRegistrations);
            
            //get all students 
            const allStudents = allRegistrations.map(reg => reg.student).filter(Boolean);
            setStudents(allStudents);
        }
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
            if (response.ok) return response.json();
            throw new Error("Login failed");
        })
        .then((userData) => {
            return fetch("/check_session", {credentials: "include" })
            .then((res) => res.json())
            .then((sessionData) => {
                processSessionData(sessionData);
                setError(null);
                });
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
        return fetch("/check_session", {credentials: "include"});
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
    fetch ("/logout", {
        method: "POST",
        credentials: "include",
    })
        .then((response) => {
            if (response.ok ) {
                setUser(null);
                setLoggedIn(false);
                setSemesters([]);
                setClasses([]);
                setStudents([]);
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

//fetch class for specific semester
const ClassesForSemester = (semesterId) => {
    return Promise.resolve(classes.filter(cls => cls.semester_id === semesterId));
}

//fetch students for class 
const StudentsForClass = (classId) => {
    const classRegistrations = registrations.filter(reg => reg.class_id === classId);
    const classStudents = classRegistrations.map(reg => students.find(student => student.id === reg.student_id)).filter(Boolean);
    return Promise.resolve(classStudents);
};


//CRUD operations 
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

const deleteSemester = (semesterId) => {
    return fetch(`/semesters/${semesterId}`, {
        method: "DELETE",
        credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete semester");
        setSemesters(semesters.filter(s => s.id !== semesterId));
        setClasses(classes.filter(c => c.semester_id !== semesterId));
      });
};

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

// Modified addStudent to check for existing student and register to class if exists
const addStudent = (name, major, classId) => {
    // First check if student already exists
    const existingStudent = students.find(s => s.name === name && s.major === major);

    if (existingStudent) {
        // Student exists, register to class
        return fetch("/registrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ student_id: existingStudent.id, class_id: parseInt(classId) }),
        })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to register student to class");
            return res.json();
        })
        .then((newReg) => {
            setRegistrations([...registrations, newReg]);
            return existingStudent;
        });
    } else {
        // Student doesn't exist, create student and register
        return fetch("/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, major }),
        })
        .then((response) => {
            if (!response.ok) throw new Error("Failed to add student");
            return response.json();
        })
        .then(newStudent => {
            setStudents([...students, newStudent]);
            return fetch("/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ student_id: newStudent.id, class_id: parseInt(classId) }),
            })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to register new student to class");
                return res.json();
            })
            .then((newReg) => {
                setRegistrations([...registrations, newReg]);
                return newStudent;
            });
        });
    }
};


const deleteStudent = (studentId) => {
    return fetch(`/students/${studentId}`, {
        method: "DELETE",
        credentials: "include",
    })
      .then((res) => {
        if(!res.ok) throw new Error("Failed to delete student");
        setStudents(students.filter(s => s.id !== studentId));
        setRegistrations(registrations.filter(r => r.student_id !== studentId));
      });
};

return (
    <UserContext.Provider
        value={{
        //state 
        user,
        loggedIn,
        error,
        semesters,
        classes,
        students,
        registrations,
        
        //authorization functions
        login,
        signup,
        logout,

        //data fetching
        ClassesForSemester,
        StudentsForClass,

        //CRUD operations
        addSemester,
        deleteSemester,
        addClass,
        addStudent,
        deleteStudent,
    }} >
        {children}
    </UserContext.Provider>
);
}

export { UserContext, UserProvider };