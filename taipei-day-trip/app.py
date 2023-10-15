from flask import Flask, render_template

from routes.mrts import mrts_blueprint
from routes.attraction import attraction_blueprint
from routes.authentication import authentication_blueprint
from routes.booking import booking_blueprint
from routes.order import order_blueprint

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

app.static_folder = 'static'


app.register_blueprint(mrts_blueprint)
app.register_blueprint(attraction_blueprint)
app.register_blueprint(authentication_blueprint)
app.register_blueprint(booking_blueprint)
app.register_blueprint(order_blueprint)

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