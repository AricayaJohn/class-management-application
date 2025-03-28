import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import  { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "./Context";

function StudentPage() {
    const { classId } = useParams();
    const [ students, setStudents ] = useState([]);
    const { StudentsForClass, addStudent, deleteStudent } = useContext(UserContext);
}