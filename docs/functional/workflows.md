# Sync Workflow Example

## User workflow when switching between devices:

    On Device A (MacBook):

        User scans music folder: /Users/alice/Music/DJ Library

        App catalogs 5,000 tracks

        Detects 50 duplicates

        User decides to remove duplicates

        Database updates with decisions

        Database file syncs to Dropbox

    On Device B (Windows Laptop):

        User opens app

        App detects music root: C:\Users\Bob\Music\DJ

        Cloud sync downloads updated database

        App detects external database changes

        Reloads database

        Shows message: "Library synced from MacBook Pro. 50 duplicates were removed."

        User can continue working with updated library state

        File paths are automatically resolved to Windows paths

​
