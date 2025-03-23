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
        password: yup.string().required("passowrd is required")
    });

    //Setting up Formik for login page
    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
        },
        validationSchema: validationSchema,
        onsubmit: (values) => {
            login(values)
             .then(() => {
                navigate("/welcome");
             })
             .catch((error) => {
                alert("Invalid credentials")
             });
        },
    });

    
}