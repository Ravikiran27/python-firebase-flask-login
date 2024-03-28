import pyrebase
import google.generativeai as genai
from flask import Flask, flash, redirect, render_template, request, session, abort, url_for
import pathlib
import textwrap
import json
def to_markdown(text):
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))
app = Flask(__name__)       #Initialze flask constructor
genai.configure(api_key="AIzaSyDZjOAMDI8lMGqakB53gMEiU9pmch1-yUk")
model = genai.GenerativeModel('gemini-pro')
#Add your own details
Config = {
  'apiKey': "AIzaSyCOuXlwI_HTo9vHLFXJ3FHbzYhKssd78oE",
  'authDomain': "authenticate-4f223.firebaseapp.com",
  'projectId': "authenticate-4f223",
  'storageBucket': "authenticate-4f223.appspot.com",
  'messagingSenderId': "927792559739",
  'appId': "1:927792559739:web:8bf06a9c73fbd8ab4594de",
  'measurementId': "G-ZHWBF3KP1T",
  'databaseURL':""
}

#initialize firebase
firebase = pyrebase.initialize_app(Config)
auth = firebase.auth()
db = firebase.database()

#Initialze person as dictionary
person = {"is_logged_in": False, "name": "", "email": "", "uid": ""}

#Login
@app.route("/")
def landing():
    return render_template("landing.html")
@app.route("/login")
def login():
    return render_template("login.html")

#Sign up/ Register
@app.route("/signup")
def signup():
    return render_template("signup.html")

#Welcome page
@app.route("/welcome")
def welcome():
    if person["is_logged_in"] == True:
        return render_template("welcome.html", email = person["email"], name = person["name"])
    else:
        return redirect(url_for('login'))

#If someone clicks on login, they are redirected to /result
@app.route("/result", methods = ["POST", "GET"])
def result():
    if request.method == "POST":        #Only if data has been posted
        email = request.form['email']
        password = request.form['pass']
        try:
            #Try signing in the user with the given information
            user = auth.sign_in_with_email_and_password(email, password)
            iser_info=auth.sign_in_with_email_and_password(email,password)
            return render_template('welcome.html')
        except:
            #If there is any error, redirect back to login
            return redirect(url_for('login'))
    else:
        if person["is_logged_in"] == True:
            return redirect(url_for('welcome'))
        else:
            return redirect(url_for('login'))
#If someone clicks on register, they are redirected to /register
@app.route("/create", methods = ["POST", "GET"])
def register():
    if request.method == "POST":        #Only listen to POST
        result = request.form           #Get the data submitted
        email = result["email"]
        password = result["pass"]
        name = result["name"]
        try:
            #Try creating the user account using the provided data
            auth.create_user_with_email_and_password(email, password)
            #Login the user
            user = auth.sign_in_with_email_and_password(email, password)
            #Add data to global person
            global person
            person["is_logged_in"] = True
            person["email"] = user["email"]
            person["uid"] = user["localId"]
            person["name"] = name
            #Append data to the firebase realtime database
            data = {"name": name, "email": email}
            db.child("users").child(person["uid"]).set(data)
            #Go to welcome page
            return redirect(url_for('welcome'))
        except:
            #If there is any error, redirect to register
            return redirect(url_for('register'))

    else:
        if person["is_logged_in"] == True:
            return redirect(url_for('welcome'))
        else:
            return redirect(url_for('register'))
@app.route("/generate", methods = ["POST", "GET"])
# def get_response():
#     # ... (Your code to send a request to the Gemini API)
#     if request.method == "POST":        #Only if data has been posted
#         topic = request.form['topic']
#         response_data = model.generate_content(topic)
        
#     # Identify the key holding the generated text
#     # if 'generated_text' in response_data:
#     #     extracted_text = response_data['generated_text']
#     # elif 'response' in response_data:
#     #     extracted_text = response_data['response']
#     if 'content' in response_data:  # Add other potential key checks
#         extracted_text1 = response_data['content']
#     else:
#         extracted_text2= response_data
#     return render_template('result.html',output=extracted_text1)
   

def generate():
    if request.method == "POST":        #Only if data has been posted
        topic = request.form['topic']
        response1 = model.generate_content(topic)
        response=extract_resignation_letter(response1)
        return render_template('result.html',output=response1)


def extract_resignation_letter(response_data):
  # Check if response data has the expected structure
  if not response_data or not isinstance(response_data, dict):
    return None

  # Access the candidates list and content details
  try:
    candidates = response_data['result']['candidates']
    content = candidates[0]['content']['parts'][0]['text']
  except (KeyError, IndexError):
    return None

  return content

# Example usage (assuming you have the response data in a variable)


if __name__ == "__main__":
    app.run(debug=True)
