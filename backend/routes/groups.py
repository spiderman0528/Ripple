from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.group import Group
from models.user import User

groups = Blueprint('groups', __name__)

# Create a group
@groups.route('/', methods=['POST'])
@jwt_required()
def create_group():
    data = request.get_json()
    user_id = get_jwt_identity()

    group = Group(
        name=data['name'],
        description=data.get('description', ''),
        creator_id=user_id
    )

    user = User.query.get(user_id)
    group.members.append(user)

    db.session.add(group)
    db.session.commit()

    return jsonify(group.to_dict()), 201

# Get all groups
@groups.route('/', methods=['GET'])
def get_groups():
    all_groups = Group.query.order_by(Group.created_at.desc()).all()
    return jsonify([g.to_dict() for g in all_groups]), 200

# Join a group
@groups.route('/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)
    user = User.query.get(user_id)

    if user in group.members:
        return jsonify({'error': 'Already a member'}), 400

    group.members.append(user)
    db.session.commit()

    return jsonify({'message': f'Joined {group.name}!'}), 200

# Get members of a group
@groups.route('/<int:group_id>', methods=['GET'])
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify({
        **group.to_dict(),
        'members': [{'id': m.id, 'username': m.username} for m in group.members]
    }), 200