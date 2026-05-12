from flask import Blueprint, request, jsonify
from models.user import User
from models.group import Group

search = Blueprint('search', __name__)

@search.route('/users', methods=['GET'])
def search_users():
    q = request.args.get('q', '')
    if not q:
        return jsonify([]), 200
    users = User.query.filter(User.username.ilike(f'%{q}%')).limit(10).all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'ripple_energy': u.ripple_energy
    } for u in users]), 200

@search.route('/groups', methods=['GET'])
def search_groups():
    q = request.args.get('q', '')
    if not q:
        return jsonify([]), 200
    groups = Group.query.filter(Group.name.ilike(f'%{q}%')).limit(10).all()
    return jsonify([g.to_dict() for g in groups]), 200