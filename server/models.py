from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property

from config import db, bcrypt

# Models go here!
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
    def is_active(self):
        return True
    
    @property
    def is_anonymous(self):
        return False

    @hybrid_property
    def password_hash(self):
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
            raise ValueError('Name must be a string')
        return name

    @validates('department')
    def validate_department(self, key, department):
        if not department or not isinstance(department, str):
            raise ValueError('Department must be a non-empty string.')
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
        return f'<Professor ID: {self.id} | Username: {self.username} | Name: {self.name}>'

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

    @validates('name_year')
    def validate_name_year(self, key, name_year):
        if not name_year or not isinstance(name_year, str):
            raise ValueError("Semester name and year must be a string")
        return name_year

    @validates('professor_id')
    def validate_professor_id(self, key, professor_id):
        if not professor_id or not isinstance(professor_id, int):
            raise ValueError('Prof ID must be a valid integer')
        return professor_id

    def __repr__(self):
        return f'<Semester ID: {self.id} | Name: {self.name_year}>'

class Class(db.Model, SerializerMixin):
    __tablename__ = "classes"
    serialize_rules = ('-semester.classes', '-registrations.course',)

    id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String, nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    class_room = db.Column(db.String, nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.id'))

    semester = db.relationship('Semester', back_populates='classes')
    registrations = db.relationship('Registration', back_populates='course', cascade='all, delete-orphan')

    @validates('class_name')
    def validate_class_name(self, key, class_name):
        if not class_name or not isinstance(class_name, str):
            raise ValueError('Class name must be a string')
        return class_name

    @validates('credits')
    def validate_credits(self, key, credits):
        if not isinstance(credits, int) or credits < 1 or credits > 6:
            raise ValueError('Credits must be an integer between 1 and 6.')
        return credits

    @validates('class_room')
    def validate_class_room(self, key, class_room):
        if not class_room or not isinstance(class_room, str):
            raise ValueError('Class room must be a non-empty string')
        return class_room

    @validates('semester_id')
    def validate_semester_id(self, key, semester_id):
        if not semester_id or not isinstance(semester_id, int):
            raise ValueError('Semester ID must be a valid integer')
        return semester_id

    def __repr__(self):
        return  f'<Class ID: {self.id} | Name: {self.class_name}>'

class Registration(db.Model, SerializerMixin): 
    __tablename__ = "registrations"
    serialize_rules = ('-student.registrations', '-course.registrations',)

    id = db.Column(db.Integer, primary_key=True)
    paid_status = db.Column(db.Boolean, nullable=False, default=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'))
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'))

    student = db.relationship('Student', back_populates='registrations')
    course = db.relationship('Class', back_populates='registrations')

    @validates('class_id')
    def validate_class_id(self, key, class_id):
        if not class_id or not isinstance(class_id, int):
            raise ValueError('Class ID must be a valid integer')
        return class_id

    @validates('student_id')
    def validate_student_id(self, key, student_id):
        if not student_id or not isinstance(student_id, int):
            raise ValueError("Student ID must be a valid integer")
        return student_id

    def __repr__(self):
        return f'<Registration ID: {self.id} | Paid: {self.paid_status}>'