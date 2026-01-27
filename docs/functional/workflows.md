# Sync Workflow Example

## First run

    user selects folder with music files

    app catalogs found music files

    (...)

## User workflow when switching between devices:

    On Device A (Win11 Laptop):  
        landing page - no library loaded  
        click 'configure library / use existing library'  
        select folder with music files  
        User scans music folder: /Users/alice/Music/DJ Library  
        App catalogs 5,000 tracks  
        table displaying data is visible          
        Detects 50 duplicates  
        display report / stats?
        User decides to remove duplicates - button under stats / in report modal?  
        Database updates with decisions  
        diff / transaction details before confirming (X files will be deleted / renamed etc.)  
        app performs modification on actual files in fs  
        Database file syncs to Dropbox

    On Device B (Win10 Laptop):

        User opens app

        App detects music root: C:\Users\Bob\Music\DJ

        Cloud sync downloads updated database

        App detects external database changes

        Reloads database

        Shows message: "Library synced from MacBook Pro. 50 duplicates were removed."

        User can continue working with updated library state

        File paths are automatically resolved to Windows paths

​
