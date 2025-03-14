from flask import Flask, render_template_string
import os

app = Flask(__name__)

@app.route('/')
def home():
    hostname = os.uname().nodename  # Gets the container's hostname at runtime
    with open('index.html', 'r') as file:
        html = file.read()
    return render_template_string(html, hostname=hostname)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
