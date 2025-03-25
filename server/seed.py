#!/usr/bin/env python3

from config import app, db, bycrpt
from models import Professor, Student, Semester, Registration

def clear_data():
    print("Deleting existing data...")
    db.drop_all()


def seed():
    clear_data()

if __name__ == '__main__':
    with app.app_context():
        seed()
