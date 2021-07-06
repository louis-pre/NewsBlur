from django.test.runner import DiscoverRunner
from django.test.utils import setup_databases
from mongoengine.connection import disconnect, connect
from django.conf import settings
class TestRunner(DiscoverRunner):
    def setup_databases(self, **kwargs):
        disconnect()
        mongo_db = settings.MONGO_DB
        connect(**mongo_db)
        print('Creating test-database: ' + mongo_db.get('name'))

        return setup_databases(self.verbosity, self.interactive, **kwargs)

    def teardown_databases(self, old_config, **kwargs):
        import pymongo
        mongo_db = settings.MONGO_DB
        conn = pymongo.MongoClient(host=mongo_db.get('host'), port=mongo_db.get('port'))
        db_name = 'newsblur_test'
        conn.drop_database(db_name)
        print('Dropping test-database: %s' % db_name)
        return super(TestRunner, self).teardown_databases(old_config, **kwargs)


# class TestCase(TransactionTestCase):
#     def _fixture_setup(self):
#         pass
