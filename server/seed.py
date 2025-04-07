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
    student1 = Student(name="Alice Johnson", major="Computer Science")
    student2 = Student(name="Bob Brown", major="Mathematics")
    student3 = Student(name="Charlie Davis", major="Physics")

    db.session.add_all([student1, student2, student3])
    db.session.commit()

    return [student1, student2, student3]

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

# def create_registrations(students, classes):
#     print("Creating registrations...")
#     registration1 = Registration(paid_status=True, class_id=classes[0].id, student_id=students[0].id)
#     registration2 = Registration(paid_status=False, class_id=classes[1].id, student_id=students[0].id)

#     registration3 = Registration(paid_status=True, class_id=classes[1].id, student_id=students[1].id)
#     registration4 = Registration(paid_status=False, class_id=classes[2].id, student_id=students[1].id)

#     registration5 = Registration(paid_status=True, class_id=classes[0].id, student_id=students[2].id)
#     registration6 = Registration(paid_status=False, class_id=classes[2].id, student_id=students[2].id)

#     db.session.add_all([registration1, registration2, registration3, registration4, registration5, registration6])
#     db.session.commit()

#     return [registration1, registration2, registration3, registration4, registration5, registration6]

def seed():
    print("Starting seed process...")
    clear_data()
    professors = create_professors()
    students = create_students()
    semesters = create_semesters(professors)
    classes = create_classes(semesters)
    # registrations = create_registrations(students, classes)

    print("Database seeded successfully")

if __name__ == '__main__':
    with app.app_context():
        seed()
