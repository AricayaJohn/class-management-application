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


api.add_resource(CheckSession, '/check_session')
api.add_resource(Login, '/login')


if __name__ == '__main__':
    app.run(port=5555, debug=True)

