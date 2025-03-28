import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import  { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "./Context";

function StudentPage() {
    const { classId } = useParams();
    const [ students, setStudents ] = useState([]);
    const { StudentsForClass, addStudent, deleteStudent } = useContext(UserContext);

    useEffect(() => {
        StudentsForClass(classId)
          .then((data) => {
            if (Array.isArrat(data)) {
                setStudents(data);
            } else {
                throw new Error("Invalid data format: expected an array");
            }
          })
          .catch((error) => {
            console.error("Error fetching students:", error);
            setStudents([]);
          });
    }, [classId, StudentsForClass]);
}