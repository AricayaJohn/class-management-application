import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useContext, useState } from 'react';
import { UserContext } from './Context';

function StudentForm({ setError, onSuccess }) {
    const { addStudent } = useContext(UserContext);
    const [loading, setLoading] = useState(false);

    const studentValidationSchema = Yup.object({
        name: Yup.string()
            .required('Student name is required')
            .min(3, 'Name must be at least 3 characters'),
        major: Yup.string()
            .required('Major is required')
            .min(3, 'Major must be at least 3 characters'),
    });

    const handleCreateStudent = (values, { setSubmitting, resetForm }) => {
        setLoading(true);
        addStudent(values)
            .then(newStudent => {
                if (onSuccess) {
                    onSuccess(newStudent);
                }
                resetForm();
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setSubmitting(false);
                setLoading(false);
            });
    };

    return (
        <Formik
            initialValues={{name: '', major: '' }}
            validationSchema={studentValidationSchema}
            onSubmit={handleCreateStudent}
        >
            {({ isSubmitting }) => (
                <Form className="student-form">
                    <br />
                    <h3>Add new student to registration list
                        if student not found
                    </h3>
                    <div className="form-group">
                        <label htmlFor="name">Student Name:</label>
                        <Field type="text" id="name" name="name" />
                        <ErrorMessage name="name" component="div" className="error" />
                    </div>

                    <div className="form-group">
                        <label htmlFor='major'>Major:</label>
                        <Field type="text" id="major" name="major" />
                        <ErrorMessage name="major" component="div" className="error" />
                    </div>

                    <button type="submit" disabled={isSubmitting || loading}>
                        {isSubmitting ? 'Adding...' : 'Add Student'}
                    </button>
                </Form>
            )}
        </Formik>
    );
}

export default StudentForm;