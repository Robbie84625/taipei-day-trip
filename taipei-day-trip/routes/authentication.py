from flask import Blueprint, request,jsonify
from mysql.connector import pooling
import jwt
from datetime import datetime,timedelta

authentication_blueprint = Blueprint('authentication', __name__)

db_config= {
    "user": "root",
    "password": "123456789",
    "host": "localhost",
    "database": "taipei_trip_db"
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **db_config)

with open('./data/jwt_secret_key.txt', 'r') as file:
    jwt_secret_key = file.read().strip()

@authentication_blueprint.route("/api/user/auth",methods=['PUT'])
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

@authentication_blueprint.route("/api/user/auth", methods=['GET'])
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

@authentication_blueprint.route("/api/user",methods=['POST'])
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