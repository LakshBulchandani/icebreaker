import csv
import random
import datetime
import re
from itertools import product
import warnings
import pandas as pd
#import numpy
import streamlit as st
from pymongo import MongoClient

warnings.filterwarnings('ignore')

#st.set_page_config(layout="wide")

client = MongoClient("mongodb://localhost:27017/")
db = client.Ice
collection_user_ratings = db.User_Ratings
collection_event_types = db.Event_Types
collection_user_names = db.User_Names

# Load dataset
documents_user_ratings = collection_user_ratings.find()
df = pd.DataFrame(documents_user_ratings)

# Calculate user-event matrix  
user_event_matrix = df.pivot_table(index='user_id', columns='event_id', values='rating')
event_user_matrix = df.pivot_table(index='event_id', columns='user_id', values='rating')

# User-based recommendations
def user_based_recommendations(user_id):

  # Get user's ratings
  ratings = user_event_matrix.loc[user_id]  

  # Calculate similarity with other users
  similarities = user_event_matrix.corrwith(ratings)  

  # Filter for similar users  
  similar_users = similarities[similarities>0]  

  # Get top events rated by similar users
  recommendations = similar_users.sort_values(ascending=False)[:20]

  return recommendations

# Item-based recommendations
def item_based_recommendations(event_id):

  # Get ratings for event
  ratings = user_event_matrix[event_id]

  # Calculate similarities to other events
  similarities = event_user_matrix.corrwith(ratings)  

  # Filter similar events
  similar_events = similarities[similarities>0]

  # Get top recommendations  
  recommendations = similar_events.sort_values(ascending=False)[:5]

  return recommendations

# Example usage
#print(user_based_recommendations(1))
print()
print(item_based_recommendations(1))

arr = user_based_recommendations(1001)

for index in arr.index:
  print(f'{index} {arr[index]}')

name = collection_user_names.find_one({"name": re.compile('^' + re.escape("scott thompson") + '$', re.IGNORECASE)},{"user_id": 1, "name": 1})

print(name["user_id"])

#st.title("Recommended Events")

text_input = st.text_input(
  "Enter Name",
  #label_visibility=st.session_state.visibility,
  #disabled=st.session_state.disabled,
  #placeholder=st.session_state.placeholder,
    )

if text_input:
  user = collection_user_names.find_one({"name": re.compile('^' + re.escape(text_input) + '$', re.IGNORECASE)},{"user_id": 1, "name": 1})
  if user:
    user_recommend = user_based_recommendations(user["user_id"])
    col1, col2 = st.columns(2)
    with col1:
      st.write("Event Name")
    with col2:
      st.write("Match Percent")
    for index in user_recommend.index:
      get_event = collection_event_types.find_one({"event_id": index},{"event_id": 1, "event_name": 1, "event_image": 1})
      percentMatch = round(user_recommend[index] * 100)

      with col1:
        st.write(get_event["event_name"], get_event["event_image"])
      with col2:
        st.write(percentMatch)
  else:
    st.write("User Not Found... Creating new User ID")
    max_cur = collection_user_names.find().sort({"user_id": -1}).limit(1)
    for doc in max_cur:
      max_user_id = doc["user_id"] + 1
    st.write("Assigning New User ID: ", max_user_id)
    st.title("Enter Ratings for Event Types")
    events_cur = collection_event_types.find()
    for doc in events_cur:
      rating = st.slider(label=doc["event_name"], min_value=1, max_value=5, step=1)
      filter = {"user_id": max_user_id, "event_id": doc["event_id"]}
      updateDoc = {"$set": {"user_id": max_user_id, "event_id": doc["event_id"], "rating": rating}}
      add_rating = collection_user_ratings.update_one(filter, updateDoc, upsert=True)

    filter = {"name": text_input}
    updateDoc = { "$set": {"user_id": max_user_id, "name": text_input} }
    if st.button(label="Submit"):
      add_user = collection_user_names.update_one(filter, updateDoc, upsert=True)
  
    
#st.dataframe(event_user_matrix)

