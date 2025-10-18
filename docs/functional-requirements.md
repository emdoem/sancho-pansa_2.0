# User stories

## Table of Contents

- [User stories](#user-stories)
  - [Catalog music files](#catalog-music-files)
  - [Check music files for duplicates](#check-music-files-for-duplicates)
  - [Remove duplicate files from library](#remove-duplicate-files-from-library)
  - [Unify file-naming convention](#unify-file-naming-convention)
  - [Synchronise library on several devices](#synchronise-library-on-several-devices)
  - [Manage playlists through the app](#manage-playlists-through-the-app)
- [Primary User Flows](#primary-user-flows)

## Catalog music files

As a user  
read and store metadata for each song, including: artist name, title, album, tempo, length

## Check music files for duplicates

As a user  
have the files compared using artist name, title, album & length - to determine if songs are duplicates

## Remove duplicate files from library

As a user  
remove duplicate songs from the library and have the app apply changes to music files in the folder, creating a new folder structure

## Unify file-naming convention

As a user  
have the files renamed to a unified convention  
to prevent further duplication

## Synchronise library on several devices

As a user  
have the catalog and desired library state stored in a portable database  
to allow synchronization on several devices (laptops / PCs)

## Manage playlists through the app

As a user
import playlists from different file formats and store them in m3u format  
to use them in the Mixxx software

# Primary User Flows

App has three main user journeys:

1. Initial Library Setup Flow (First-time user)

    Select music folder(s) → Scan & catalog files → Review metadata → Set naming convention preferences → Complete setup

2. Duplicate Management Flow (Core feature)

    View catalog → Run duplicate scan → Review duplicate groups → Select files to keep/remove → Apply changes to filesystem → Verify results

3. Ongoing Library Maintenance Flow (Regular use)

    Import new files → Auto-detect duplicates → Manage playlists → Sync across devices
