from flask import Blueprint, request,jsonify 
import requests
from mysql.connector import pooling
from datetime import datetime
import jwt

order_blueprint = Blueprint('order', __name__)

db_config= {
    "user": "root",
    "password": "123456789",
    "host": "localhost",
    "database": "taipei_trip_db"
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **db_config)

with open('./data/jwt_secret_key.txt', 'r') as file:
    jwt_secret_key = file.read().strip()

@order_blueprint.route("/api/orders", methods=['POST'])
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
        number, contratName, email, phone, memberId, attractionId, date, time, price,status
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
	"""
	values = (orderNumber,data['order']['contact']['name'],data['order']['contact']['email'],data['order']['contact']['phone']
		,decoded_data['data']['id'],data['order']['trip']['attraction']['id'],data['order']['trip']['date']
		,data['order']['trip']['time'],data['order']['price'],'未付款')
	
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
			cursor.execute("UPDATE Transactions SET status = '已付款'WHERE number = %s", (orderNumber,))

			cursor.execute("DELETE FROM booking WHERE  memberId = %s", (decoded_data['data']['id'],))
			connection.commit()
			cursor.close()
			connection.close()

			return jsonify({'data': {'number':orderNumber,'payment':{'status':PaymentStatus,'message':PaymentMessage}}}), 200
		else:
			return jsonify({'error':True,'message':'訂單建立失敗，輸入不正確或其他原因'}), 400

	except Exception as e:
		return jsonify({'error':True,'message':str(e)}), 400
