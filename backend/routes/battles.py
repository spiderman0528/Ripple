from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.battle import Battle, BattleEntry
from models.user import User
from datetime import datetime, timedelta

battles = Blueprint('battles', __name__)

# Create a battle
@battles.route('/', methods=['POST'])
@jwt_required()
def create_battle():
    data = request.get_json()
    user_id = get_jwt_identity()

    hours = data.get('hours', 24)
    expires_at = datetime.utcnow() + timedelta(hours=hours)

    battle = Battle(
        title=data['title'],
        description=data.get('description', ''),
        creator_id=user_id,
        expires_at=expires_at
    )

    db.session.add(battle)
    db.session.commit()

    return jsonify(battle.to_dict()), 201

# Get all battles
@battles.route('/', methods=['GET'])
def get_battles():
    all_battles = Battle.query.order_by(Battle.created_at.desc()).all()
    return jsonify([b.to_dict() for b in all_battles]), 200

# Submit an entry to a battle
@battles.route('/<int:battle_id>/enter', methods=['POST'])
@jwt_required()
def enter_battle(battle_id):
    data = request.get_json()
    user_id = get_jwt_identity()

    battle = Battle.query.get_or_404(battle_id)

    if not battle.is_active():
        return jsonify({'error': 'This battle has ended'}), 400

    entry = BattleEntry(
        battle_id=battle_id,
        user_id=user_id,
        content=data['content']
    )

    db.session.add(entry)
    db.session.commit()

    return jsonify(entry.to_dict()), 201

# Vote for an entry
@battles.route('/entries/<int:entry_id>/vote', methods=['POST'])
@jwt_required()
def vote_entry(entry_id):
    entry = BattleEntry.query.get_or_404(entry_id)
    entry.votes += 1

    user = User.query.get(entry.user_id)
    user.ripple_energy += 5

    db.session.commit()

    return jsonify({'votes': entry.votes}), 200

# Get entries for a battle
@battles.route('/<int:battle_id>/entries', methods=['GET'])
def get_entries(battle_id):
    entries = BattleEntry.query.filter_by(battle_id=battle_id).order_by(BattleEntry.votes.desc()).all()
    return jsonify([e.to_dict() for e in entries]), 200