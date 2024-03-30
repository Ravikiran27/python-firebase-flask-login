import pyrebase
import json
import google.generativeai as genai

from flask import Flask, flash, redirect, render_template, request, session, abort, url_for

app = Flask(__name__)       #Initialze flask constructor
"""
At the command line, only need to run once to install the package via pip:

$ pip install google-generativeai
"""


genai.configure(api_key="AIzaSyDTNduHPt5ypwwClXUyU-ygvuTle1Tmjwk")

# Set up the model
generation_config = {
  "temperature": 0.9,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  },
]

model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                              generation_config=generation_config,
                              safety_settings=safety_settings)

convo = model.start_chat(history=[
])

convo.send_message("YOUR_USER_INPUT")
print(convo.last.text)
# genai.configure(api_key="AIzaSyBpMgC7mTLkBrpKj1wwvFOAFfKdUyGECAk")
# model = genai.GenerativeModel('gemini-pro')
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
@app.route("/register", methods = ["POST", "GET"])
def register():
    if request.method == "POST":        #Only if data has been posted
        email = request.form['email']
        password = request.form['pass']
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
            return redirect(url_for('signup'))

    else:
        if person["is_logged_in"] == True:
            return redirect(url_for('welcome'))
        else:
            return redirect(url_for('signup'))

@app.route("/generate", methods = ["POST", "GET"])
def generate():
    if request.method == "POST":  # Only if data has been posted
        sender_name = request.form['senderName']
        sender_email = request.form['senderEmail']
        recipient_email = request.form['recipientEmail']
        email_subject = request.form['emailSubject']
        email_content = request.form['emailContent']
        payload = f"senderName={sender_name}&senderEmail={sender_email}&recipientEmail={recipient_email}&emailSubject={email_subject}&emailContent={email_content}"

        # topic = request.form['topic']
        convo.send_message(payload)
        result=convo.last.text
        output = {
        "senderName": sender_name,
        "senderEmail":sender_email,
        "recipientEmail": recipient_email,
        "date": "March 30, 2024",
        "emailSubject": email_subject,
        "emailContent": result
    }
        return render_template('result.html', output=output)
    


@app.route('/admin')


def index():
    # Replace 'https://example.com' with the desired URL
    return redirect('https://console.firebase.google.com/u/0/project/authenticate-4f223/authentication/users')
if __name__ == "__main__":
    app.run(debug=True)
# write a leave application for college HOD Rajkumar write a email to college for asking leave due to feaver for 3 days