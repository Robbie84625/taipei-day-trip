import json
import pandas as pd

data=pd.read_json('taipei-attractions.json')

for item in data['result']['results']:
    print(item['name'])
    