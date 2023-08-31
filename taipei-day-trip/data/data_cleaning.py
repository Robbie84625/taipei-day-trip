import json
import pandas as pd
import re
from mysql.connector import pooling

data=pd.read_json('taipei-attractions.json')

db_config= {
    "user": "root",
    "password": "123456789",
    "host": "localhost",
    "database": "taipei_trip_db"
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **db_config)

connection = connection_pool.get_connection()
cursor = connection.cursor(dictionary=True)

for item in data['result']['results']:
    cursor.execute("INSERT INTO  attraction (name,category,description,address,transport,latitude,longitude) VALUES (%s, %s, %s, %s, %s, %s, %s)",(item['name'],item['CAT'],item['description'],item['address'],item['direction'],item['latitude'],item['longitude']))
    attraction_id = cursor.lastrowid
    if item['MRT']!=None:
        cursor.execute("SELECT id FROM mrt WHERE station_name = %s", (item['MRT'],))
        existing_mrt = cursor.fetchone()
        if existing_mrt:
            mrt_id = existing_mrt['id']
        else:
            cursor.execute("INSERT INTO  mrt (station_name) VALUES (%s)",(item['MRT'],))
            mrt_id = cursor.lastrowid
        cursor.execute("INSERT INTO located (attraction_id, mrt_id) VALUES (%s, %s)", (attraction_id, mrt_id))


    urls = re.findall(r'https?://[^\s]*?\.(?:jpg|png|JPG|PNG)', item['file'], re.IGNORECASE)
    for img in urls:
        cursor.execute("INSERT INTO  attraction_image (attraction_id,image_url) VALUES (%s, %s)",(attraction_id,img))
    

connection.commit()
cursor.close()
connection.close()

