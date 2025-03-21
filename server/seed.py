#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db

class Professor(db.Model, SerializerMixin):
    __tablename__ = "professors"
    serialize_rules = ('-_password_hash', '-semesters.professor',) 

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    name = db.Column(db.String, nullable=False)
    department = db.Column(db.String, nullable=False)
    office_location = db.Column(db.String, nullable=True)
    _password_hash = db.Column(db.String, nullable=False)

    semesters = db.relationship('Semester', back_populates='professor', cascade='all, delete-orphan')

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

    @hybrid_property
    def _password_hash(self):
        raise Exception('Password hashes may not be viewed')

    @password_hash.setter
    def password_hash(self, password):
        if len(password) < 5:
            raise ValueError("Password should be 5 characters or longer")
        self._password_hash = bcrypt.generate_password_hash(password.encode('utf-8')).decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    @validates('username')
    def validate_username(self, key, username):
        if not username or not isinstance(username, str):
            raise ValueError('Username should be a string')
        if len(username) < 3:
            raise ValueError('Username should be at 3 characters or more')
        return username

    @validates('name')
    def validate_name(self, key, name):
        if not name or not isinstance(name, str):
            raise ValueError('Department must be a string')
        return department
    
    @validates('office_location')
    def validate_office_location(self, key, office_location):
        if office_location and not isinstance(office_location, str):
            raise ValueError('Office location should be a string.')
        return office_location

    def to_dict(self, rules=()):
        professor_dict = {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "department": self.department,
            "office_location": self.office_location,
            "semesters": [semester.to_dict() for semester in self.semesters]
        }
        for rule in rules:
            if rule in professor_dict:
                del professor_dict[rule]
        return professor_dict
    
    def __repr__(self):
        return f'<Professor ID: {self.id} | Username: {self.username} | Name: {self.name}'

class Student(db.Model, SerializerMixin):
    __tablename__ = "students"
    serialize_rules = ('-registrations.student',) 

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    major = db.Column(db.String, nullable=False)

    registrations = db.relationship('Registration', back_populates='student', cascade='all, delete-orphan')

    @validates('name')
    def validate_name(self, key, name):
        if not name or not isinstance(name, str):
            raise ValueError('Name must not be empty')
        return name

    @validates('major')
    def validate_major(self, key, major):
        if not major or not isinstance(major, str):
            raise ValueError('Major must be a string')
        return major
    
    def __repr__(self):
        return f'<Student ID: {self.id} | Name: {self.name}>'

class Semester(db.Model, SerializerMixin):
    __tablename__ = "semesters"
    serialize_rules = ('-professor.semesters', '-classes.semester',)

    id = db.Column(db.Integer, primary_key=True)
    name_year = db.Column(db.String,nullable=False)
    professor_id = db.Column(db.Integer, db.ForeignKey('professors.id'))

    professor = db.relationship('Professor', back_populates='semesters')
    classes = db.relationship('Class', back_populates='semester', cascade='all, delete-orphan')

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!
