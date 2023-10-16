from flask import Blueprint, request,jsonify, Response, json
from mysql.connector import pooling
import jwt

booking_blueprint = Blueprint('booking', __name__)

db_config= {
    "user": "root",
    "password": "123456789",
    "host": "localhost",
    "database": "taipei_trip_db"
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **db_config)

with open('./data/jwt_secret_key.txt', 'r') as file:
    jwt_secret_key = file.read().strip()

@booking_blueprint.route("/api/booking", methods=['POST'])
def postBooking():
	authorization_header = request.headers.get('Authorization')
	data = request.get_json()
	checkNull = any(value == "" for value in data.values())

	if not authorization_header:
		return jsonify({'message': '未登入'}), 403
	
	if checkNull:
		return jsonify({'error': True, 'message': '不完整的訊息輸入'}), 400

	jwt_token = authorization_header.replace('Bearer ', '')
	
	try:
		decoded_data = jwt.decode(jwt_token, jwt_secret_key, algorithms="HS256")
		connection = connection_pool.get_connection()
		cursor = connection.cursor()

		cursor.execute("SELECT COUNT(*) FROM booking")
		result = cursor.fetchone()

		if result!=0:
			cursor.execute("DELETE FROM booking WHERE  memberId = %s", (decoded_data['data']['id'],))
			connection.commit()
			cursor.execute("INSERT INTO booking(attractionId, memberId, date, time, price) VALUES (%s, %s, %s, %s, %s)", (data['id'], decoded_data['data']['id'], data['date'], data['time'],data['price']))
			connection.commit()
		else:
			cursor.execute("INSERT INTO booking(attractionId, memberId, date, time, price) VALUES (%s, %s, %s, %s, %s)", (data['id'], decoded_data['data']['id'], data['date'], data['time'],data['price']))
			connection.commit()
		cursor.close()
		connection.close()

		return jsonify({'ok': True}), 200
	except Exception as e:

		return jsonify({'error': True, 'message': str(e)}), 500

@booking_blueprint.route("/api/booking", methods=['GET'])
def getBooking():
	connection = connection_pool.get_connection()
	cursor = connection.cursor(dictionary=True)

	query_data = """
		SELECT attraction.id,attraction.name,attraction.address,(SELECT images FROM attraction_image WHERE attraction_image.attraction_id = attraction.id LIMIT 1) AS first_image,
		booking.date,booking.time,booking.price 
		FROM booking
		JOIN attraction ON attraction.id = booking.attractionId;
		""" 
	cursor.execute( f"{query_data}")
	result = cursor.fetchone()

	cursor.close()
	connection.close()

	if result is not None:
		data = {
			"attraction": {
				"id": result['id'],
				"name": result['name'],
				"address": result['address'],
				"image": result['first_image']
			},
			"date": result['date'].strftime('%Y-%m-%d'),
			"time": result['time'],
			"price": float(result['price'])
		}
	else:
		data = None

	response_data = Response(json.dumps({"data": data}, ensure_ascii=False), content_type='application/json; charset=utf-8')

	return response_data
	
@booking_blueprint.route("/api/booking", methods=['DELETE'])
def deleteBooking():
	authorization_header = request.headers.get('Authorization')
	if not authorization_header:
		return jsonify({'message': '未登入'}), 405
	
	jwt_token = authorization_header.replace('Bearer ', '')


	decoded_data = jwt.decode(jwt_token, jwt_secret_key, algorithms="HS256")

	jwt_token = authorization_header.replace('Bearer ', '')
	decoded_data = jwt.decode(jwt_token, jwt_secret_key, algorithms="HS256")
	connection = connection_pool.get_connection()
	cursor = connection.cursor(dictionary=True)
	cursor.execute("DELETE FROM booking WHERE  memberId = %s", (decoded_data['data']['id'],))
	connection.commit()
	cursor.close()
	connection.close()
	return jsonify({'ok': True}), 200