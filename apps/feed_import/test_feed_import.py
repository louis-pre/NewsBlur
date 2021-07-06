import json
import os

from django.conf import settings
from django.contrib.auth.models import User
from django.test import TransactionTestCase
from django.test.client import Client
from django.urls import reverse
from mongoengine.connection import connect, disconnect

from apps.profile.factories import ProfileFactory, UserFactory
from apps.reader.factories import UserSubscriptionFactory, UserSubscriptionFoldersFactory
from apps.reader.models import UserSubscription, UserSubscriptionFolders
from apps.rss_feeds.models import Feed, merge_feeds
from utils import json_functions as json_functions


class Test_Import(TransactionTestCase):

    def setUp(self):
        disconnect()
        mongo_db = settings.MONGO_DB
        connect(**mongo_db)
        self.client = Client()
        
        self.user = UserFactory(username='conesus', password='test')
        ProfileFactory(user=self.user)

        UserSubscriptionFoldersFactory(user=self.user, folders='[{"Tech": [4, 5]}, 1, 2, 3, 6]')

    def tearDown(self):
        settings.MONGODB.drop_database('test_newsblur')

    def test_opml_import(self):
        self.maxDiff = None
        self.client.force_login(self.user)
        
        # Verify user has no feeds
        subs = UserSubscription.objects.filter(user=self.user)
        self.assertEqual(subs.count(), 0)
        f = open(os.path.join(os.path.dirname(__file__), 'fixtures/opml.xml'))
        response = self.client.post(reverse('opml-upload'), {'file': f})
        self.assertEqual(response.status_code, 200)
        
        # Verify user now has feeds
        subs = UserSubscription.objects.filter(user=self.user)
        self.assertEqual(subs.count(), 54)
        
        usf = UserSubscriptionFolders.objects.get(user=self.user)
        folders = json_functions.decode(usf.folders)
        self.assertEqual(folders, [{'Tech': [4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]}, 1, 2, 3, 6, {'New York': [1, 2, 3, 4, 5, 6, 7, 8, 9]}, {'tech': []}, {'Blogs': [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, {'The Bloglets': [45, 46, 47, 48, 49]}]}, {'Cooking': [50, 51, 52, 53]}, 54])
        
    def test_opml_import__empty(self):
        self.client.force_login(self.user)
        
        # Verify user has default feeds
        subs = UserSubscription.objects.filter(user=self.user)
        self.assertEqual(subs.count(), 0)

        response = self.client.post(reverse('opml-upload'))
        self.assertEqual(response.status_code, 200)
        
        # Verify user now has feeds
        subs = UserSubscription.objects.filter(user=self.user)

        self.assertEquals(subs.count(), 0)

class Test_Duplicate_Feeds(TransactionTestCase):
    def setUp(self):
        user_1 = UserFactory()
        user_2 = UserFactory()
        # had to load the feed data this way to hit the save() override.
        # it wouldn't work with loaddata or fixures
        with open('apps/feed_import/fixtures/duplicate_feeds.json') as json_file:
            feed_data = json.loads(json_file.read())

        feed_1 = Feed.objects.create(**feed_data[0])
        feed_2 = Feed.objects.create(**feed_data[1])
        self.user_1_feed_subscription = UserSubscriptionFactory(feed=feed_1, user=user_1)
        self.user_2_feed_subscription = UserSubscriptionFactory(feed=feed_2, user=user_2)  
        UserSubscriptionFoldersFactory(user=user_2)      

    def test_duplicate_feeds(self):

        self.assertNotEqual(self.user_1_feed_subscription, self.user_2_feed_subscription)

        merge_feeds(self.user_1_feed_subscription.id, self.user_2_feed_subscription.id)

        user_1_feed_subscription = UserSubscription.objects.filter(user__id=1)[0].feed_id    
        user_2_feed_subscription = UserSubscription.objects.filter(user__id=2)[0].feed_id
        self.assertEqual(user_1_feed_subscription, user_2_feed_subscription)
