import os

DOCKERBUILD = os.getenv("DOCKERBUILD")

DATABASES = {
    'default': {
        'NAME': 'newslur_test',
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'USER': 'newsblur',
        'PASSWORD': 'newsblur',
        'HOST': 'db_postgres',
        'AUTOCOMMIT': True,
    }
}

LOGGING_CONFIG = None



if DOCKERBUILD:
    MONGO_PORT = 29019
    MONGO_DB = {
        'name': 'newsblur_test',
        'host': 'db_mongo:29019',
    }

else:
    MONGO_PORT = 27017
    MONGO_DB = {
        'name': 'newsblur_test',
        'host': '127.0.0.1:27017',
    }
    SERVER_NAME

MONGO_DATABASE_NAME = 'test_newsblur'

DAYS_OF_UNREAD = 9999
DAYS_OF_UNREAD_FREE = 9999
TEST_DEBUG = True
DEBUG = True
SITE_ID = 2
SENTRY_DSN = None
HOMEPAGE_USERNAME = 'conesus'
SERVER_NAME = 'test_newsblur'
