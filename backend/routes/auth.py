from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models.user import User

auth = Blueprint('auth', __name__)

# Sign up
@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400

    hashed_password = generate_password_hash(data['password'])

    user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully!'}), 201

# Log in
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200