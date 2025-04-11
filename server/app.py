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

#function to delete semester
class SemesterResource(Resource):
    def delete(self, semester_id):
        semester = db.session.get(Semester, semester_id)
        if not semester:
            return {"message": "Semester not found"}, 404
        if semester.professor_id != current_user.id:
            return {'message': 'Unauthorized'}, 403
        
        try:
            db.session.delete(semester)
            db.session.commit()
            return {}, 204
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting semester: {str(e)}"}, 500

    @login_required
    def patch(self, semester_id):
        semester = db.session.get(Semester, semester_id)
        if not semester:
            return {"message": "Missing name_year field"}, 404
        if semester.professor_id != current_user.id:
            return {'message': 'Unauthorized'}, 403

        data = request.get_json()
        if 'name_year' not in data:
            return {'message': 'Missing name_year field'}, 400

        try: 
            semester.name_year = data['name_year']
            db.session.commit()
            return semester.to_dict(), 200
        except IntegrityError:
            db.session.rollback()
            return {'message': 'Semester name already exists'}, 400
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating semester: {str(e)}"}, 500

class Classes(Resource):
    def post(self):
        json = request.get_json()
        try:
            if not all(field in json for field in ['class_name', 'credits', 'class_room', 'semester_id']):
                return {'errors': 'Missing required fields'}, 400

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

class ClassEnrollment(Resource):
    @login_required
    def get(self, class_id):
        cls = Class.query.get(class_id)
        if not cls or cls.semester.professor_id != current_user.id:
            return {'message': 'Class not found'}, 404

        registrations = Registration.query.filter_by(class_id=class_id).all()
        registered = [{
            'id': r.id,
            'paid_status': r.paid_status,
            'student': r.student.to_dict(rules=('-registrations',))
        } for r in registrations]

        subquery = db.session.query(Registration.student_id).filter_by(class_id=class_id)
        available = Student.query.filter(~Student.id.in_(subquery)).all()
        available_students = [{
            'student': s.to_dict(rules=('-registrations',)),
            'existing_registrations': [r.class_id for r in s.registrations]
        } for s in available]

        return {
            'registrations': registered,  # Make sure this key exists
            'available': available_students  # And this one too
        }, 200

class Registrations(Resource):
    @login_required
    def post(self):
        data = request.get_json()
        cls = Class.query.get(data['class_id'])

        if not cls or cls.semester.professor_id != current_user.id:
            return {'message': 'Class not found'}, 404

        if Registration.query.filter_by(
            student_id=data['student_id'],
            class_id=data['class_id']
        ).first():
            return {'message': 'Student already registered'}, 400

        registration = Registration(  # Fixed variable name consistency
            class_id=data['class_id'],
            student_id=data['student_id'],
            paid_status=data.get('paid_status', False)
        )
            
        db.session.add(registration)    
        db.session.commit()
            
        return {
            'id': registration.id,
            'paid_status': registration.paid_status,
            'student': registration.student.to_dict(rules=('-registrations',))
        }, 201

class RegistrationResource(Resource):
    @login_required
    def delete(self, registration_id):
        registration = Registration.query.get(registration_id)
        if not registration:
            return {'message': 'Registration not found'}, 404

        cls = Class.query.get(registration.class_id)
        if not cls or cls.semester.professor_id != current_user.id:
            return {'message': 'Unauthorized'}, 403

        try:
            db.session.delete(registration)
            db.session.commit()
            return {'message': 'Registration deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error deleting registration: {str(e)}'}, 500

    @login_required
    def patch(self, registration_id):
        registration = Registration.query.get(registration_id)
        if not registration:
            return {'message': 'Registration not found'}, 404

        cls = Class.query.get(registration.class_id)
        if not cls or cls.semester.professor_id != current_user.id:
            return {'message': 'Unauthorized'}, 403

        data = request.get_json()
        if 'paid_status' not in data:
            return {'message': 'Missing paid_status field'}, 400

        try:
            registration.paid_status = data['paid_status']
            db.session.commit()
            return make_response({
                'id': registration.id,
                'paid_status': registration.paid_status,
                'student': registration.student.to_dict(rules=('-registrations',))
            }, 200)
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error updating registration: {str(e)}'}, 500

class Students(Resource):
    # Add this to Students class:
    @login_required
    def get(self):
        students = Student.query.all()
        return [s.to_dict(rules=('-registrations',)) for s in students], 200

    @login_required
    def post(self):
        data = request.get_json()
        required_fields = ['name', 'major']
        if not all(field for field in required_fields):
            return{'message': 'Missing requred fields (name, major)'}, 400

        try: 
            new_student = Student(
                name=data['name'],
                major=data['major']
            )
            db.session.add(new_student)
            db.session.commit()
            return new_student.to_dict(rules=('-registrations',)), 201
        except IntegrityError:
            db.session.rollback()
            return {'message': 'Student already exists'}, 400
        except Exception as e:
            return {'message': str(e)}, 500


api.add_resource(CheckSession, '/check_session')
api.add_resource(Login, '/login')
api.add_resource(Professors, '/professors')
api.add_resource(Logout, '/logout')

api.add_resource(Semesters, '/semesters')
api.add_resource(SemesterResource, "/semesters/<int:semester_id>")

api.add_resource(Classes, '/classes')
api.add_resource(ClassEnrollment, '/classes/<int:class_id>/enrollment') 

api.add_resource(Registrations, '/registrations')
api.add_resource(RegistrationResource, '/registrations/<int:registration_id>')

api.add_resource(Students, '/students')

if __name__ == '__main__':
    app.run(port=5555, debug=True)