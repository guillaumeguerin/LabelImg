from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route("/")
def hello():
    return render_template('index.html')

@app.route("/label")
def label():
    image = request.args.get('image')
    return render_template('label.html')
