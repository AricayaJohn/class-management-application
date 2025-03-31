#!/usr/bin/env python3

from config import app, db, bycrpt
from models import Professor, Student, Semester, Registration

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
    student3 = Student(name="Charlie Davis", major="Phisics")

    db.session.add_all([student1, student2, student3])
    db.session.commit()

    return [student1, student2, student3]

def create_semesters(professors):
    print("creating semesters...")
    semester1 = Semester(name_year="Fall 2023", professor_id= professor[0].id)
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
        semester_id
    )

def seed():
    clear_data()

if __name__ == '__main__':
    with app.app_context():
        seed()
