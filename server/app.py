#!/usr/bin/env python3

from flask import request, make_response, abort
from flask_restful import Resource
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy.exc import IntegrityError
from config import app, db, api, login_manager, bcrypt
from models import Professor, Student, Semester, Class, Registration


@login_manager.user_loader
def load_user(professor_id):
    return db.session.get()

class CheckSession(Resource):
    def get(self):
        if current_user.is_authenticated:
            return current_user.to_dict(rules=('-_password_hash',)), 200
        return {'message': 'Not authenticated'}, 401


if __name__ == '__main__':
    app.run(port=5555, debug=True)

