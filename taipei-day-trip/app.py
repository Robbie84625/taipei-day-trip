from flask import *
from mysql.connector import pooling
import json
import math
import jwt
from datetime import datetime,timedelta
import requests

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

app.static_folder = 'static'

db_config= {
    "user": "root",
    "password": "123456789",
    "host": "localhost",
    "database": "taipei_trip_db"
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **db_config)

@app.route("/api/attractions")
def attractions():
	page = request.args.get("page", 0, type=int)
	keyword=request.args.get("keyword",None)
	try:
		connection = connection_pool.get_connection()
		cursor = connection.cursor(dictionary=True)
		query_data = """
			SELECT attraction.id,attraction.name,attraction.category,attraction.description,attraction.address,attraction.transport,mrt.mrt,attraction.lat,attraction.lng,(
			SELECT JSON_ARRAYAGG(images)
			FROM attraction_image
			WHERE attraction_image.attraction_id = attraction.id
			) AS images
			FROM attraction
			INNER JOIN located ON attraction.id = located.attraction_id
			INNER JOIN mrt ON located.mrt_id = mrt.id
		""" 

		if keyword:
			cursor.execute( f"{query_data} WHERE attraction.name LIKE %s OR mrt.mrt= %s ORDER BY attraction.id LIMIT %s , %s ;", (f"%{keyword}%",keyword,page*12,13))
			results = cursor.fetchall()
			for item in results[:12]:
				item['images'] = json.loads(item['images'])

			if len(results)<13:
				next_page=None
			else:
				next_page=page+1			
			
		else:
			cursor.execute( f"{query_data} ORDER BY attraction.id LIMIT %s , %s ;", (page*12,13))
			results = cursor.fetchall()
			for item in results[:12]:
				item['images'] = json.loads(item['images'])
			
			if len(results)<13:
				next_page=None
			else:
				next_page=page+1
		
		response_data = Response(json.dumps({
			"data": results[:12] ,
			"nextPage": next_page
		}, ensure_ascii=False), content_type='application/json; charset=utf-8')

		cursor.close()
		connection.close()

		return response_data

	except Exception as e:
		error_message = "An error occurred: " + str(e)
		response_data = {"error": error_message}
		response_json = json.dumps(response_data, ensure_ascii=False)
		response = Response(response_json, content_type='application/json; charset=utf-8', status=500)
		return response
	
@app.route("/api/mrts")
def mrts():
	try:
		connection = connection_pool.get_connection()
		cursor = connection.cursor(dictionary=True)
		query_data="""
			SELECT mrt.mrt
    		FROM mrt
    		INNER JOIN located ON located.mrt_id = mrt.id
    		GROUP BY located.mrt_id
    		ORDER BY COUNT(located.attraction_id) DESC
    		LIMIT 40
		"""
		cursor.execute( f"{query_data}")
		results = cursor.fetchall()

		response_data = Response(json.dumps({"data": [item["mrt"] for item in results]}, ensure_ascii=False), content_type='application/json; charset=utf-8')

		cursor.close()
		connection.close()

		return response_data

	except Exception as e:
		error_message = "An error occurred: " + str(e)
		response_data = {"error": error_message}
		response_json = json.dumps(response_data, ensure_ascii=False)
		response = Response(response_json, content_type='application/json; charset=utf-8', status=500)
		return response

@app.route("/api/attraction/<attractionId>")
def get_attraction(attractionId):
	try:
		if not attractionId.isdigit():
			raise Exception("Incorrect input, please enter a number")
		else:
			attractionId=int(attractionId)

		connection = connection_pool.get_connection()
		cursor = connection.cursor(dictionary=True)
		query_data = """
			SELECT attraction.id,attraction.name,attraction.category,attraction.description,attraction.address,attraction.transport,mrt.mrt,attraction.lat,attraction.lng,(
			SELECT JSON_ARRAYAGG(images)
			FROM attraction_image
			WHERE attraction_image.attraction_id = attraction.id
			) AS images
			FROM attraction
			INNER JOIN located ON attraction.id = located.attraction_id
			INNER JOIN mrt ON located.mrt_id = mrt.id
		""" 
		cursor.execute( f"{query_data} WHERE attraction.id=%s",(attractionId,))
		result = cursor.fetchone()

		if result is None:
			raise Exception("Attraction id  is not exist")

		result['images'] = json.loads(result['images'])

		response_data = Response(json.dumps({
			"data": result ,
		}, ensure_ascii=False), content_type='application/json; charset=utf-8')

		cursor.close()
		connection.close()

		return response_data


	except Exception as e:
		error_message = "An error occurred: " + str(e)
		response_data = {"error": error_message}
		response_json = json.dumps(response_data, ensure_ascii=False)
		response = Response(response_json, content_type='application/json; charset=utf-8', status=500)
		return response

with open('./data/jwt_secret_key.txt', 'r') as file:
    jwt_secret_key = file.read().strip()


@app.route("/api/user/auth",methods=['PUT'])
def signIn():
	try:
		data = request.get_json()
		
		with connection_pool.get_connection() as connection:
			with connection.cursor(dictionary=True) as cursor:
				cursor.execute("SELECT * FROM member WHERE email=%s AND password=%s", (data['email'], data['password']))
				result = cursor.fetchone()

		if result!=None:
			expiration_time = datetime.utcnow() + timedelta(days=7)
			encoded_jwt = jwt.encode({"data": result, "exp": expiration_time}, jwt_secret_key, algorithm="HS256")
			encoded_jwt = jwt.encode({"data": result}, "secret", algorithm="HS256")
			return jsonify({"token": encoded_jwt}), 200
		else:
			return jsonify({"error": True,"message": "帳號密碼錯誤"}), 400
	
	except Exception as e:
		error_message = "An error occurred: {}".format(e)
		return jsonify({"error": True,"message":error_message}), 500

@app.route("/api/user/auth", methods=['GET'])
def checkSignIn():
    authorization_header = request.headers.get('Authorization')
    if not authorization_header:
        return jsonify({'message': '未登入'}), 405

    jwt_token = authorization_header.replace('Bearer ', '')

    try:
        decoded_data = jwt.decode(jwt_token, jwt_secret_key, algorithms="HS256")
        jwtData = {'data': decoded_data['data']}
		
        return jsonify(jwtData), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'message': '令牌過期'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': '無效的令牌'}), 401
    except Exception as e:
        return jsonify({'message': '解碼失敗', 'error': str(e)}), 500

@app.route("/api/user",methods=['POST'])
def SignUp():
	data = request.get_json()
	connection = connection_pool.get_connection()
	cursor = connection.cursor(dictionary=True)
	cursor.execute("SELECT email FROM member WHERE email=%s",(data['email'],))
	result = cursor.fetchone()

	cursor.close()
	connection.close()
	

	if result!=None:
		return jsonify({"error": True, "message": "註冊失敗，重複的 Email 或其他原因"}), 400
	else:
		connection = connection_pool.get_connection()
		cursor = connection.cursor(dictionary=True)
		cursor.execute("INSERT INTO member(name, email, password) VALUES (%s, %s, %s)", (data['name'], data['email'], data['password']))
		connection.commit()
		cursor.close()
		connection.close()
		return jsonify({"ok": True}), 200
	
@app.route("/api/booking", methods=['POST'])
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

@app.route("/api/booking", methods=['GET'])
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
	
@app.route("/api/booking", methods=['DELETE'])
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



@app.route("/api/orders", methods=['POST'])
def orders():
	authorization_header = request.headers.get('Authorization')
	if not authorization_header:
		return jsonify({'message': '未登入'}), 403
		
	jwt_token = authorization_header.replace('Bearer ', '')
	
	decoded_data = jwt.decode(jwt_token, jwt_secret_key, algorithms="HS256")
	
	# insert into to database
	connection = connection_pool.get_connection()
	cursor = connection.cursor(dictionary=True)
	cursor.execute("SELECT MAX(number) AS max_number FROM Transactions;")
	
	lastNumber = cursor.fetchone()
	print(lastNumber)
	todayDate = datetime.today().date().strftime('%Y%m%d')
	if lastNumber["max_number"]!=None:
		lastDate = lastNumber["max_number"][:8]
		counter= int(lastNumber["max_number"][-3:])
	else:
		lastDate=todayDate
		counter=0
	

	if lastDate!=todayDate:
		counter = 0
	else:
		counter=counter+1
		
	orderNumber = f'{todayDate}{str(counter).zfill(3)}'

	data = request.get_json()
	
	
	query_data = """
    INSERT INTO Transactions (
        number, contratName, email, phone, memberId, attractionId, date, time, price
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
	"""
	values = (orderNumber,data['order']['contact']['name'],data['order']['contact']['email'],data['order']['contact']['phone']
		,decoded_data['data']['id'],data['order']['trip']['attraction']['id'],data['order']['trip']['date']
		,data['order']['trip']['time'],data['order']['price'])
	
	cursor.execute(query_data, values)

	connection.commit()
	cursor.close()
	connection.close()
	
	# send to tapPay server
	tapPay = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
	headers = {
        'Content-Type': 'application/json',
		'x-api-key': 'partner_8mWHkLDW2GHjZt0wdjhCXSRaSYk08znCMZGpAPoTFsW3mP2XzGBBMcWM'
    }
	order_data={
		"prime": data['prime'],
		"partner_key": 'partner_8mWHkLDW2GHjZt0wdjhCXSRaSYk08znCMZGpAPoTFsW3mP2XzGBBMcWM',
		"merchant_id": "loby84625_CTBC",
		"details":"TapPay Test",
		"amount": data['order']['price'],
		"cardholder": {
			"phone_number": data['order']['contact']['phone'],
			"name": data['order']['contact']['name'],
			"email": data['order']['contact']['email'],
		},
	}
	try:
		response = requests.post(tapPay, headers=headers, json=order_data)

		if response.status_code == 200:
			Payment = response.json()
			PaymentStatus=Payment['status']
			if Payment['msg']=='Success':
				PaymentMessage='付款成功'

			connection = connection_pool.get_connection()
			cursor = connection.cursor(dictionary=True)
			cursor.execute("DELETE FROM booking WHERE  memberId = %s", (decoded_data['data']['id'],))
			connection.commit()
			cursor.close()
			connection.close()

			return jsonify({'data': {'number':orderNumber,'payment':{'status':PaymentStatus,'message':PaymentMessage}}}), 200
		else:
			return jsonify({'error':True,'message':'訂單建立失敗，輸入不正確或其他原因'}), 400

	except Exception as e:
		return jsonify({'error':True,'message':str(e)}), 400

# 請勿更動
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

app.run(host='0.0.0.0', port=3000)