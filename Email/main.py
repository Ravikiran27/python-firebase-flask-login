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
@app.route("/Home")
def welcome():
    if person["is_logged_in"] == True:
        return render_template("Home.html", email = person["email"], name = person["name"])
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
            return render_template('Home.html')
        except:
            #If there is any error, redirect back to login
            return redirect(url_for('login'))
    else:
        if person["is_logged_in"] == True:
            return redirect(url_for('Home'))
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
            return redirect(url_for('login'))
        except:
            #If there is any error, redirect to register
            return redirect(url_for('signup'))

    else:
        if person["is_logged_in"] == True:
            return redirect(url_for('Home'))
        else:
            return redirect(url_for('signup'))

@app.route("/rkb", methods = ["POST", "GET"])
def generate():
    if request.method == "POST":  # Only if data has been posted
        your_name = request.form['your_name']
        receiver_name = request.form['name']
        purpose = request.form['purpose']
        email=request.form['email1']
        email1=request.form['email2']
        payload=f"write only body content in paragraph for this email,from  this details,senderName={your_name}&recipientname={receiver_name}&emailpurpose={purpose}"

        # sender_name = request.form['senderName']
        # sender_email = request.form['senderEmail']
        # recipient_email = request.form['recipientEmail']
        # email_subject = request.form['emailSubject']
        # email_content = request.form['emailContent']
        # payload = f"senderName={sender_name}&senderEmail={sender_email}&recipientEmail={recipient_email}&emailSubject={email_subject}&emailContent={email_content}"

        # topic = request.form['topic']
        convo.send_message(payload)
        result=convo.last.text
        output = {
        "senderName": your_name,
        "senderEmail":email1,
        "recipientname":receiver_name,
        "recipientEmail":email,
        "date": "April 04 2024",
        "emailSubject":purpose,
        "emailContent": result
    }
        return render_template('result.html', output=output)
    

@app.route("/BRK", methods = ["POST", "GET"])
def generatereply():
    if request.method == "POST":  # Only if data has been posted
        your_name = request.form['your_name']
        receiver_name = request.form['name']
        purpose = request.form['purpose']
        email=request.form['email1']
        email1=request.form['email2']
        payload=f" this is a reply email write only content for email for this details,senderName={your_name}&recipientname={receiver_name}&email={purpose}"

        # sender_name = request.form['senderName']
        # sender_email = request.form['senderEmail']
        # recipient_email = request.form['recipientEmail']
        # email_subject = request.form['emailSubject']
        # email_content = request.form['emailContent']
        # payload = f"senderName={sender_name}&senderEmail={sender_email}&recipientEmail={recipient_email}&emailSubject={email_subject}&emailContent={email_content}"

        # topic = request.form['topic']
        convo.send_message(payload)
        result=convo.last.text
        output = {
        "senderName": your_name,
        "senderEmail":email,
        "recipientname":receiver_name,
        "recipientEmail":email1,
        "date": "April 04 2024",
        "emailSubject":purpose,
        "emailContent": result
    }
        return render_template('result.html', output=output)
    


# @app.route('/rkb', methods=['POST'])
# def process_form():
#     your_name = request.form['your_name']
#     receiver_name = request.form['name']
#     purpose = request.form['purpose']


@app.route('/home')


def home():
   return render_template('Home.html')


@app.route('/forgot')


def forget():
   return render_template('forgotemail.html')


@app.route('/forget',methods = ["POST", "GET"])
def reset():
    if request.method == "POST":        #Only if data has been posted
        email = request.form['email']
        auth.send_password_reset_email(email)
       
        return render_template('reset email.html')
    return render_template('reset email.html')



@app.route('/admin')


def admin():
    # Replace 'https://example.com' with the desired URL
    return redirect('https://console.firebase.google.com/u/0/project/authenticate-4f223/authentication/users')
if __name__ == "__main__":
    app.run(debug=True)
# write a leave application for college HOD Rajkumar write a email to college for asking leave due to feaver for 3 days