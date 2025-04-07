#!/usr/bin/env python3

from config import app, db, bcrypt
from models import Professor, Student, Semester, Class, Registration

def clear_data():
    print("Deleting existing data...")
    db.drop_all()
    db.create_all()

def create_professors():
    print("Creating professors...")
    prof1 = Professor(username="prof_john", name="John Doe", department="Computer Science", office_location="Room 101", )
    prof1.password_hash = "password123"

    prof2 = Professor(username="prof_jane", name="Jane Smith", department="Mathematics", office_location="Room 202",)
    prof2.password_hash = "password456"

    db.session.add_all([prof1, prof2])
    db.session.commit()

    return [prof1, prof2]

def create_students():
    print("Creating students...")
    students = [
        Student(name="Alice Johnson", major="Computer Science"),
        Student(name="Bob Brown", major="Mathematics"),
        Student(name="Charlie Davis", major="Physics"),
        Student(name="Diana Miller", major="Biology"),
        Student(name="Evan Wilson", major="Chemistry"),
        Student(name="Fiona Clark", major="Engineering"),
        Student(name="George Adams", major="Psychology"),
        Student(name="Hannah White", major="Economics")
    ]
    
    db.session.add_all(students)
    db.session.commit()
    return students

def create_semesters(professors):
    print("Creating semesters...")
    semester1 = Semester(name_year="Fall 2023", professor_id= professors[0].id)
    semester2 = Semester(name_year="Spring 2024", professor_id=professors[1].id)

    db.session.add_all([semester1, semester2])
    db.session.commit()

    return [semester1, semester2]

def create_classes(semesters):
    print("Creating classes...")
    class1 = Class(
        class_name="Introduction to Programming",
        credits=3,
        class_room="Room 301",
        semester_id=semesters[0].id,
    )
    class2 = Class(
        class_name="Calculus 1",
        credits=4,
        class_room="Room 302",
        semester_id=semesters[0].id,
    )
    class3 = Class(
        class_name="Linear Algebra",
        credits=4,
        class_room="Room 303",
        semester_id=semesters[1].id,
    )

    db.session.add_all([class1, class2, class3])
    db.session.commit()

    return [class1, class2, class3]

def create_registrations(students, classes):
    print("Creating registrations...")
    registrations = [
        # Existing registrations
        Registration(paid_status=True, class_id=classes[0].id, student_id=students[0].id),
        Registration(paid_status=False, class_id=classes[1].id, student_id=students[0].id),
        Registration(paid_status=True, class_id=classes[1].id, student_id=students[1].id),
        Registration(paid_status=False, class_id=classes[2].id, student_id=students[1].id),
        Registration(paid_status=True, class_id=classes[0].id, student_id=students[2].id),
        Registration(paid_status=False, class_id=classes[2].id, student_id=students[2].id),

        # New registrations for additional students
        # Diana Miller
        Registration(paid_status=True, class_id=classes[0].id, student_id=students[3].id),
        Registration(paid_status=False, class_id=classes[2].id, student_id=students[3].id),
        
        # Evan Wilson
        Registration(paid_status=True, class_id=classes[1].id, student_id=students[4].id),
        Registration(paid_status=False, class_id=classes[2].id, student_id=students[4].id),
        
        # Fiona Clark
        Registration(paid_status=True, class_id=classes[0].id, student_id=students[5].id),
        Registration(paid_status=False, class_id=classes[1].id, student_id=students[5].id),
        
        # George Adams
        Registration(paid_status=True, class_id=classes[0].id, student_id=students[6].id),
        Registration(paid_status=False, class_id=classes[1].id, student_id=students[6].id),
        Registration(paid_status=True, class_id=classes[2].id, student_id=students[6].id),
        
        # Hannah White
        Registration(paid_status=False, class_id=classes[0].id, student_id=students[7].id)
    ]

    db.session.add_all(registrations)
    db.session.commit()
    return registrations

def seed():
    print("Starting seed process...")
    clear_data()
    professors = create_professors()
    students = create_students()
    semesters = create_semesters(professors)
    classes = create_classes(semesters)
    registrations = create_registrations(students, classes)

    print("Database seeded successfully")

if __name__ == '__main__':
    with app.app_context():
        seed()
