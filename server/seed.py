#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db

class Professor(db.Model, SerializerMixin):
    __tablename__ = "professor"
    serialize_rules = ('_password_hash', '-semesters.professor',) 

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    name = db.Column(db.String, nullable=False)
    department = db.Column(db.String, nullable=False)
    office_location = db.Column(db.String, nullable=True)
    _password_hash = db.Column(db.String, nullable=False)

    semester = db.relationship('Semester', back_populates='professor', cascade='all, delete-orphan')

    def get_id(self):
        return str(self.id)

    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False

    @Hybrid_property
    def _password_hash(self):
        raise Exception('Password hashes may not be viewed')

    @Password_hash.setter
    def password_hash(self, password):
        if len(password) < 5:
            raise ValueError("Password should be 5 characters or longer")
        self._password_hash = bcrypt.generate_password_hash(password.encode('utf-8')).decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))




if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!
