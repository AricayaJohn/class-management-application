import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "./Context";

function StudentPage() {
    const { classId } = useParams();
    const [ students, setStudents ] = useState([]);
    const { StudentsForClass, addStudent, deleteStudent } = useContext(UserContext);

    useEffect(() => {
        StudentsForClass(classId)
          .then((data) => {
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                throw new Error("Invalid data format: expected an array");
            }
          })
          .catch((error) => {
            console.error("Error fetching students:", error);
            setStudents([]);
          });
    }, [classId, StudentsForClass]);

    const initialValues = {
        name: "",
        major: "",
    };

    const validationSchema = Yup.object({
        name: Yup.string().required("Name is required"),
        major: Yup.string().required("Major is required"),
    });

    const onSubmit = (values, { setSubmitting, resetForm }) => {
        addStudent( values.name, values.major, classId)
            .then((newStudent) => {
                setStudents([...students, newStudent]);
                resetForm();
            })
            .catch((error) => {
                console.error("Error adding student:", error);
                alert("Failed to add student. Please try again.");
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const handleDeleteStudents = (studentId) => {
        deleteStudent(studentId)
          .then(() => {
            setStudents(students.filter((student) => student.id !== studentId));
          })
          .catch((error) => {
            console.error("Error deleting student:", error);
          });
    };

    return (
        <div>
            <h1> Add Student</h1>
            <h2>Student in this Class</h2>
            <ul>
                {students.length > 0 ? (
                    students.map((student) => (
                        <li key={student.id}>
                         {student.name} - {student.major}
                         <button onClick={() => handleDeleteStudents(student.id)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <p>No student found.</p>
                )}
            </ul>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ isSubmitting}) => (
                    <Form>
                        <div>
                            <label htmlFor="name">Name:</label>
                            <Field type="text" id="name" name="name" />
                            <ErrorMessage name="name" component="div" className="error" />
                        </div>

                        <div>
                            <label htmlFor="major">Major:</label>
                            <Field type="text" id="major" name="major" />
                            <ErrorMessage name="major" component="div" className="error" />
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Student"}
                        </button>
                        <Link to="/welcome">Back to Welcome Page</Link>
                    </Form>
                )}
            </Formik>
        </div>
    )
}