# Tune Score

Start the application by running app.py in the application folder.

User1

    - username: admin
    - password: admin

User2

    - username: garry
    - password: garry

User3

    -username: michelle
    -password: michelle

User4

    -username: april
    -password: april


FUNCTIONALITY LIST

INDEX 

    - header only shows homepage button, login and signup if user is not logged in
    - if logged in, header shows homepage, my scores, new score, searchbar, profile and log out option
    - shows all public scores and a list of all users
    - user can sort the scores, after artist, song, date or creator
    - sort preferences are stored using cookies
    - user can search for scores via searchbar 
    - user can search for new users and click the username or profile picture
    - if user list is long enough a scroll wheel is shown
    - clickable links are shown with underline or mouse cursor
    - the artist name is clickable and routes to a search with the artist name as query 

SEARCH PAGE

    - user can click the score page of the search result


SCORE LIBRARY

    - shows all of the users scores and favorites
    - user can sort after artist, song or date in both tables
    - user can change a scores visibility from hidden to unhidden with checkbox
    - user can delete scores, a caution message is displayed
    - if the deleted score is favorited, it is also removed from favorites table with CASCADING DELETE
    - user can open score editor with either new score button or edit icon
    - user can remove a score from favorites
    - if edit icon is clicked the score editor loads the clicked scores info
    - if user isnt logged in, redirected to login instead

SCORE PAGE

    - user can look through scores and play back audio.
    - user can click any chord, to select it as the start when clicking play, or 
    - shows a favorite/unfavorite button and edit button if logged in
    - edit button only displayed when user is owner
    - favorite/unfavorite button depends on if you have already favorited
    - user can adjust song tempo/BPM
    - SPEED can be clicked to reset to original BPM
    - user can adjust volume
    - user can transpose or adjust key 
    - user can start anywhere on the song
    - if you click transpose or speed label, it reverts to default value
    - if you click volume button it mutes. if you click again it reverts to the previous volume,
    unless you slide the volume to 0.
    - user volume is saved in cookies and remains after refresh
    - if score is private, only creator can view it

SCORE EDITOR

    - same playback functionality as SCORE PAGE
    - uses a template and fills with score info if scoreID != 0
    - if scoreID=0 this means an undefined score and fields are blank with placeholder info
    - user can switch the score he is editing by clicking edit icon
    - textarea where user can write chords and rests separated by spaces, and add sections by adding empty lines. 
    - there is a need help link that opens a modal with a guide that explains the chord input textarea in great detail
    - all forms are required in order to save

LOGIN

    - Login details are verified in js and if valid sent to server
    - If invalid a error message is displayed
    - Server side also verifies the details, if error then message is displayed
    - If valid a session is started with the users ID and rerouted to index
    - password input is shown as dots
    - Both fields are required to submit
    - user can click reset password or sign up instead
    - all forms are required in order to submit

SIGNUP

    - username field has a 12 character limit which is displayed on input
    - all forms are required in order to submit
    - verification is done both serverside and in js
    - if username is taken an error is displayed
    - if email is taken an error is displayed
    - if password is shorter than 5 characters an error is displayed
    - if password input is different from confirm password input an error is displayed
    - if valid a session is started and new user is initalized with filler information for details not specified
      userBio = "I havent written anything yet"
      country = "Fill in"
      profilePicture = Default profile picture
      registrationDate = date.today()

PROFILE 

    - If user is not logged in they cant access anyones profile
    - if user is visiting own profile, only the edit profile button is shown
    - if user A is visiting user B's profile, we check:
        if user A is following user B, unfollow button is shown
        else, follow button is shown
    - user can click onto his or her followers/following and view the corresponding users with modal popup
    - if userlist is too long a scroll wheel is shown
    - if user views own followers, remove follower and unfollow/follow button is displayed
    - if user views own following, unfollow/follow button is displayed
    - if user A views user B's followers (example user C), user A can unfollow/folllow user C via modal, but not remove user C's follow of user B
    - if user A views user B following, user A can unfollow/follow user C via modal
    - my scores section only shows public scores of the current profile not private

EDIT PROFILE

    - Allows user to edit account details
    - if no changes were done in an input, the specific input field is not verified
    - if username is taken an error is displayed
    - username has a 12 character limit which is displayed on input
    - if email is taken an error is displayed
    - username bio has a 200 character limit which is displayed on input
    - if user uploads file, the file is verified to be a picture 
    - if valid, the picture is displayed by creating a random url. User can remove the uploaded picture with cancel button
    - if invalid an error is displayed and display shows the originial profile picture
    - save button saves the details and new picture. if no new picture is given the original picture is used
    - user can click reset password link

RESET PASSWORD

    - email input is verified to be in use
    - if not, an error message is displayed 
    - if user is logged in, the sign up link is not displayed
    - no functionality for sending email to reset is actually implented



