import sqlite3
from sqlite3 import Error 

database = r"./database.db"

def create_connection(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn
    except Error as e:
        print(e)

    return conn

##### CREATE TABLES ######## 

sql_create_users_table = """CREATE TABLE IF NOT EXISTS users (
                                userID INTEGER PRIMARY KEY,
                                username TEXT UNIQUE NOT NULL, 
                                password TEXT NOT NULL, 
                                email TEXT UNIQUE, 
                                registrationDate TEXT,
                                country TEXT,
                                userBio TEXT, 
                                profilePicture TEXT,
                                favoriteScores 
                            );"""

sql_create_followers_table = """CREATE TABLE IF NOT EXISTS followers (
                                    userID INTEGER NOT NULL,
                                    followerID INTEGER NOT NULL,
                                    FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE,
                                    FOREIGN KEY (followerID) REFERENCES users (userID) ON DELETE CASCADE
                                );"""

sql_create_scores_table = """CREATE TABLE IF NOT EXISTS scores (
                                scoreID INTEGER PRIMARY KEY,
                                creatorID INTEGER NOT NULL,
                                scoreName TEXT NOT NULL,
                                artistName TEXT, 
                                visibility NOT NULL,
                                creationDate TEXT, 
                                lastModified TEXT,
                                chords TEXT,
                                tempo INT,
                                timeSignature INT,
                                FOREIGN KEY (creatorID) REFERENCES users (userID) ON DELETE CASCADE
                            );"""

sql_create_favorites_table = """CREATE TABLE IF NOT EXISTS favorites (
                                userID INTEGER NOT NULL,
                                scoreID INTEGER NOT NULL,
                                FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE,
                                FOREIGN KEY (scoreID) REFERENCES scores (scoreID) ON DELETE CASCADE
                            );"""


def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)

#### INSERT #########

def add_user(conn, userID, username, password, email, registrationDate, country, userBio, profilePicture):
    """
    Add a new user into the users table
    :param conn:
    :param userID:
    :param username:
    :param password:
    :param email:
    :param registrationDate:
    :param country:
    :param userBio:
    :param profilePicture:
    """
    sql = ''' INSERT INTO users(userID, username, password, email, registrationDate, country, userBio, profilePicture)
              VALUES(?, ?, ?, ?, ?, ?, ?, ?) '''
    try:
        cur = conn.cursor()
        cur.execute(sql, (userID, username, password, email, registrationDate, country, userBio, profilePicture))
        conn.commit()
    except Error as e:
        print(e)

def init_users(conn):
    init = [(1,"admin","admin","admin","2024-03-05", 'Norway', "Hello im admin","pfpUserID1.png"),
            (2,"garry","garry","garry","2024-03-05",'Britain', "Hello im garry","pfpUserID2.png"),
            (3,"michelle","michelle","michelle","2024-03-05", 'Iran', "Hello im michelle","pfpUserID3.png"),
            (4,"april","april","april","2024-03-05",'Transylvania', "Hello im april","pfpUserID4.png")]
    for s in init:
        add_user(conn, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7])

def add_follower(conn, userID, followerID):
    """
    Add a new user into the users table
    :param conn:
    :param userID:
    :param followerID:
    """

    sql = ''' INSERT INTO followers(userID, followerID)
              VALUES(?, ?) '''
    try:
        cur = conn.cursor()
        cur.execute(sql, (userID, followerID))
        conn.commit()
    except Error as e:
        print(e)

def init_followers(conn):
    init = [(1,2),(1,3),(2,1),(2,3),(3,1),(3,2),(4,3)]
    for s in init:
        add_follower(conn, s[0], s[1] )

def add_score(conn, scoreID, creatorID, scoreName, artistName, visibility, creationDate, lastModified, chords, tempo, timeSignature):
    """
    Add a new score into the scores table
    :param conn:
    :param scoreId:
    :param creatorID:
    :param scoreName:
    :param artistName:
    :param visibility: public, private
    :param creationDate:
    :param lastModified:
    :param chords:
    :param tempo:
    :param timeSignature:
    """
    sql = ''' INSERT INTO scores(scoreID, creatorID, scoreName, artistName, visibility, creationDate, lastModified, chords, tempo, timeSignature)
              VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) '''
    try:
        cur = conn.cursor()
        cur.execute(sql, (scoreID, creatorID, scoreName, artistName, visibility, creationDate, lastModified, chords, tempo, timeSignature))
        conn.commit()
    except Error as e:
        print(e)

def init_scores(conn):
    init = [(1,1,"Lilac Wine","Jeff Buckley",'public',"2019-12-11","2019-12-11","Gm:4 rest:2 EbM:2 rest:2 DMdom7b9:2 DM:2 DMdom7:2 rest:2 Gm:2 rest:4 EbM:4 rest:2 DMdom7b9:2 DM:2 DMdom7:2 Gm:4\n\nFdim7:4 CM:4 Cm:4 Gm:4 Fdim7:4 CM:4 Cm:4 Dsus4:4 DMdom7:4\n\nGM:4 Fsus2Add6#11:4 GM:4 Fsus2Add6#11:4 CM:4 DM:4 GM:4  CM:4 DMdom7:2 GM:2 CM:4 Dmdom7:2 GM:2 CM:2 CMmaj7:2 CMmaj7:2 CMmaj7:2\n\nEbM:4 DMdom7:4 Am:4 DMdom7:4\n\nGM:4 Fsus2Add6#11:4 CM:4 DM:4 GM:4  CM:4 DMdom7:2 GM:2 CM:4 Dmdom7:2 GM:2 CM:2 CMmaj7:2 CMmaj7:2 CMmaj7:2\n\nEbM:4 DMdom7:4 Am:4 DMdom7:4\n\nGM:4 Fsus2Add6#11:4 CM:4 DM:4 GM:4 CM:4 Gsus4b6:4 Dmdom7:4 GM:4", 100, 4),
            (2,3,"Nutshell","Alice In Chains",'public',"2019-12-11","2019-12-11","Ebm:4 GbM:4 DbM:4 BM:4 Ebm:4 GbM:4 DbM:4 BM:4 Ebm:4 GbM:4 DbM:4 BM:4 Ebm:4 GbM:4 DbM:4 BM:4", 136, 4),
            (3,1,"Weird Fishes","Radiohead",'public',"2019-12-11","2019-12-11","Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 AM:2 AM:2 AM:2 AM:2 AM:2 AM:2 AM:2 AM:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2\n\nEmdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 Emdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 F#mdom7:2 AM:2 AM:2 AM:2 AM:2 AMdom7:2 AMdom7:2 AMAdd6:2 AMAdd6:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2 GMmaj7:2	", 153, 4),
            (4,2,"Giant Steps","John Coltrane",'public',"2019-12-11","2019-12-11","BMmaj7:2 DMdom7:2 GMmaj7:2 BbMdom7:2 EbMmaj7:4 Amdom7:2 DMdom7:2 GMmaj7:2 BbMdom7:2 EbMmaj7:2 F#Mdom7:2 BMmaj7:4 Fmdom7:2 BbMdom7:2 EbMmaj7:4 Amdom7:2 DMdom7:2 GMmaj7:4 C#mdom7:2 F#Mdom7:2 BMmaj7:4 Fmdom7:2 BbMdom7:2 EbMmaj7:4 C#mdom7:2 F#Mdom7:2",  220, 4),
            (5,2,"Donna Lee","Charlie Parker",'public',"2019-12-11","2019-12-11","AbMmaj7:4 FMdom7:4 BbMdom7:4 BbMdom7:4 Bbmdom7:4 EbMdom7:4 AbMmaj7:4 Ebmdom7:2 AbMdom7:2 DbMmaj7:4 GbMdom7:4 AbMmaj7:4 FMdom7:4 BbMdom7:4 BbMdom7:4 Bbmdom7:4 EbMdom7:4\n\nAbMmaj7:4 FMdom7:4 BbMdom7:4 BbMdom7:4 Gø7:4 CMdom7b9:4 Fm:4 CMdom7b9:4 Fm:4 CMdom7b9:4 Fm:4 Bdim7:4 Cmdom7:2 FMdom7:2 Bbmdom7:2 EbMdom7:2 AbMmaj7:4 Bbmdom7:2 EbMdom7:2", 220, 4),
            (6,1,"Just","Radiohead",'public',"2019-12-11","2019-12-11","CM:2 EbM:2 DM:2 FM:2 CM:2 EbM:2 DM:2 FM:2\n\nAm:4 AbM:4 EbM:2 FM:2 Am:4 AbM:4 EbM:2 BbM:2 Am:4 AbM:4 GM:2 GbM:2 FM:4 CMmaj7:2 F#M:2 FM:4 CMmaj7:2 F#M:2 FM:4\n\nCM:2 EbM:2 DM:2 FM:2 CM:2 EbM:2 DM:2 FM:2\n\nAm:4 AbM:4 EbM:2 FM:2 Am:4 AbM:4 EbM:2 BbM:2 Am:4 AbM:4 GM:2 GbM:2 FM:4 CMmaj7:2 F#M:2 FM:4 CMmaj7:2 F#M:2 FM:4\n\nCM:2 EbM:2 DM:2 FM:2 CM:2 EbM:2 DM:2 FM:2\n\nAm:4 AbM:4 EbM:2 BbM:2 Am:4 AbM:4 GM:2 GbM:2 FM:4 CMmaj7:2 GbM:2 FM:4 CMmaj7:2 GbM:2 FM:4\n\nCM:2 EbM:2 DM:2 FM:2 CM:2 EbM:2 DM:2 FM:2 CM:2 EbM:2 DM:2 FM:2 CM:2 EbM:2 DM:2 FM:2\n\nC5:2 Bb5:2 A5:2 Eb5:2 C5:2 Bb5:2 A5:2 Eb5:2 C5:2 Bb5:2 A5:2 Eb5:2 C5:2 Bb5:2 A5:2 Eb5:2", 88, 4),
            (7,3,"Like A Tattoo","Sade",'public',"2019-12-11","2019-12-11","CmAdd9:2 CmAdd9:2 FmAdd9:2 FmAdd9:2 CmAdd9:2 CmAdd9:2 FmAdd9:2 FmAdd9:2 CmAdd9:2 CmAdd9:2 FmAdd9:2 FmAdd9:2 EbMmaj7:2 EbMmaj7:2 FmAdd9:2 FmAdd9:2\n\nCmAdd9:2 CmAdd9:2 FmAdd9:2 FmAdd9:2 CmAdd9:2 CmAdd9:2 FmAdd9:2 FmAdd11:2\n\nCmAdd9:2 CmAdd9:2 FmAdd9:2 FmAdd9:2 CmAdd9:2 CmAdd9:2 FmAdd9:2 FmAdd11:2\n\nGbMmaj7:2 GbMmaj7:2 FMAdd6:2 FMAdd6:2 GbMmaj7:2 GbMmaj7:2 Fmdom7:2 Fmdom7:2 GbMmaj7:2 GbMmaj7:2 FMAdd6:2 FMAdd6:2 GbMmaj7:2 GbMmaj7:2 Bbsus4dom7:2 Bbsus4dom7:2 GbMmaj7:2 GbMmaj7:2 FMAdd6:2 FMAdd6:2 GbMmaj7:2 GbMmaj7:2 Bbsus4dom7:2 Bbsus2dom7:2", 68, 4),
            ]
    for c in init:
        add_score(conn, c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9])

def add_favorite(conn, userID, scoreID):
    """
    Add a new favorite into the favorites table
    :param conn:
    :param userID:
    :param scoreID:
    """
    sql = ''' INSERT INTO favorites(userID, scoreID)
              VALUES(?, ?) '''

    try:
        cur = conn.cursor()
        cur.execute(sql, (userID, scoreID))
        conn.commit()
    except Error as e:
        print(e)
    return scoreID

def init_favorites(conn):
    init = [(1,2)]

    for g in init:
        add_favorite(conn, g[0], g[1])

#### DELETE #######

def user1_unfollow_user2(conn, userID1, userID2):
    cur = conn.cursor()
    cur.execute("DELETE FROM followers WHERE (followerID = ? AND userID = ?)", (userID1, userID2,))
    conn.commit()  
    cur.close()
    return userID2

def user1_removes_user2_follow(conn, userID1, userID2):
    cur = conn.cursor()
    cur.execute("DELETE FROM followers WHERE (userID = ? AND followerID = ?)", (userID1, userID2,))
    conn.commit()  
    cur.close()
    return userID2

def delete_score(conn, scoreID):
    cur = conn.cursor()
    cur.execute("DELETE FROM scores WHERE scoreID = ?", (scoreID,))
    conn.commit() 
    return scoreID

def delete_user(conn, userID):
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE userID = ?", (userID,))
    conn.commit() 
    return userID

def delete_favorite(conn, userID, scoreID):
    cur = conn.cursor()
    cur.execute("DELETE FROM favorites WHERE userID = ? AND scoreID = ?", (userID, scoreID,))
    conn.commit()  
    cur.close()
    return scoreID

#### EDIT #######
def change_user_info(conn, userID, username, email, userBio, country, profilePicture):
    cur = conn.cursor()
    cur.execute("UPDATE users SET username = ?, email = ?, userBio = ?, country = ?, profilePicture = ? WHERE userID = ?", (username, email, userBio, country, profilePicture, userID))
    conn.commit()  
    cur.close()
    return 

def change_score_info(conn, scoreID, scoreName, artistName, tempo, timeSignature, chords, lastModified):
    cur = conn.cursor()
    cur.execute("UPDATE scores SET scoreName = ?, artistName = ?, tempo = ?, timeSignature = ?, chords = ?, lastModified = ? WHERE scoreID = ?", (scoreName, artistName, tempo, timeSignature, chords, lastModified, scoreID))
    conn.commit()  
    cur.close()
    return 

def change_score_visibility(conn, scoreID, visibility):
    cur = conn.cursor()
    cur.execute("UPDATE scores SET visibility = ? WHERE scoreID = ?", ( visibility, scoreID,))
    conn.commit()  
    cur.close()
    return 

#### SELECT #######
def find_public_scores(conn):
    cur = conn.cursor()
    cur.execute("SELECT scoreID, creatorID, scoreName, artistName, lastModified FROM scores WHERE visibility = 'public'")
    scores = cur.fetchall()  
    
    scores_info = []
    for (scoreID, creatorID, scoreName, artistName, lastModified) in scores:
        cur.execute("SELECT username FROM users WHERE userID = ?", (creatorID,))
        creatorName = cur.fetchone()[0]

        scores_info.append({ 
            "scoreID": scoreID, 
            "creatorID": creatorID,
            "creatorName": creatorName,
            "scoreName": scoreName,
            "artistName": artistName,
            "lastModified": lastModified
        })
    return scores_info

def find_all_users(conn):
    cur = conn.cursor()
    cur.execute("SELECT userID, username, profilePicture FROM users")

    users_info = []
    for (userID, username, profilePicture) in cur:
        users_info.append({ 
            "userID": userID, 
            "username": username,
            "profilePicture": profilePicture
        })
    return users_info

def public_scores_by_user(conn, userID):
    cur = conn.cursor()
    cur.execute("SELECT scoreID, scoreName, artistName, lastModified FROM scores WHERE creatorID = ? AND visibility = 'public'", (userID,))
    scores = []

    for (scoreID, scoreName, artistName, lastModified) in cur:
        scores.append({ 
            "scoreID": scoreID, 
            "scoreName": scoreName, 
            "artistName": artistName,
            "lastModified": lastModified
            })
    
    return scores

def scores_by_user(conn, userID):
    cur = conn.cursor()
    cur.execute("SELECT scoreID, scoreName, artistName, lastModified, visibility FROM scores WHERE creatorID = ?", (userID,))
    scores = []

    for (scoreID, scoreName, artistName, lastModified, visibility) in cur:
        scores.append({ 
            "scoreID": scoreID,
            "scoreName": scoreName, 
            "artistName": artistName,
            "lastModified": lastModified,
            "visibility": visibility
            })
    return scores

def find_score_info(conn, scoreID):
    cur = conn.cursor()
    cur.execute("SELECT creatorID, scoreName, artistName, visibility, creationDate, lastModified, chords, tempo, timeSignature FROM scores WHERE scoreID = ?", (scoreID,))
    score_row = cur.fetchone()
    creatorID, scoreName, artistName, visibility, creationDate, lastModified, chords, tempo, timeSignature = score_row

    cur.execute("SELECT username FROM users WHERE userID = ?", (creatorID,))
    creatorName = cur.fetchone()[0]

    score_info = {
        "scoreID": scoreID,
        "creatorID": creatorID,
        "creatorName": creatorName,
        "scoreName": scoreName,
        "artistName": artistName, 
        "visibility": visibility, 
        "creationDate": creationDate,
        "lastModified": lastModified,
        "chords": chords,
        "tempo": tempo,
        "timeSignature": timeSignature
    }
    return score_info

def find_user_info(conn, userID):
    cur = conn.cursor()
    cur.execute("SELECT username, email, registrationDate, country, userBio, profilePicture FROM users WHERE userID = ?", (userID,))
    user_row = cur.fetchone()
    username, email, registrationDate, country, userBio, profilePicture = user_row

    cur.execute("""SELECT COUNT(followerID) FROM followers WHERE (userID = ?)""", (userID,))
    followersCount = cur.fetchone()[0]

    cur.execute("""SELECT COUNT(userID) FROM followers WHERE followerID = ?""", (userID,))
    followingCount = cur.fetchone()[0]

    user_info = {
        "userID": userID,
        "username": username, 
        "email": email, 
        "registrationDate": registrationDate,
        "country": country,
        "userBio": userBio,
        "profilePicture": profilePicture,
        "followersCount": followersCount,
        "followingCount": followingCount
    }
    return user_info

def find_user_favorites(conn, userID):
    cur = conn.cursor()
    cur.execute("""SELECT scoreID FROM favorites WHERE (userID = ?)""", (userID,))
    favorites = cur.fetchall()

    favorites_info = []
    for favorite in favorites:
        favorites_info.append(find_score_info(conn, favorite[0]))
    return favorites_info

def find_user_followers(conn, userID):
    cur = conn.cursor()
    cur.execute("""SELECT followerID FROM followers WHERE (userID = ?)""", (userID,))
    followers = cur.fetchall()

    followers_info = []
    for follower in followers:
        followerID = follower[0]

        cur.execute("SELECT profilePicture FROM users WHERE userID = ?", (followerID,))
        followerPictureRow = cur.fetchone()

        cur.execute("SELECT username FROM users WHERE userID = ?", (followerID,))
        followerName  = cur.fetchone()[0]

        if followerPictureRow:
            profilePicture = followerPictureRow[0]
            followers_info.append({ 
                "profilePicture": profilePicture, 
                "followerName": followerName,
                "followerID": followerID
            })
    return followers_info

def find_user_is_following(conn, userID):
    cur = conn.cursor()
    cur.execute("""SELECT userID FROM followers WHERE (followerID = ?)""", (userID,))
    following = cur.fetchall()

    following_info = []

    for user in following:
        followerID=user[0]

        cur.execute("SELECT profilePicture FROM users WHERE userID = ?", (followerID,))
        followerPictureRow = cur.fetchone()

        cur.execute("SELECT username FROM users WHERE userID = ?", (followerID,))
        followerName  = cur.fetchone()[0]

        if followerPictureRow:
            profilePicture = followerPictureRow[0]
            following_info.append({ 
                "profilePicture": profilePicture, 
                "followerName": followerName,
                "followerID": followerID
            })

    return following_info


### CHECK ###
def is_user1_following_user2(conn, userID1, userID2):
    cur = conn.cursor()
    cur.execute("""SELECT * FROM followers WHERE (followerID = ? AND userID = ?)""", (userID1, userID2))
    follower = cur.fetchone()
    if follower:
         return True
    else:
        return False

def is_user_owner(conn, creatorID, scoreID):
    cur = conn.cursor()
    cur.execute("""SELECT * FROM scores WHERE (creatorID = ? AND scoreID = ?)""", (creatorID, scoreID))
    isOwner = cur.fetchone()
    if isOwner:
         return True
    else:
        return False

def is_score_favorited(conn, userID, scoreID):
    cur = conn.cursor()
    cur.execute("""SELECT * FROM favorites WHERE (userID = ? AND scoreID = ?)""", (userID, scoreID))
    favorite = cur.fetchone()
    if favorite:
         return True
    else:
        return False

def is_username_taken(conn, username):
    cur = conn.cursor()
    cur.execute("SELECT username FROM users WHERE username = ?", (username,))

    result = cur.fetchone()

    if result:
        return True  
    else:
        return False  

def is_email_taken(conn, email):
    cur = conn.cursor()
    cur.execute("SELECT email FROM users WHERE email = ?", (email,))

    result = cur.fetchone()

    if result:
        return True 
    else:
        return False  

def login_check(conn, username, password):
    cur = conn.cursor()  
    cur.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password,))
    
    result = cur.fetchone()
    
    if result:
        return True
    else:
        return False
    
def select_userID_by_username(conn, username):
    cur = conn.cursor()
    cur.execute("SELECT userID FROM users WHERE username = ?", (username,))
    result = cur.fetchone()
    if result:
        return result[0]  
    return None

def new_userID(conn):
    cur = conn.cursor()
    cur.execute("SELECT MAX(userID) FROM users") 
    result = cur.fetchone()[0]+1
    return result

def new_scoreID(conn):
    cur = conn.cursor()
    cur.execute("SELECT MAX(scoreID) FROM scores") 
    result = cur.fetchone()[0]+1
    return result


#### SETUP ####
def setup():
    conn = create_connection(database)
    if conn is not None:
        create_table(conn, sql_create_users_table)
        create_table(conn, sql_create_scores_table)
        create_table(conn, sql_create_favorites_table)
        create_table(conn, sql_create_followers_table)
        init_users(conn)
        init_scores(conn)
        init_followers(conn)
        init_favorites(conn)
        conn.close()


if __name__ == '__main__':
    setup()

