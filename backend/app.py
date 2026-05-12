from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
from datetime import timedelta

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ripple.db'
app.config['JWT_SECRET_KEY'] = 'ripple-secret-key-change-this-later'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

db.init_app(app)
jwt.init_app(app)
CORS(app)

from routes.auth import auth
from routes.posts import posts
from routes.groups import groups
from routes.battles import battles
from routes.leaderboard import leaderboard

app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(posts, url_prefix='/posts')
app.register_blueprint(groups, url_prefix='/groups')
app.register_blueprint(battles, url_prefix='/battles')
app.register_blueprint(leaderboard, url_prefix='/leaderboard')

with app.app_context():
    from models.user import User
    from models.post import Post
    from models.group import Group
    from models.battle import Battle, BattleEntry
    db.create_all()

@app.route('/')
def home():
    return {'message': 'Ripple backend is running!'}

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)