from flask import Flask, request
from pymongo import MongoClient
from flask_cors import CORS
app = Flask(__name__)
CORS(app) 
client = MongoClient('mongodb+srv://pawankumars2020:GbKx5buNr0w46flT@cluster0.nrw9sfy.mongodb.net/FULLSTACK')
db = client['testdb1']
collection = db['Coordinates']


@app.route('/api/save_coordinates', methods=['POST'])
def save_coordinates():
    data = request.get_json()
    x = data.get('x')
    y = data.get('y')
    
    # Insert the coordinates into the MongoDB collection
    collection.insert_one({'x': x, 'y': y})
    
    return 'Coordinates saved successfully!'
if __name__ == '__main__':
    app.run()
