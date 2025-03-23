// src/LoginPage.js

import React, { useContext } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./Context";

function LoginPage() {
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    const validationSchema = yup.object({
        username: yup.string().required("Username is required"),
        password: yup.string().required("passowrd is required")
    });
}