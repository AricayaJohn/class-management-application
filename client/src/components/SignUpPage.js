import React, { useContext } from "react";
import { useFromik } from "formik";
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

    const formik = useFormik ({
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
            <form onSubmit/>
        </div>
    )
}