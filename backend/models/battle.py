from extensions import db
from datetime import datetime

class Battle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    creator = db.relationship('User', backref='battles')
    entries = db.relationship('BattleEntry', backref='battle')

    def is_active(self):
        return datetime.utcnow() < self.expires_at

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'creator_id': self.creator_id,
            'creator': self.creator.username,
            'expires_at': self.expires_at.isoformat(),
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active(),
            'entry_count': len(self.entries)
        }

class BattleEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    battle_id = db.Column(db.Integer, db.ForeignKey('battle.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(500), nullable=False)
    votes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    author = db.relationship('User', backref='battle_entries')

    def to_dict(self):
        return {
            'id': self.id,
            'battle_id': self.battle_id,
            'user_id': self.user_id,
            'author': self.author.username,
            'content': self.content,
            'votes': self.votes,
            'created_at': self.created_at.isoformat()
        }