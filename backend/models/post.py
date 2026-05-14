from extensions import db
from datetime import datetime

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=True)
    video_url = db.Column(db.String(500), nullable=True)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    post_type = db.Column(db.String(20), default='text')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=True)
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    author = db.relationship('User', backref='posts')
    replies = db.relationship('Post', backref=db.backref('parent', remote_side=[id]))

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'video_url': self.video_url,
            'thumbnail_url': self.thumbnail_url,
            'post_type': self.post_type,
            'user_id': self.user_id,
            'parent_id': self.parent_id,
            'author': self.author.username,
            'likes': self.likes,
            'created_at': self.created_at.isoformat(),
            'replies': [reply.to_dict() for reply in self.replies]
        }