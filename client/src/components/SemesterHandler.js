import React, {useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "./Context";

function SemesterHandler() {
    const navigate = useNavigate();
    const { addSemester, deleteSemester, updateSemester, semesters, loggedIn, error } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] =useState(null);
    
    useEffect(() => {
        if (!loggedIn) {
            navigate("/login");
        }
    }, [loggedIn, navigate]);

    const initialValues = {
        nameYear: semesters.find(s => s.id === editingId)?.name_year || "",
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
        setLoading(true);
        addSemester(values.nameYear)
            .then(() => {
                alert("Semester added successfully!");
                resetForm();
                navigate("/welcome");
            })
            .catch((error) => {
                console.error("Error adding semester:", error);
                alert(error.message || "Failed to add semester. Please try again.");
            })
            .finally(() => {
                setSubmitting(false);
                setLoading(false);
            });
    };

    const handleDeleteSemester = (semesterId) => {
        if (window.confirm("Are you sure you want to delete this semester?")) {
            setLoading(true);
            deleteSemester(semesterId)
                .then(() => {
                    alert("Semester deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting semester:", error);
                alert(error.message || "Failed to delete semester. Please try again.");
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
                        {isSubmitting ? "Adding..." : "Add Semester"}
                    </button>
                </Form>
              )}
            </Formik>

            <h2>Current Semesters</h2>
            {semesters.length === 0 ? (
                <p>No semesters found</p>
            ) : (
                <ul>
                {semesters.map((semester) => (
                    <li key={semester.id}>
                        {semester.name_year}
                        <button type="button" onClick={() => handleDeleteSemester(semester.id)} disabled={loading}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            )}

            <Link to="/welcome">Back to Welcome Page</Link>
        </div>
    )
}

export default SemesterHandler;