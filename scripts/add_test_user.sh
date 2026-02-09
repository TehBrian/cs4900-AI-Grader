#! /usr/bin
curl -X POST http://127.0.0.1:8000/api/users/auth/register/ -H "Content-Type: application/json" -d '{ "username": "student1", "password": "password123", "email": "cvw1234@wmich.edu", "first_name": "John", "last_name": "Doe"}'

curl -X POST http://127.0.0.1:8000/api/users/auth/register/ -H "Content-Type: application/json" -d '{ "username": "instructor1", "password": "password321", "email": "cvw4321@wmich.edu", "first_name": "Albert", "last_name": "Einstein", "role": "instructor"}'
