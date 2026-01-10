from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

db = SQLAlchemy()
jwt = JWTManager()

def send_email(to_email, subject, body):
    # Configure your SMTP server and credentials here
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')

    if not smtp_user or not smtp_password:
        print('SMTP not configured: set SMTP_USER and SMTP_PASSWORD environment variables')
        return False

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print('Email send failed:', e)
        return False 