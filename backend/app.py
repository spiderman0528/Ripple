from flask import Flask
from flask_cors import CORS
from extensions import db, jwt

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ripple.db'
app.config['JWT_SECRET_KEY'] = 'ripple-secret-key-change-this-later'

db.init_app(app)
jwt.init_app(app)
CORS(app)

from routes.auth import auth
app.register_blueprint(auth, url_prefix='/auth')

with app.app_context():
    from models.user import User
    db.create_all()

@app.route('/')
def home():
    return {'message': 'Ripple backend is running!'}

if __name__ == '__main__':
    app.run(debug=True)