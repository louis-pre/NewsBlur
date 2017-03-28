package com.newsblur.util;

import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.os.Build;

import com.newsblur.R;
import com.newsblur.activity.FeedReading;
import com.newsblur.activity.Main;
import com.newsblur.activity.Reading;
import com.newsblur.database.DatabaseConstants;
import com.newsblur.domain.Feed;
import com.newsblur.domain.Story;
import com.newsblur.util.FileCache;

public class NotificationUtils {

    private static final int NOTIFY_COLOUR = 0xFFDA8A35;
    private static final int MAX_CONCUR_NOTIFY = 5;

    private NotificationUtils() {} // util class - no instances

    /**
     * @param storiesFocus a cursor of unread, focus stories to notify, ordered newest to oldest
     * @param storiesUnread a cursor of unread, neutral stories to notify, ordered newest to oldest
     */
    public static synchronized void notifyStories(Cursor storiesFocus, Cursor storiesUnread, Context context, FileCache iconCache) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        int count = 0;
        while (storiesFocus.moveToNext()) {
            Story story = Story.fromCursor(storiesFocus);
            if (story.read) {
                nm.cancel(story.hashCode());
                continue;
            }
            if (FeedUtils.dbHelper.isStoryDismissed(story.storyHash)) {
                nm.cancel(story.hashCode());
                continue;
            }
            if (count < MAX_CONCUR_NOTIFY) {
                Notification n = buildStoryNotification(story, storiesFocus, context, iconCache);
                nm.notify(story.hashCode(), n);
            } else {
                nm.cancel(story.hashCode());
                FeedUtils.dbHelper.putStoryDismissed(story.storyHash);
            }
            count++;
        }
        while (storiesUnread.moveToNext()) {
            Story story = Story.fromCursor(storiesUnread);
            if (story.read) {
                nm.cancel(story.hashCode());
                continue;
            }
            if (FeedUtils.dbHelper.isStoryDismissed(story.storyHash)) {
                nm.cancel(story.hashCode());
                continue;
            }
            if (count < MAX_CONCUR_NOTIFY) {
                Notification n = buildStoryNotification(story, storiesUnread, context, iconCache);
                nm.notify(story.hashCode(), n);
            } else {
                nm.cancel(story.hashCode());
                FeedUtils.dbHelper.putStoryDismissed(story.storyHash);
            }
            count++;
        }
    }

    private static Notification buildStoryNotification(Story story, Cursor cursor, Context context, FileCache iconCache) {
        Intent i = new Intent(context, FeedReading.class);
        // the action is unused, but bugs in some platform versions ignore extras if it is unset
        i.setAction(story.storyHash);
        // these extras actually dictate activity behaviour
        i.putExtra(Reading.EXTRA_FEEDSET, FeedSet.singleFeed(story.feedId));
        i.putExtra(Reading.EXTRA_STORY_HASH, story.storyHash);
        // force a new Reading activity, since if multiple notifications are tapped, any re-use or
        // stacking of the activity would almost certainly out-race the sync loop and cause stale
        // UI on some devices.
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        // set the requestCode to the story hashcode to prevent the PI re-using the wrong Intent
        PendingIntent pendingIntent = PendingIntent.getActivity(context, story.hashCode(), i, 0);

        Intent dismissIntent = new Intent(context, DismissalReceiver.class);
        dismissIntent.putExtra(Reading.EXTRA_STORY_HASH, story.storyHash);
        PendingIntent dismissPendingIntent = PendingIntent.getBroadcast(context.getApplicationContext(), story.hashCode(), dismissIntent, 0);

        String feedTitle = cursor.getString(cursor.getColumnIndex(DatabaseConstants.FEED_TITLE));
        StringBuilder title = new StringBuilder();
        title.append(feedTitle).append(": ").append(story.title);

        String faviconUrl = cursor.getString(cursor.getColumnIndex(DatabaseConstants.FEED_FAVICON_URL));
        Bitmap feedIcon = ImageLoader.getCachedImageSynchro(iconCache, faviconUrl);

        Notification.Builder nb = new Notification.Builder(context)
            .setContentTitle(title.toString())
            .setContentText(story.shortContent)
            .setSmallIcon(R.drawable.logo_monochrome)
            .setContentIntent(pendingIntent)
            .setDeleteIntent(dismissPendingIntent)
            .setAutoCancel(true)
            .setWhen(story.timestamp);
        if (feedIcon != null) {
            nb.setLargeIcon(feedIcon);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            nb.setColor(NOTIFY_COLOUR);
        }

        return nb.build();
    }

    public static void clear(Context context) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.cancelAll();
    }


}
