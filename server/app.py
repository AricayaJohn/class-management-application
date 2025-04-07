#!/usr/bin/env python3

from flask import request, make_response, abort
from flask_restful import Resource
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy.exc import IntegrityError
from config import app, db, api, login_manager, bcrypt
from models import Professor, Student, Semester, Class, Registration


@login_manager.user_loader
def load_user(professor_id):
    return db.session.get(Professor, int(professor_id))

class CheckSession(Resource):
    def get(self):
        if current_user.is_authenticated:
            return current_user.to_dict(rules=('-_password_hash',)), 200
        return {'message': 'Not authenticated'}, 401

class CurrentUser(Resource):
    @login_required
    def get(self):
        if current_user.is_authenticated:
            return current_user.to_dict(rules=('-_password_hash', '-semesters.professor',)), 200
        return {'message': 'Not authenticated'}, 401

class Login(Resource):
    def post(self):
        json = request.get_json()
        username = json.get('username')
        password = json.get('password')

        if not username:
            return {'message': 'Username required!'}, 400
        if not password:
            return {'message': 'Password required'}, 400
        
        professor = db.session.query(Professor).filter_by(username=username).first()

        if professor and professor.authenticate(password):
            login_user(professor, remember=True)
            return current_user.to_dict(rules=('-_password_hash', '-semesters.professor',)), 201
        
        return {'message': 'Invalid credentials'}, 401

class Professors(Resource):
    def post(self):
        json = request.get_json()
        try: 
            new_professor = Professor(
                username=json['username'],
                name=json['name'],
                department=json['department'],
                office_location=json.get('office_location'),
            )
            new_professor.password_hash = json['password']
            db.session.add(new_professor)
            db.session.commit()
            login_user(new_professor, remember=True)
            return make_response(new_professor.to_dict(rules=('-_password_hash', '-semesters.professor',)), 201)
        except IntegrityError:
            db.session.rollback()
            return {'errors': 'Username already exists'}, 400
        except Exception as e:
            return {'errors': str(e)}, 500

class Logout(Resource):
    @login_required
    def post(self):
        logout_user()
        return {'message': 'Logged out successfully!'}, 200

class Semesters(Resource):
    def get(self):
        semesters = db.session.query(Semester).filter_by(professor_id=current_user.id).all()
        semesters_data = [semester.to_dict(rules=('-professor.semesters', '-classes.semester',)) for semester in semesters]
        return make_response(semesters_data, 200)

    def post(self):
        json = request.get_json()
        try:
            new_semester = Semester(
                name_year=json['name_year'],
                professor_id=current_user.id
            )
            db.session.add(new_semester)
            db.session.commit()
            return make_response(new_semester.to_dict(), 201)
        except IntegrityError:
            db.session.rollback()
            return{'errors': 'Semester already exists'}, 400
        except Exception as e:
            return {'errors': str(e)}, 500

    def delete(self, semester_id):
        semester = db.session.get(Semester, semester_id)
        if not semester:
            return {'message': 'Semester not found'}, 404
        if semester.professor_id != current_user.id:
            return {'message': 'Unauthorized'}, 403
        db.session.delete(semester)
        db.session.commit()
        return {}, 204

class SemesterClasses(Resource):
    def get(self, semester_id): #get all semester for current professor
        semester = db.session.get(Semester, semester_id)
        if not semester:
            return {'message': 'Semester not found'}, 404
        classes = db.session.query(Class).filter_by(semester_id=semester_id).all()
        classes_data = [cls.to_dict(rules=('-semester.classes','-registrations.course',)) for cls in classes]
        return make_response(classes_data, 200)

#function to delete semester
class SemesterResource(Resource):
    def delete(self, semester_id):
        semester = db.session.get(Semester, semester_id)
        if not semester:
            return {"message": "Semester not found"}, 404
        try:
            db.session.delete(semester)
            db.session.commit()
            return {"message": "Semester delete successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting semester: {str(e)}"}, 500

class Classes(Resource):
    def get(self, class_id):
        #fetch students for class
        students = db.session.query(Student).join(Registration).filter(Registration.class_id == class_id).all()
        students_data = [student.to_dict(rules=('-registration.student',)) for student in students]
        return make_response(students_data, 200)

    def post(self):
        json = request.get_json()
        try:
            if not all(field in json for field in ['class_name', 'credits', 'class_room', 'semester_id']):
                return {'errors': 'missing required fields'}, 400

            semester_id =int(json['semester_id'])

            semester = db.session.get(Semester, semester_id)
            if not semester:
                return {'errors': 'Semester not found'}, 404

            new_class = Class(
                class_name=json['class_name'],
                credits=json['credits'],
                class_room=json['class_room'],
                semester_id=semester_id,
            )

            db.session.add(new_class)
            db.session.commit()
            return make_response(new_class.to_dict(), 201)
        except IntegrityError:
            db.session.rollback()
            return {'errors': 'Class already exists or invalid semester_id'}, 400
        except Exception as e:
            return {'errors': str(e)}, 500

# class ClassStudents(Resource):
#     @login_required
#     def get(self, class_id):
#         cls = Class.query.get(class_id)
#         if not cls or cls.semester.professor_id != current_user.id:
#             return {'message': 'Class not found'}, 404
#         return [s.to_dict(rules=('-registrations.student'))
#         for s in cls.students], 200

class Registrations(Resource):
    @login_required
    def post(self):
        json = request.get_json()
        try:
            #verify if class belongs to professosr
            cls = Class.query.get(json['class_id'])
            if not cls or cls.semester.professor_id != current_user.id:
                return {'message': 'Class not found'}, 404
            #check if student exists
            if not Student.query.get(json['student_id']):
                return {'message': 'Student not found'}, 404

            if Registration.query.filter_by(
                student_id=json['student_id'],
                class_id=json['class_id']
            ).first():
                return {'message': 'Student already registered'}, 400

            registration = Registration(
                paid_status=json.get('paid_status', False),
                student_id=json['student_id'],
                class_id=json['class_id']
            )
            db.session.add(registration)
            db.session.commit()
            return registration.to_dict(rules=('-student.registrations', '-course.registrations')), 201
        except Exception as e:
            db.session.rollback()
            return {'errors': str(e)}, 500

class Students(Resource):
    @login_required
    def get(self):
        students = Student.query.all()
        return [s.to_dict(rules=('-registrations.student',))
        for s in students], 200

    @login_required
    def post(self):
        json = request.get_json()
        try:
            student = Student(
                name=json['name'], 
                major=json['major']
            )
            db.session.add(student)
            db.session.commit()
            return student.to_dict(rules=('-registrations.student',)), 201
        except Exception as e:
            return {'errors': str(e)}, 500

    # def delete(self, id):
    #     student = db.session.get(Student, id)
    #     if not student:
    #         abort(404, "Student not found")
    #     db.session.delete(student)
    #     db.session.commit()
    #     return {}, 204

            

api.add_resource(CheckSession, '/check_session')
api.add_resource(Login, '/login')
api.add_resource(CurrentUser, '/current_user')
api.add_resource(Professors, '/professors')
api.add_resource(Logout, '/logout')

api.add_resource(Semesters, '/semesters')
api.add_resource(SemesterClasses, '/semesters/<int:semester_id>/classes')
api.add_resource(SemesterResource, "/semesters/<int:semester_id>")

api.add_resource(Classes, '/classes', '/classes/<int:class_id>')
api.add_resource(ClassStudents, '/classes/<int:class_id>/students') 

api.add_resource(Registrations, '/registrations')
api.add_resource(Students, '/students', '/students/<int:id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)

