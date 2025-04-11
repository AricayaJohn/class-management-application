# Class Management System
<hr>

## Introduction:
The web application helps professors manage their classess in a semester and their students and their registration. The professor allows us to manage the system by allowing us to create, read, update and delete(CRUD) data. 

## Features

### User Authentication:
  - Sign-up: Professor can sign himself to give him access to the application that will let him manage his information and details
  - Log in: allows access to personalized account

### Class Management:
  - Semester Management: 
      - This allows professor to switch semesters, add a semester, and delete which semester they are trying trying to manage
      - This also allows us to read classes that the professor will be teaching per semester
  - Class Management: This allows user to add, update, delete classes

## Error Handling and Validation:
- Attribute Validations for user input to prevent incorrect or incomplete data.
- Error messages logic for invalid submissions
- Installing Formik Library to validate data before form submissions
- Use of @validates Decorator to add validation logic which raises errors if data is invalid
- Database Constraints checks if data meets specific criteria before data is stored

## Technology Used:

### Front End:
React: JavaScript library for building user interfaces
React Router: For client-side routing and navigation
Context API: For state management across components
Fetch API: For making HTTP requests to the backend

### Back End:
Python Flask: Micro web framework for building RESTful APIs
Flask-RESTful: Extension for creating REST APIs with Flask
SQLAlchemy: Object Relational Mapping (ORM) tool for database interactions
Flask-Login: For user session management and authentication
Bcrypt: For password hashing and security
SQLAlchemy-Serializer: For model serialization to JSON

### Other Library and Tools:
  - SQLAlchemy : Object Relational Mapping(ORM) tool that is used to communicate with the databases using python classes
  - Formik for Validations

## Database Schema & Relationships

### Associations:
- Professor has many semester 
      - Professor can teach multiple semesters
- Professor has many classes through semesters table
- Each Semester has many Classess
- Class has many students through Registration
- Registratiion is the through assosiation table for classes and students
- Student has many classes
    - Students are registered for many classes through registration table


### API EndPoints
  - We use Restful Routing: a routing method that follows the representational state transfer principle where it organize URL resources and HTTP requests to perform CRUD operations


