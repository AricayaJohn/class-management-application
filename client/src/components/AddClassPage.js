import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "./Context";

function AddClass() {
    const navigate = useNavigate();
    const { Semesters, addClass } = useContext(UserContext);
    const [ semesters, setSemesters ] = useState([]);
    
    useEffect(() => {
        Semesters()
          .then((data) => setSemesters(data))
          .catch((error) => console.error("Error fetching semesters:", error));
    }, [Semesters]);

    const initialValues = {
        className: "",
        credits: "",
        room: "",
        semesterId: "",
    };

    const validationSchema = Yup.object({
        className: Yup.string().required("Class name is required"),
        credits: Yup.number()
            .required("Credits are required")
            .positive("Credits must be positive")
            .integer("Credits must be a whole number"),
        room: Yup.string().required("Room is required"),
        semesterId: Yup.string().required("Semester is required"),
    });

    const onSubmit = (values, { setSubmitting, resetForm }) => {
        addClass(values.className, values.credits, values.room, values.semesterId)
          .then(() => {
            alert("Class added successfully!");
            resetForm();
            navigate("/welcome");
          })
          .catch((error) => {
            console.error("Error adding class:", error);
            alert(`Failed to add class: ${error.message}`);
          })
          .finally(() => {
            setSubmitting(false);
          });
    };

    return (
        <div>
            <h1>Add Class</h1>

            <Formik 
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div>
                            <label htmlFor="className">Class Name:</label>
                            <Field type="text" id="className" name="className" />
                            <ErrorMessage name="className" component="div" className="error" />
                        </div>

                        <div>
                            <label htmlFor="credits">Credits:</label>
                            <Field type="number" id="credits" name="credits" />
                            <ErrorMessage name="credits" component="div" className="error" />
                        </div>

                        <div>
                            <label htmlFor="room">Room:</label>
                            <Field type="text" id="room" name="room" />
                            <ErrorMessage name="room" component="div" className="error"/>
                        </div>

                        <div>
                            <label htmlFor="semesterId">Semester:</label>
                            <Field as="select" id="semesterId" name="semesterId">
                                <option value="">Select a semester</option>
                                {semesters.map((semester) => (
                                    <option key={semester.id} value={semester.id}>
                                        {semester.name_year}
                                    </option>
                                 ))}
                            </Field>
                            <ErrorMessage name="semesterId" component="div" className="error" />
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Class"}
                        </button>
                        <Link to="welcome">Back to Welcome Page</Link>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default AddClass;