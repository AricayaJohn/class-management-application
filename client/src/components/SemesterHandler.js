import React, {useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "./Context";

function SemesterHandler() {
    const navigate = useNavigate();
    const { addSemester, updateSemester, semesters, loggedIn, error } = useContext(UserContext);
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
          )
          .test(
            'unique-semester',
            'Semester already exists',
            value => !semesters.some(s => s.name_year === value && s.id !== editingId)
          )
    });

    const handleSubmit = (values, { setSubmitting, resetForm }) => {
        setLoading(true);
        const operation = editingId ?
            updateSemester(editingId, values.nameYear) :
            addSemester(values.nameYear);

        operation.then(() => {
            alert(`Semester ${editingId ? 'updated' : 'added'} successfully!`);
            resetForm();
            setEditingId(null);
            navigate("/welcome");
        })
        .catch((error) => {
            console.error("Error:", error);
            alert(error.message || `Failed to ${editingId ? 'update' : 'add'} semester`);
        })
        .finally(() => {
            setSubmitting(false);
            setLoading(false);
        });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Semester Management</h1>
            <h2>{editingId ? "Edit Semester" : "Add New Semester"}</h2>

            <Formik
              key={editingId || "Create"}
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
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
                    <div className="form-actions">
                        <button type="submit" disabled={isSubmitting}>
                            {editingId ? 
                            (isSubmitting ? "Updating..." : "Update Semester") :
                            (isSubmitting ? "Adding..." : "Add Semester")}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    navigate("/semesters");
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </Form>
              )}
            </Formik>

            <h2>Current Semesters</h2>
            {semesters.length === 0 ? (
                <p>No semesters found</p>
            ) : (
                <ul className="semester-list">
                    {semesters.map((semester) => (
                        <li key={semester.id} className={editingId === semester.id ? "editing" : ""}>
                            <span>{semester.name_year}</span>
                            <div className="semester-actions">
                                <button 
                                    type="button"
                                    onClick={() => setEditingId(semester.id)}
                                    disabled={loading}
                                >
                                    Edit
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Link to="/welcome" className="back-link">Back to Welcome Page</Link>
        </div>
    )
}

export default SemesterHandler;