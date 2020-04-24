# README

## About

[NoteHub](https://www.notehub.org) is a free and hassle-free pastebin for one-off markdown publishing and was implemented as a one-app-one-language [experiment](https://notehub.org/ikqz8).

## Test

## Implementation

NoteHub's implementation aims for ultimate simplicity and performance.

### Design

1. At a request, the server first checks, if a note is already rendered and is present in the LRU cache.  
  (a) If _yes_, it return the rendered HTML code and increases the views counter.  
  (b) Otherwise, the note is retrieved from the DB, rendered and put into the LRU cache; the views counter will be increased.
2. The rendering of note pages: there are HTML file tempates with placeholders, which will be trivially filled with replacements.
3. The LRU cache holds the rendered HTML for the most popular notes, which makes their access a static O(1) operation without any DB I/O.
4. The server keeps corresponding models for all notes in the cache for statistics updates. These models are persisted every 5 minutes to the DB.

## Installation & Deployment

To run NoteHub as a standalone version, execute:

1. `git clone https://github.com/chmllr/NoteHub.git`
2. `npm install`
3. `npm start`

This starts a NoteHub instance on port 3000.
