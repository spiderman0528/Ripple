from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.post import Post
from models.user import User
import os
import uuid

posts = Blueprint('posts', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@posts.route('/', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    post_type = request.form.get('post_type', 'text') if request.form else request.get_json().get('post_type', 'text')

    if post_type == 'video':
        if 'video' not in request.files:
            return jsonify({'error': 'No video file'}), 400

        video_file = request.files['video']
        content = request.form.get('content', '')
        parent_id = request.form.get('parent_id')

        filename = f"{uuid.uuid4()}.mp4"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        video_file.save(filepath)

        video_url = f"/uploads/{filename}"

        post = Post(
            content=content,
            video_url=video_url,
            post_type='video',
            user_id=user_id,
            parent_id=parent_id
        )
    else:
        data = request.get_json()
        post = Post(
            content=data['content'],
            post_type='text',
            user_id=user_id,
            parent_id=data.get('parent_id')
        )

    db.session.add(post)

    user = User.query.get(user_id)
    user.ripple_energy += 10

    db.session.commit()

    return jsonify(post.to_dict()), 201

@posts.route('/', methods=['GET'])
def get_posts():
    post_type = request.args.get('type', 'all')
    if post_type == 'video':
        posts_list = Post.query.filter_by(parent_id=None, post_type='video').order_by(Post.created_at.desc()).all()
    else:
        posts_list = Post.query.filter_by(parent_id=None).order_by(Post.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts_list]), 200

@posts.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict()), 200

@posts.route('/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    post = Post.query.get_or_404(post_id)
    post.likes += 1
    user = User.query.get(post.user_id)
    user.ripple_energy += 2
    db.session.commit()
    return jsonify({'likes': post.likes}), 200