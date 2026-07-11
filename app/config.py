import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = 'Add your secret_key'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost/myflaskdb'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False