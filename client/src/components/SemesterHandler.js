import React, {useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "./Context";

function SemesterHandler() {
    const navigate = useNavigate();
    const { addSemester, deleteSemester, Semester } = useContext(UserContext);
    const [semester, setSemesters] = useState([]);
    
    useEffect(() => {
        setSemesters()
            .then((data) => {
                console.log("Fetched semesters:", data);
                setSemesters(data);
            })
            .catch((error) => console.error("Error fetching semesters: ", error));
    }, Semesters);

    const initialValues = {
        nameYear: "",
    };

    const validationSchema = Yup.object({
        nameYear: Yup.string()
          .required("Semester name is requred")
          .matches(
            /^(Fall|Spring|Summer|Winter) \d{4}$/,
            "Semester name must be in the Format 'Season YYYY' (e.g., Fall 2023)"
          ),
    });
}