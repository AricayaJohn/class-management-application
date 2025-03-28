import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
    const [user, setUser ] = useState(null); //check authentication of (user/professor)
    const [loggedIn, setLoggedIn ] = useState(false); // track if user login status
    const [error, setError ] = useState(null); // State for errors 

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
            if (data?.id) {
                setUser(data);
                setLoggedIn(true);
            }
        })
        .catch((error) => {
            setError(error.message);
            setLoggedIn(false);
        });
}, []);

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
                setUser(sessionData);
                setLoggedIn(true);
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
        setUser(sessionData);
        setLoggedIn(true);
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
    })
        .then((response) => {
            if (response.ok ) {
                setUser(null);
                setLoggedIn(false);
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

const Semesters = () => {
    return fetch("/semesters")
      .then((response) => {
        if(!response.ok) throw new Error
        ("Failed to fetch semesters");
        return response.json();
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error fetching semesters:", error);
        throw error;
      });
};

const ClassesForSemester = (semesterId) => {
    return fetch(`/semesters/${semesterId}/classes`, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch classes");
        return response.json();
        })
        .catch((error) => { 
            setError(error.message);
            console.error("Error fetching classes:", error);
            throw error;
      });
};

const addSemester = (nameYear) => {
    return fetch("/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_year: nameYear }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add semester");
        return response.json();
      })
      .catch((error) => {
        setError(error.message);
        console.error("error adding semester:", error);
        throw error;
      }); 
};

const deleteSemester = (semesterId) => {
    return fetch(`/semesters/${semesterId}`, {
        method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to delete semester");
        return response.ok;
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error deleting Semester:", error);
        throw error;
      });
};

const addClass = (className, credits, room, semesterId) => {
    return fetch("/classes", {
        method: "POST",
        headers: { "Contents-Type": "application/json" },
        body: JSON.stringify({
            class_name: className,
            credits: parseInt(credits),
            class_room: room,
            semester_id: parseInt(semesterId),
        }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add class");
        return response.json();
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error adding class:", error);
        throw error;
      });
};

// fetch student in class
const StudentsForClass = (classId) => {
    return fetch(`/classes/${classId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch students");
        return response.json()
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error fetching students:", error);
        throw error;
      });
};

const addStudent = (name, major, classId) => {
    return fetch("/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            major: major,
            class_id: parseInt(classId),
        }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add student");
        return response.json();
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error adding student:", error);
        throw error;
      });
};

return (
    <UserContext.Provider
        value={{
        user,
        loggedIn,
        error,
        login,
        signup,
        logout,
        Semesters,
        ClassesForSemester,
        addSemester,
        deleteSemester,
        addClass,
        StudentsForClass,
    }} >
        {children}
    </UserContext.Provider>
);
}

export { UserContext, UserProvider };