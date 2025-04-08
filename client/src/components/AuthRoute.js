import { useContext } from "react";
import { Navigate, useLocation} from 'react-router-dom';
import { UserContext } from "./Context";

export default function AuthRoute({ children, type = 'protected', notFound = false }) {
    const { loggedIn } = useContext(UserContext);
    const location = useLocation();

    if(notFound) {
        return <Navigate to={loggedIn ? "/welcome" : "/login"} replace />;
    }

    if (type === 'auth' && loggedIn) {
        return <Navigate to="/welcome" replace state={{ from: location}} />;
    }

    if (type === 'protected' && !loggedIn) {
        return <Navigate to="login" replace state={{from: location }} />;
    }

    return children;
}