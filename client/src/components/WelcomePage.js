import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./Context";

function WelcomePage(){
    const { user, logout, Semester, ClassesForSemester } = useContext(UserContext);
    const [ semesters, setSemesters ] = useState([]);
    const [ selectedSemester, setSelectedSemester ] = useState(null);
    const [ classes, setClasses ] = useState([])
    const [ loading, setLoading ] = useState([true]);
    const [ error, setError ] = useState(null);
    const navigate = useState();
}