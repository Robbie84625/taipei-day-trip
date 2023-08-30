from flask import *
from mysql.connector import pooling
import json
import math

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

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
			) AS img
			FROM attraction
			INNER JOIN located ON attraction.id = located.attraction_id
			INNER JOIN mrt ON located.mrt_id = mrt.id
		""" 
		query_count= """
			SELECT COUNT(attraction.id) 
			FROM attraction
		"""
		if keyword:
			cursor.execute( f"{query_data} WHERE attraction.name LIKE %s OR mrt.mrt= %s ORDER BY attraction.id LIMIT %s , %s ;", (f"%{keyword}%",keyword,page*12,12))
			results = cursor.fetchall()
			for item in results:
				item['img'] = json.loads(item['img'])

			cursor.execute(f"{query_count} WHERE attraction.name LIKE %s ;",(f"%{keyword}%",))
			total= cursor.fetchone()
			
			
		else:
			cursor.execute( f"{query_data} ORDER BY attraction.id LIMIT %s , %s ;", (page*12,12))
			results = cursor.fetchall()
			for item in results:
				item['img'] = json.loads(item['img'])

			cursor.execute(f"{query_count}")
			total= cursor.fetchone()
			
				
		remain=total['COUNT(attraction.id)']-((page*12)+12)
		next_page=math.ceil(remain/12)

		next_page = next_page if next_page > 0 else None

		
		response_data = Response(json.dumps({
			"data": results ,
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
			) AS img
			FROM attraction
			INNER JOIN located ON attraction.id = located.attraction_id
			INNER JOIN mrt ON located.mrt_id = mrt.id
		""" 
		cursor.execute( f"{query_data} WHERE attraction.id=%s",(attractionId,))
		result = cursor.fetchone()

		if result is None:
			raise Exception("Attraction id  is not exist")

		result['img'] = json.loads(result['img'])

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
	
	except ValueError as e:
		error_message = "An error occurred: " + str(e)
		response_data = {"error": error_message}
		response_json = json.dumps(response_data, ensure_ascii=False)
		response = Response(response_json, content_type='application/json; charset=utf-8', status=404)
		return response
	

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

app.run(host="0.0.0.0", port=3000)