import React, {useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "./Context";

function SemesterHandler() {
    const navigate = useNavigate();
    const { addSemester, deleteSemester, Semesters } = useContext(UserContext);
    const [semesters, setSemesters] = useState([]);
    
    useEffect(() => {
        Semesters()
            .then((data) => {
                console.log("Fetched semesters:", data);
                setSemesters(data);
            })
            .catch((error) => console.error("Error fetching semesters: ", error));
    }, [Semesters]);

    const initialValues = {
        nameYear: "",
    };

    const validationSchema = Yup.object({
        nameYear: Yup.string()
          .required("Semester name is required")
          .matches(
            /^(Fall|Spring|Summer|Winter) \d{4}$/,
            "Semester name must be in the format 'Season YYYY' (e.g., Fall 2023)"
          ),
    });

    const onSubmit = (values, { setSubmitting, resetForm }) => {
        addSemester(values.nameYear)
            .then(() => {
                alert("semester added successfully!");
                resetForm();
                navigate("/welcome");

                Semester()
                    .then((data) => setSemesters(data))
                    .catch((error) => console.error("Error fetching semesters:", error));
            })
            .catch((error) => {
                console.error("Error adding semester:", error);
                alert("Failed to add semester. Please try again.");
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const handleDeleteSemester = (semesterId) => {
        console.log("Deleting semester with ID:", semesterId);
        deleteSemester(semesterId)
            .then(() => {
                alert("Semester delete successfully!");
                setSemesters(semesters.filter((semester) => semester.id !== semesterId));
            })
            .catch((error) => {
                console.error("Error deleting semester:", error);
                alert("Failed to delete semester. Please try again.");
            });
    };

    return (
        <div>
            <h1>Semester Management</h1>
            <h2>Add/Delete Semester</h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({isSubmitting}) => (
                <Form>
                    <div>
                        <label htmlFor="nameYear">Semester Name:</label> 
                        <Field
                          type="text"
                          id="nameYear"
                          name="nameYear"
                          placeholder="e.g., Fall 2023"
                        />
                        <ErrorMessage name="nameYear" component="div"
                        className="error" />
                    </div>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add/Delete Semester"}
                    </button>

                    <h2>Delete Semester</h2>
                    <ul>
                        {semesters.map((semester) => (
                            <li key={semester.id}>
                                {semester.name_year}
                                <button type="button" onClick={() => handleDeleteSemester(semester.id)}>
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </Form>
              )}
            </Formik>

            <Link to="/welcome">Back to Welcome Page</Link>
        </div>
    )
}

export default SemesterHandler;