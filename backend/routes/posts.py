from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.post import Post
from models.user import User

posts = Blueprint('posts', __name__)

# Create a post or reply
@posts.route('/', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    user_id = get_jwt_identity()

    post = Post(
        content=data['content'],
        user_id=user_id,
        parent_id=data.get('parent_id')
    )

    db.session.add(post)

    # Award ripple energy for posting
    user = User.query.get(user_id)
    user.ripple_energy += 10

    db.session.commit()

    return jsonify(post.to_dict()), 201

# Get all top level posts (the main feed)
@posts.route('/', methods=['GET'])
def get_posts():
    posts_list = Post.query.filter_by(parent_id=None).order_by(Post.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts_list]), 200

# Get a single post and its full chain
@posts.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict()), 200