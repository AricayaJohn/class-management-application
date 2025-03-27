import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UseContext } from "/Context";

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
            .integer("Credits mmust be a whole number"),
        room: Yup.string().required("Room is required"),
        semesterId: Yup.string().required("Semester is required"),
    });

}