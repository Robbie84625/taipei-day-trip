from flask import Blueprint, request, Response, json
from mysql.connector import pooling


mrts_blueprint = Blueprint('mrts', __name__)

db_config= {
    "user": "root",
    "password": "123456789",
    "host": "localhost",
    "database": "taipei_trip_db"
}
connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **db_config)

@mrts_blueprint.route("/api/mrts")
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