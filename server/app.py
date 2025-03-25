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
            return current_user.to_dict(rules=('-password_hash', '-semesters.professor',)), 200
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
            return current_user.to_dict(rules=('-_password_hash', '-semester.professor',)), 201
        
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
            return make_response(new_professor.to_dict(rules=('-_passowrd_hash', '-semesters.professor',)), 201)
        except IntegrityError:
            db.session.rollback()
            return{'errors': 'Username already exists'}, 400
        except Exception as e:
            return {'errors': str(e)}, 500


api.add_resource(CheckSession, '/check_session')
api.add_resource(Login, '/login')
api.add_resource(CurrentUser, '/current_user')
api.add_resource(Professors, '/professors')


if __name__ == '__main__':
    app.run(port=5555, debug=True)

