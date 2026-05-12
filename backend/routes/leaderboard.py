from flask import jsonify
from flask import Blueprint
from models.user import User

leaderboard = Blueprint('leaderboard', __name__)

@leaderboard.route('/', methods=['GET'])
def get_leaderboard():
    users = User.query.order_by(User.ripple_energy.desc()).limit(20).all()
    return jsonify([
        {
            'rank': i + 1,
            'username': u.username,
            'ripple_energy': u.ripple_energy,
            'created_at': u.created_at.isoformat()
        }
        for i, u in enumerate(users)
    ]), 200