"""Models and database functions for GeoCriminal project."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


##############################################################################
# Model definitions

class Incident(db.Model):
    """Incident from report"""

    __tablename__ = "incidents"

    incident_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    date_time = db.Column(db.DateTime, nullable=True)
    category = db.Column(db.String, nullable=True)
    subcategory = db.Column(db.String, nullable=True)
    description = db.Column(db.String, nullable=True)
    resolution = db.Column(db.String, nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return f'''<Incident id={self.incident_id}
                    date_time={self.date_time}
                    category={self.category}
                    latitude={self.latitude}
                    longitude={self.longitude}'''



##############################################################################
# Helper functions

def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use our PstgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///incidents'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


if __name__ == "__main__":

    from server import app
    connect_to_db(app)
    print("Connected to DB.")
