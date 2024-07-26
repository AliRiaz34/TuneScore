from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, session, jsonify
import setup_db, re
import os
from datetime import date

app = Flask(__name__)
app.secret_key = 'secretsecret'
BASE_DIR = os.getcwd()
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static/images')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  

def get_db_connection():
    conn = setup_db.create_connection(setup_db.database)
    return conn

### IMAGES ###
@app.route('/static/images/<filename>', methods=['GET'])
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

### USER INFORMATION ###
@app.route("/users", methods=['GET'])
def list_users():
    conn = get_db_connection()
    users_info = setup_db.find_all_users(conn)
    return jsonify(users_info)

@app.route("/users/session", methods=['GET'])
def user_info():
    if session:
        user_logged_in = session["user_id"]
        conn = get_db_connection()
        user_info = setup_db.find_user_info(conn, user_logged_in)
        return jsonify(user_info)
    else: 
        return jsonify(False)


### SCORE MANAGEMENT ###
@app.route("/scores/<int:scoreID>", methods=['GET'])
def score(scoreID):
    conn = get_db_connection()
    score_info = setup_db.find_score_info(conn, scoreID)
    conn.close()
    visibility = score_info["visibility"]
    if session == {}:
         return render_template("score.html", score_info=score_info)
    elif visibility == "private":
        if session["user_id"] == score_info["creatorID"]:
            return render_template("score.html", score_info=score_info)
        else:  
            return redirect(url_for('index'))
    elif visibility == "public":
        return render_template("score.html", score_info=score_info)

@app.route("/users/session/scores", methods=['GET'])
def my_scores():
    if session:
        user_logged_in = session['user_id']
        return render_template("scoreLib.html", SessionUserID=user_logged_in)
    else:
        return redirect(url_for('login'))

@app.route("/users/session/scores-info", methods=['GET', 'DELETE'])
def user_scores_info():
    conn = get_db_connection()
    if request.method == 'GET': 
        user_logged_in = session['user_id']
        scores_info = setup_db.scores_by_user(conn, user_logged_in)
        return jsonify(scores_info)
    elif request.method == 'DELETE':
        scoreID = request.json['scoreID']
        deletedScore = setup_db.delete_score(conn, scoreID)
        return jsonify(deletedScore)

@app.route("/score-editor/<int:scoreID>", methods=['GET', 'POST'])
def score_editor(scoreID):
    conn = get_db_connection()
    user_logged_in = session['user_id']
    lastModified = date.today()
    isOwner = setup_db.is_user_owner(conn, user_logged_in, scoreID)

    if request.method == 'GET': 
        if isOwner == True:
            return render_template("scoreEditor.html", scoreID=scoreID)
        else:
            if scoreID == 0:
                return render_template("scoreEditor.html", scoreID=scoreID)
            else:
                return redirect(url_for('index'))
    elif request.method == 'POST': 
        if scoreID == 0:
            chords = request.form.get('chords-input') 
            timeSignature = request.form.get('time-signature-input') 
            tempo = request.form.get('tempo-input') 
            artistName = request.form.get('artist-input') 
            scoreName = request.form.get('songname-input') 

            newScoreID = setup_db.new_scoreID(conn)
            visibility = "private"
            setup_db.add_score(conn, newScoreID, user_logged_in, scoreName, artistName, visibility, lastModified, lastModified, chords, tempo, timeSignature)
            conn.close()
            return redirect(url_for('score_editor', scoreID=newScoreID))
        if scoreID != 0:
            scoreName = request.json['scoreName']
            artistName = request.json['artistName']
            tempo = request.json['tempo']
            timeSignature = request.json['timeSignature']
            chords = request.json['chords']
            setup_db.change_score_info(conn, scoreID, scoreName, artistName, tempo, timeSignature, chords, lastModified)
            conn.close()
            return redirect(url_for('score_editor', scoreID=scoreID))
       
    
@app.route("/scores/public", methods=['GET'])
def public_scores():
    conn = get_db_connection()
    scores_info = setup_db.find_public_scores(conn)
    return jsonify(scores_info)

@app.route("/score/<int:scoreID>/visibility", methods=['PATCH'])
def change_score_visibility(scoreID):
    visibility = request.json['visibility']
    conn = get_db_connection()
    setup_db.change_score_visibility(conn, scoreID, visibility)
    return jsonify(visibility)

@app.route("/score/<int:scoreID>/info", methods=['GET'])
def score_info(scoreID):
    conn = get_db_connection()
    score_info = setup_db.find_score_info(conn, scoreID)
    return jsonify(score_info)
    
@app.route("/users/session/scores/<int:scoreID>/ownership", methods=['GET'])
def is_owner(scoreID):
    user_logged_in = session['user_id']
    conn = get_db_connection()
    isOwner = setup_db.is_user_owner(conn, user_logged_in, scoreID)
    return jsonify(isOwner)


### SEARCH FUNCTION ###
@app.route("/search/<string:query>", methods=['GET'])
def search_scores(query):
    return render_template("search.html", query=query)
   

### AUTHENTICATION ###
@app.route("/")
def index():
    return render_template('index.html')

@app.route("/signup", methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')        
        password = request.form.get('password') 
        confirmPassword = request.form.get('confirmPassword') 
        email = request.form.get('email') 
        userBio = "I havent written anything yet"
        country = "Fill in"
        profilePicture = "pfpDefault.png"
        registrationDate = date.today()
        
        conn = get_db_connection()
        userID = int(setup_db.new_userID(conn))

        if len(password) < 5:
            flash("Password has to be 5 characters.", 'error')
            return render_template("signup.html")
        
        if password != confirmPassword:
            flash("Passwords do not match.", 'error')
            return render_template("signup.html")

        conn = get_db_connection()
        userID = int(setup_db.new_userID(conn))

        if setup_db.is_username_taken(conn, username) == True:
            flash("Username taken.", 'error')
            return render_template("signup.html")
        
        if setup_db.is_email_taken(conn, email) == True:
            flash("Email already in use. Log in instead", 'error')
            return render_template("signup.html")

        setup_db.add_user(conn, userID, username, password, email, registrationDate, country, userBio, profilePicture)  
        conn.close()
        
        session['user_id'] = int(userID)
        
        return redirect(url_for('index'))
    return render_template("signup.html")

@app.route("/login", methods=['GET', 'POST'])
def login():
    if session:
         return redirect(url_for('profile', userID=session['user_id']))
    else:
        if request.method == 'POST':
            username = request.form.get('username')        
            password = request.form.get('password') 

            conn = get_db_connection()

            if setup_db.login_check(conn, username, password) == True:
                userID = setup_db.select_userID_by_username(conn, username)
                session['user_id'] = int(userID)
                return redirect(url_for('index'))
            else:
                flash("Incorrect username/password", 'error')
                return render_template("login.html")
            
        return render_template("login.html")

@app.route('/login-check')
def login_check():
    username = request.args.get("username", None)
    password = request.args.get("password", None)
    
    conn = get_db_connection()
    loginValid = setup_db.login_check(conn, username, password)
    return jsonify(loginValid)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/info-check')
def info_check():
    email = request.args.get("email", None)
    username = request.args.get("username", None)

    conn = get_db_connection()
    emailCheck = setup_db.is_email_taken(conn, email)
    usernameCheck = setup_db.is_username_taken(conn, username)

    validDict = {
        "email": emailCheck,
        "username": usernameCheck
    }
    return jsonify(validDict)

@app.route("/forgot-password")
def forgot_password():
    if session:
        SessionUserID = session['user_id']
    else:
        SessionUserID = None
    return render_template("forgotPW.html", SessionUserID=SessionUserID)

### PROFILE SYSTEM ###
@app.route("/profile/<int:userID>")
def profile(userID):
    if session:
        conn = get_db_connection()
        scores = setup_db.public_scores_by_user(conn, userID)
        user_info = setup_db.find_user_info(conn, userID)
        conn.close()

        return render_template("profile.html", scores=scores, user_info=user_info, 
                            userID=userID, SessionUserID=session['user_id'])
    else:
        return redirect(url_for('login'))

@app.route("/users/<int:userID>", methods=['GET', 'POST', 'DELETE'])
def edit_profile(userID):
    if session:
        method = request.form.get('_method')
        user_logged_in = session['user_id']
    
        if int(userID) != user_logged_in:
            return redirect(url_for('index'))

        conn = get_db_connection()
        user_info = setup_db.find_user_info(conn, userID)
        print(user_info)

        if method == 'PATCH' or request.method == 'POST':
            new_username = request.form.get('username')        
            new_email = request.form.get('email') 
            new_userBio = request.form.get('userBio')    
            new_country = request.form.get('country') 

            newPicture = request.files.get('newPicture-input')
            if newPicture:
                newFilename = f"pfpUserID{userID}.png"
                newPicture.save(os.path.join(UPLOAD_FOLDER, newFilename))
            else:
                newFilename = user_info['profilePicture']

            setup_db.change_user_info(conn, userID, new_username, new_email, new_userBio, new_country, newFilename)
            user_info = setup_db.find_user_info(conn, userID)
            return render_template("editProfile.html",  SessionUserID=session['user_id'], user_info=user_info)
        elif request.method == 'GET':
            return render_template("editProfile.html",  SessionUserID=session['user_id'], user_info=user_info)
        elif request.method == 'DELETE':
            setup_db.delete_user(conn, userID)
            return jsonify({"message": "User deleted", "redirect_url": url_for('logout')}), 200
    else:
        return redirect(url_for('login'))

### FOLLOWER SYSTEM ###
@app.route("/users/<int:userID>/followers-info", methods=['GET', 'DELETE'])
def followers_info(userID):
    conn = get_db_connection()
    
    if request.method == 'GET':
        followers_info = setup_db.find_user_followers(conn, userID)
        if followers_info == []:
            return jsonify(False)
        else:
            return jsonify(followers_info)
    elif request.method == 'DELETE':
        user_logged_in = int(session['user_id'])
        followerID = request.json['followerID']

        removedFollowerID = setup_db.user1_removes_user2_follow(conn, user_logged_in, followerID)
        return jsonify(removedFollowerID)

@app.route("/users/<int:userID>/following-info", methods=['GET', 'POST', 'DELETE'])
def following_info(userID):
    conn = get_db_connection()
    if request.method == 'GET':
        following_info = setup_db.find_user_is_following(conn, userID)

        if following_info == []:
            return jsonify(False)
        else:
            return jsonify(following_info)
    elif request.method == 'POST':
        user_logged_in = int(session['user_id'])
        followedUser = request.json['followedUserID']

        setup_db.add_follower(conn, followedUser, user_logged_in)
        return jsonify(followedUser)
    elif request.method == 'DELETE':
        user_logged_in = int(session['user_id'])
        unfollowedUser = request.json['unfollowedUserID']

        unfollowedUserID = setup_db.user1_unfollow_user2(conn, user_logged_in, unfollowedUser)
        return jsonify(unfollowedUserID)

@app.route("/users/<int:userID>/follow-status", methods=['GET'])
def is_following(userID):
    user_logged_in = session['user_id']
    conn = get_db_connection()

    isFollowing = setup_db.is_user1_following_user2(conn, user_logged_in, userID)
    return jsonify(isFollowing)

### FAVORITES SYSTEM #####
@app.route("/users/session/favorites-info", methods=['GET', 'POST', 'DELETE'])
def favorites_info():
    conn = get_db_connection()
    user_logged_in = int(session['user_id'])
    favorites_info = setup_db.find_user_favorites(conn, user_logged_in)
    return jsonify(favorites_info)
    
@app.route("/scores/<int:scoreID>/favorites", methods=['GET', 'POST', 'DELETE'])
def is_favorited(scoreID):
    user_logged_in = session['user_id']
    conn = get_db_connection()
    if request.method == 'GET':
        isFavorited = setup_db.is_score_favorited(conn, user_logged_in, scoreID)
        return jsonify(isFavorited)
    elif request.method == 'POST':
        scoreID = request.json['scoreID']
        favoritedScoreID = setup_db.add_favorite(conn, user_logged_in, scoreID)
        return jsonify(favoritedScoreID)
    elif request.method == 'DELETE':
        scoreID = request.json['scoreID']
        unfavoritedScoreID = setup_db.delete_favorite(conn, user_logged_in, scoreID)
        return jsonify(unfavoritedScoreID)
    
    
if __name__ == "__main__":
    app.run()
