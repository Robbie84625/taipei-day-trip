from flask import Blueprint, request, Response, json
from mysql.connector import pooling


attraction_blueprint = Blueprint('attraction', __name__)


db_config= {
    "user": "root",
    "password": "123456789",
    "host": "localhost",
    "database": "taipei_trip_db"
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **db_config)


@attraction_blueprint.route("/api/attractions")
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
	
@attraction_blueprint.route("/api/attraction/<attractionId>")
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