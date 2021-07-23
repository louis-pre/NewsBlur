#!/usr/bin/python3
import os
import shutil

from newsblur_web import settings
import boto3

filenames = [f for f in os.listdir('/opt/mongo/newsblur/backup/') if '.tgz' in f]

for filename in filenames:
    print('Uploading %s to S3...' % filename)
    try:
        s3 = boto3.client('s3') 
        bucket = s3.Bucket()
        bucket.upload_file(f"mongo/{filename}", settings.S3_BACKUP_BUCKET)
    except Exception as e:
        print(" ****> Exceptions: %s" % e)
    shutil.rmtree(filename[:-4])
    os.remove(filename)
