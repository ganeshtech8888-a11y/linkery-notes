import os 
from flask import Flask, render_template,
request, redirect, url_for, flash
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)
# Secret key for flash messages
app.secret_key = "notes_pro_secret_key"

# Vercel Environment Variable for MongoDB
app.config["MONGO_URI"] = 
os.environ.get("MONGODB_URI")
mongo = PyMongo(app)
# Vercel needs this specific variable name to find the app
app = app
@app.route('/')
def index():
  # Fetching all notes/memos from MongoDB    
  memos = 
  mongo.db.memos.find().sort("date_created", -
                             1)    
  return render_template('index.html', 
                         memos=memos)
@app.route('/add', methods=['POST'])
def add_memo():
  content = request.form.get('content')
  if content:       
    mongo.db.memos.insert_one({
      'content': content,
      'date_created': datetime.utcnow()
     })
    flash("Note added successfully!")
    return redirect(url_for('index'))
@app.route('/delete/<id>', methods=['POST'])
def delete_memo(id):   
  mongo.db.memos.delete_one({'_id': 
                             ObjectId(id)})
  flash("Note deleted.")
  return redirect(url_for('index'))
  if __name__ == "__main__":.    
  app.run(debug=True)
