"""Utility file to seed ratings database from MovieLens data in seed_data/"""

from sqlalchemy import func
from model import Incident, connect_to_db, db
from server import app
import datetime
import json


def load_incidents():
    """Load incidents from test.json into incidents database."""

    print('Incidents')

    # Delete all rows in table, so if we need to run this a second time,
    # we won't be trying to add duplicate users
    Incident.query.delete()

    file = open('nwbb-fxkq.json').read()
    
    # list of dictionary incidents
    data = json.loads(file)
    
    for incident_dict in data:
        
        date_time = incident_dict.get('incident_datetime')
        category = incident_dict.get('incident_category')
        subcategory = incident_dict.get('incident_subcategory')
        description = incident_dict.get('incident_description')
        resolution = incident_dict.get('resolution')
        latitude = incident_dict.get('latitude')
        longitude = incident_dict.get('longitude')

        incident = Incident(date_time=date_time,
                    category=category,
                    subcategory=subcategory,
                    description=description,
                    resolution=resolution,
                    latitude=latitude,
                    longitude=longitude)

        db.session.add(incident)

    db.session.commit()


if __name__ == "__main__":
    connect_to_db(app)
    db.create_all()
    load_incidents()
