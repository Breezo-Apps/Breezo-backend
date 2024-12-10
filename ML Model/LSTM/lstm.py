from flask import Flask, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Input
from sklearn.preprocessing import MinMaxScaler
from sqlalchemy import create_engine
from datetime import datetime, timedelta

app = Flask(__name__)

def fetch_data_from_mysql():
  db_user = 'root'
  db_password = ''
  db_host = 'localhost'
  db_name = 'brezzo'
  
  connection_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
  engine = create_engine(connection_url)

  query = "SELECT * FROM aqi_daily"
  df = pd.read_sql(query, con=engine)

  return df

data = fetch_data_from_mysql()
data['date'] = pd.to_datetime(data['date'])

features = data[['co', 'no2', 'o3', 'so2', 'pm2_5', 'pm10']].values
targets = data[['co', 'no2', 'o3', 'so2', 'pm2_5', 'pm10']].values

scaler = MinMaxScaler()
features_scaled = scaler.fit_transform(features)
targets_scaled = scaler.fit_transform(targets)

time_steps = 1
X, y = [], []

for i in range(len(features_scaled) - time_steps):
  X.append(features_scaled[i:i + time_steps])
  y.append(targets_scaled[i + time_steps])

X, y = np.array(X), np.array(y)

train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

model = Sequential([
  Input(shape=(time_steps, X.shape[2])),
  LSTM(128, return_sequences=True),
  LSTM(64, return_sequences=False),
  Dense(64, activation='relu'),
  Dense(6)
])

model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
model.fit(X_train, y_train, epochs=5, batch_size=16, verbose=1)


@app.route('/')
def home():
  return "Welcome to the Flask LSTM Prediction API!"

@app.route('/predict', methods=['GET'])
def predict():
  data = fetch_data_from_mysql()
  data['date'] = pd.to_datetime(data['date'])
  
  features = data[['co', 'no2', 'o3', 'so2', 'pm2_5', 'pm10']].values
  features_scaled = scaler.transform(features)
  
  last_known_data = features_scaled[-time_steps:].reshape(1, time_steps, -1)
  
  response = {
    "data": []
  }
  
  current_time = datetime.now()
  
  if current_time.minute >= 30: 
    current_time = current_time.replace(hour=current_time.hour + 1, minute=0, second=0, microsecond=0)
  else:
    current_time = current_time.replace(minute=0, second=0, microsecond=0)

  end_time = current_time + timedelta(hours=24)
  
  while current_time < end_time:
    predictions_scaled = model.predict(last_known_data)
    predictions = scaler.inverse_transform(predictions_scaled).flatten().tolist()
    
    prediction_details = [
      {"polutant_type": pollutant, "concentrate": f"{value:.2f}"}
      for pollutant, value in zip(['co', 'no2', 'o3', 'so2', 'pm2_5', 'pm10'], predictions)
    ]
    
    response["data"].append({
      "date": current_time.strftime("%d/%m/%Y"),
      "time": current_time.strftime("%H:%M"),
      "detail": prediction_details
    })
    
    current_time += timedelta(hours=1)
    last_known_data = np.roll(last_known_data, -1, axis=1)
    last_known_data[0, -1] = predictions_scaled
  
  return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)
