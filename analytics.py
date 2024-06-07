import csv
import random
import datetime
import re
from itertools import product
import warnings
import pandas as pd
import numpy as np
import streamlit as st
from pymongo import MongoClient
import mysql.connector
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from PIL import Image
import matplotlib.pyplot as plt

warnings.filterwarnings('ignore')

st.set_page_config(layout="wide")

client = MongoClient("mongodb://localhost:27017/")
db = client.Ice
collection_user_ratings = db.User_Ratings
collection_event_types = db.Event_Types
collection_user_names = db.User_Names

# Load dataset
documents_user_ratings = collection_user_ratings.find()
df = pd.DataFrame(documents_user_ratings)
barchart = pd.DataFrame(df["event_id"], df["rating"])

user_event_matrix = df.pivot_table(index='user_id', columns='event_id', values='rating')
event_user_matrix = df.pivot_table(index='event_id', columns='user_id', values='rating')

hist = df.hist(bins=20)