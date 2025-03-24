import React, { useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./Context";

function SignUpPage() {
    const { signup } = useContext(UserContext);
    const navigate = useNavigate();

    const validationSchema = yup.object({
        username: yup.string().required("Username is required"),
        password: yup.string().required("Password is required"),
        passwordConfirmation: yup
         .string()
         .oneOf([yup.ref("password"), null], "Passwords must match")
         .required("Confirm password is required"),
        name: yup.string().required("Name is required"),
        department: yup.string().required("Department is required"),
    });

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            passwordConfirmation: "",
            name: "",
            department: "",
            office_location: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            signup(values)
            .then(() => {
                setTimeout(() => navigate("/welcome"), 300);
            })
            .catch((error) => {
                alert(`Signup failed: ${error.message}`);
            });
        },
    });
    return (
        <div>
            <h1>Sign Up</h1>
            <form onSubmit={formik.handleSubmit}>
                <div>
                    <label htmlFor="username"> Username: </label>
                    <input 
                     type="text"
                     id="username"
                     name="username"
                     onChange={formik.handleChange}
                     value={formik.values.username}
                    />
                    {formik.errors.username && <p>{formik.errors.username}</p>}
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                     type="password"
                     id="password"
                     name="password"
                     onChange={formik.handleChange}
                     value={formik.values.password} 
                    />
                    {formik.errors.password && <p>{formik.errors.password}</p>}
                </div>
                <div>
                    <label htmlFor="passwordConfirmation">Confirm Password:</label>
                    <input
                     type="password"
                     id="passwordConfirmation"
                     name="passwordConfirmation"
                     onChange={formik.handleChange}
                     value={formik.values.passwordConfirmation}
                    />
                    {formik.errors.passwordConfirmation && (
                        <p>{formik.errors.passwordConfirmation}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input 
                     type="text"
                     id="name"
                     name="name"
                     onChange={formik.handleChange}
                     value={formik.values.name}
                    />
                    {formik.errors.name && <p>{formik.errors.name}</p>}
                </div>
                <div>
                    <label htmlFor="department">Department:</label>
                    <input
                     type="text"
                     id="department"
                     name="department"
                     onChange={formik.handleChange}
                     value={formik.values.department}
                    />
                    {formik.errors.department && <p>{formik.errors.department}</p>}
                </div>
                <div>
                    <label htmlFor="office_location">Office Location:</label>
                    <input
                     type="text"
                     id="office_location"
                     name="office_location"
                     onChange={formik.handleChange}
                     value={formik.values.office_location}
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUpPage;