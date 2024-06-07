import csv
import random
import datetime
import re
from itertools import product
import warnings
import pandas as pd
#import numpy as np
from pymongo import MongoClient
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split

warnings.filterwarnings('ignore')

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

X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.33, random_state=42)
