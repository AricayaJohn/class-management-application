// src/LoginPage.js

import React, { useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./Context";

function LoginPage() {
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    //validation will appear if field is empty
    const validationSchema = yup.object({
        username: yup.string().required("Username is required"),
        password: yup.string().required("Password is required")
    });

    //Setting up Formik for login page
    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            login(values)
             .then(() => {
                navigate("/welcome");
             })
             .catch((error) => {
                alert("Invalid credentials")
             });
        },
    });
    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={formik.handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage