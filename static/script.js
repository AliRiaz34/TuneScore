//Profile
const profileContainer = document.getElementById('profile-container');
const buttonDiv = document.getElementById('profile-button-div');
const followModal = document.getElementById("follow-modal");
const closeFModalButton = document.getElementById("close-modal");
const modalTable = document.getElementById("modal-table");

//Edit profile
const newPictureInput = document.getElementById('newPicture-input');
const cancelNewPicture = document.getElementById('cancel-picture-button');
const forgotPWForm = document.getElementById('forgotPW-form');
const removeUserModal = document.getElementById('delete-user-modal');


//Score library
const myScoresTable = document.getElementById('myScores-table');
const favoritesTable = document.getElementById('favorites-table');
const removeScoreModal = document.getElementById('delete-score-modal');

//Index
const indexHeading = document.getElementById('index-heading');
const indexScoreTable = document.getElementById('index-score-table');
const indexUsersTable = document.getElementById('index-users-table');

//Score page
const scoreInfoDiv = document.getElementById('score-info-div');
const tempoSlider = document.getElementById('tempo-slider');
const playButton = document.getElementById("play-button");
const bpmValue = document.getElementById("bpm-value");
const volumeSlider = document.getElementById('volume');
const transposeInput = document.getElementById('transpose-input');
const scoreTitleDiv = document.getElementById('score-title-div');

let selectedChord;
let flatScoreArray;
let flatScoreElementArray;
let isPlaying = false;
let isPlayBack = false;

//Score editor
const scoreEditorTable = document.getElementById('sEditor-table');
const saveScoreEditButton = document.getElementById('sEditor-save-button');

//Search
const queryInput = document.getElementById('query');
const searchResultTable = document.getElementById("search-result-table");

let sortDirection = ["0:ascend", "0:ascend", "0:ascend"];
let followID = [];
let scoresID = [];
let favoritesID = [];

document.addEventListener('DOMContentLoaded', function () {
    if (profileContainer) {
        let followersLink = document.getElementById('followers-modal');
        let followingLink = document.getElementById('following-modal');
        let modalHead = document.getElementById("modal-head");
        let SessionUserID = parseInt(document.getElementById('SessionUserID').value);
        let profileID = parseInt(document.getElementById('ProfileID').value);
        profileButtons(profileID, SessionUserID);

        followersLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            followModal.showModal();
            modalHead.innerText = "Followers";
            loadModal(profileID, SessionUserID, 'followers');
        })

        followingLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            followModal.showModal();
            modalHead.innerText = "Following";
            loadModal(profileID, SessionUserID, 'following');
        })

        closeFModalButton.addEventListener("click", () => {
            followModal.close();
        });
    }

    if (forgotPWForm) {
        verifyForgotPW();
    }

    if (indexHeading) {
        loadIndexHead();
    }

    if (indexScoreTable) {
        loadScores("index");
        loadUsers();
    }

    if (myScoresTable) {
        loadScores("myScores");
        loadScores("favorites");
    }

    if (newPictureInput) {
        verifyNewPicture();
    }

    if (scoreInfoDiv) {
        let scoreID = parseInt(document.getElementById('scoreID').value);
        updatePlaybar();
        scoreButtons(scoreID);
        loadScorePage(scoreID);
    }

    if (scoreEditorTable) {
        let scoreID = parseInt(document.getElementById('scoreID').value);
        let helplink = document.getElementById('help-link');
        let closeHelpButton = document.getElementById("close-help-modal");
        let helpModal = document.getElementById("help-modal");

        helplink.addEventListener('click', function() {
            helpModal.showModal();
        })

        closeHelpButton.addEventListener('click', function() {
            helpModal.close();
        })

        updatePlaybar();
        loadScoreEditor(scoreID);
    }

    if (queryInput) {
        let queryValue = queryInput.value;
        loadSearchResult(queryValue);
    }
})


//CREATE HTML ELEMENTS
function createLink(innerHTML, id, className, href, parent) {
    let link = document.createElement('a');
    link.innerHTML = innerHTML;
    link.id = id;
    link.className = className;
    link.href = href;
    parent.appendChild(link);
    return(link);
}

function createButton(innerHTML, className, id, type) {
    let button = document.createElement('button');
    button.innerHTML = innerHTML;
    button.id = id;
    button.type = type;
    button.className = className;
    return(button)
}

function createImage(src, className) {
    let image = document.createElement('img');
    image.src = src;
    image.alt = 'pfp';  
    image.className = className;
    return( image);
}

function createUnfollowButton(SessionUserID, profileID, followerID, parent) {
    if (SessionUserID !== followerID) {
        let unfollowButton; 

        if (profileID === followerID) {
            unfollowButton = createButton('unfollow', 'profile-unfollow-button', 'unfollow-${followerID}'); 
        } else {
            unfollowButton = createButton('unfollow', 'modal-remove-button', 'unfollow-${followerID}'); 
        }

        unfollowButton.addEventListener('click', function() {   
            fetch(`/users/${SessionUserID}/following-info`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ unfollowedUserID: followerID })
            })
                .then(response => response.json())
                .then(unfollowedUserID => {
                    parent.innerHTML = "";
                    createFollowButton(SessionUserID, profileID, unfollowedUserID, parent);
                })
            })  
        parent.appendChild(unfollowButton);
    }
}

function createFollowButton (SessionUserID, profileID, followerID, parent) {
    if (SessionUserID !== followerID) {
        let followButton;
        if (profileID === followerID) {
            followButton = createButton('follow', 'profile-follow-button', 'follow-${followerID}'); 
        } else {
            followButton = createButton('follow', 'modal-follow-button', 'follow-${followerID}'); 
        }
        
        followButton.addEventListener('click', function () {   
            fetch(`/users/${SessionUserID}/following-info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ followedUserID: followerID })
            })
                .then(response => response.json())
                .then(followedUserID => {
                    parent.innerHTML = "";
                    createUnfollowButton (SessionUserID, profileID, followedUserID, parent);
                })
        })   
        parent.appendChild(followButton);
    }
}

function createFavoriteButton (scoreID) {
    let favoriteButton = createButton('', 'favorite-button', 'favorite-${scoreID}'); 

    favoriteButton.addEventListener('click', function () {
        fetch(`/scores/${scoreID}/favorites `, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ scoreID: scoreID})
        })
            .then(response => response.json())
            .then(favoritedScoreID => {
                scoreTitleDiv.removeChild(scoreTitleDiv.lastChild);
                createUnfavoriteButton(favoritedScoreID);
            })
    })   
    scoreTitleDiv.appendChild(favoriteButton);
}

function createUnfavoriteButton (scoreID) {
    let unfavoriteButton = createButton('', 'unfavorite-button', 'unfavorite-${scoreID}'); 

    unfavoriteButton.addEventListener('click', function () {
        fetch(`/scores/${scoreID}/favorites `, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ scoreID: scoreID})
        })
            .then(response => response.json())
            .then(unfavoritedScoreID => {
                scoreTitleDiv.removeChild(scoreTitleDiv.lastChild);
                createFavoriteButton(unfavoritedScoreID);
            })
    })   
    scoreTitleDiv.appendChild(unfavoriteButton);
}

function checkIfEmpty(array, table) {
    if (array.length == 0) {
        table.style.visibility = "hidden";
        table.children[0].style.display = "none";
        table.children[1].style.display = "none";
        let emptyText = document.createElement("p");
        emptyText.innerText = "none found";
        emptyText.style.fontSize = "1.3em";
        emptyText.style.paddingLeft = "20px";
        emptyText.style.margin = "0px";
        table.appendChild(emptyText);
        emptyText.style.visibility = "visible";
        return true;
    } else {
        return false;
    }
}

//UPDATE SPANS
function updateBioCount() {
    let textarea = document.getElementById('userBio');
    let charCountDisplay = document.getElementById('charCount');
    let characters = textarea.value.length;
    charCountDisplay.textContent = `${characters}/200`;
}

function updateNameCount() {
    let usernameForm = document.getElementById('username');
    let nameCountDisplay = document.getElementById('nameCount');
    let characters = usernameForm.value.length;
    nameCountDisplay.textContent = `${characters}/12`;
}

function updatePlaybar() {
    let tempoText = document.getElementById('tempo-value');
    let originalBPM = 0;
    let resetTempoButton = document.getElementById("reset-tempo-button");
    tempoText.innerHTML = parseFloat(tempoSlider.value/100).toFixed(2);
    

    tempoSlider.oninput = function() {
        if (document.getElementById("score-header-bpm")) {
            originalBPM = parseInt(document.getElementById("score-header-bpm").innerHTML.split(": ")[1]);
        }
        tempoText.innerHTML = parseFloat(tempoSlider.value/100).toFixed(2);
        bpmValue.value = parseFloat(tempoSlider.value/100 * originalBPM).toFixed(0);
    }

    resetTempoButton.onclick = function() {
        if (document.getElementById("score-header-bpm")) {
            originalBPM = parseInt(document.getElementById("score-header-bpm").innerHTML.split(": ")[1]);
        }
        tempoText.innerHTML = 1.00.toFixed(2);
        tempoSlider.value = 100;
        document.getElementById('bpm-value').value = originalBPM;
    }

    let resetTransposeButton = document.getElementById("reset-transpose-button");

    resetTransposeButton.onclick = function() {
        transposeInput.value = 0;
    }

    let volumeButton = document.getElementById("volume-button");
    let lastVolume = getCookie("volumeValue");

    if (lastVolume) {
        volumeSlider.value = lastVolume;
    }

    volumeSlider.addEventListener('input', function () {
        lastVolume = volumeSlider.value;
        volumeButton.className = "volume-button";
        if (lastVolume == 0) {
            volumeButton.className = "muted-volume-button";
        } 
        updateCookie("volumeValue", lastVolume);
    })

    volumeButton.onclick = function() {
        if (volumeSlider.value == 0){
            volumeSlider.value = lastVolume;
            if (lastVolume != 0) {
                volumeButton.className = "volume-button";
            } else {
                volumeButton.className = "muted-volume-button";
            }
        } else if (volumeSlider.value != 0) {
            volumeSlider.value = 0;
            volumeButton.className = "muted-volume-button";
        }
    }

    
    playButton.addEventListener("click", function() {
        isPlaying = !isPlaying;

        if (isPlaying) {
            playButton.innerHTML = "STOP";
            playButton.style.backgroundColor = "rgb(206, 105, 105)";
            playBack(parseInt(transposeInput.value));
        }
        else {
            playButton.innerHTML = "PLAY";
            playButton.style.backgroundColor = "rgb(45, 168, 93)";
        }
    });

}


//LOAD ELEMENTS
function loadIndexHead() {
    fetch(`/users/session`)
    .then(response => response.json())
    .then(user_info => {
        createLink("Tune score","", "menu-link", `/`, indexHeading.children[0]);
        
        let searchbarForm = document.createElement("form");
        searchbarForm.method = "GET";
        let searchbar = document.createElement("input");
        searchbar.type="text";
        searchbar.placeholder="search score or artist";
        searchbar.id="searchbar-menu";
        searchbarForm.appendChild(searchbar);


        searchbar.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchbarForm.action = `/search/${searchbar.value}`;
                searchbarForm.submit();
            }
        });
        indexHeading.children[1].appendChild(searchbarForm);

        if (user_info == false) {
            indexHeading.children[1].id = "index-heading-right";
            let loginButton = createButton("Login", "menu-button", "", "");
            let loginLink = createLink("","", "", `/login`, indexHeading.children[1]);
            loginLink.appendChild(loginButton);
            let signupButton = createButton("Sign up", "menu-button", "", "");
            let signupLink = createLink("","", "", `/signup`, indexHeading.children[1]);
            signupLink.appendChild(signupButton);

        } else {
            indexHeading.children[1].id = "index-heading-right";
            createLink("Scores library","", "menu-link", `/users/session/scores`, indexHeading.children[0]);
            let editScoreButton = createButton("+ new score","menu-button","","");
            let editScoreLink = createLink("","", "", `/score-editor/${0}`, indexHeading.children[1]);
            editScoreLink.appendChild(editScoreButton); 
            editScoreButton.style.fontSize = "1em";
            editScoreButton.style.marginTop = "18px";
            editScoreButton.style.padding = "6px";
            editScoreButton.style.border = "0px";

            let profilePicture = createImage(`/static/images/${user_info.profilePicture}`, 'menu-pfp');
            let profilePictureLink = createLink("","", "", `/profile/${user_info.userID}`, indexHeading.children[1]);
            profilePicture.style.marginLeft = "30px";
            profilePicture.style.marginRight = "10px";

            profilePictureLink.appendChild(profilePicture);

            let logoutButton = createButton("Log out", "menu-button-logout", "", "");

            let logoutLink = createLink("","", "", `/logout`, indexHeading.children[1]);
            logoutLink.appendChild(logoutButton);
        }
    })
}

function loadScores(which) {
    let table;
    let sortCookieTable;
    if (which == "index") {
        fetchURL = `/scores/public`;
        table = indexScoreTable;
        sortCookieTable = 0;
    } else if (which == "myScores") {
        fetchURL = `/users/session/scores-info`;
        table = myScoresTable;
        sortCookieTable = 1;
    }
    else if (which == "favorites") {
        fetchURL = `/users/session/favorites-info`;
        table = favoritesTable;
        sortCookieTable = 2;
    }

    fetch(fetchURL)
    .then(response => response.json())
    .then(scores_info => {   
        if (checkIfEmpty(scores_info, table) == true) {
        } else {
            scores_info.forEach(function(score) {
                let newScoreRow = table.children[1].insertRow();

                for (let i = 0; i < 4; i++) {
                    let newCell = newScoreRow.insertCell(); 
                    newCell.className = 'score-td';
                }   
                
                createLink(score.artistName,"", "", `/search/${score.artistName}`, newScoreRow.cells[0]);
                newScoreRow.cells[0].width = "25%";
                createLink(score.scoreName,"", "", `/scores/${score.scoreID}`, newScoreRow.cells[1]);
                newScoreRow.cells[1].width = "40%";
                let dateEmtpyLink = createLink(score.lastModified,"", "", `#`, newScoreRow.cells[2]);
                dateEmtpyLink.style.textDecoration = "none";
                dateEmtpyLink.style.cursor = "inherit";

                if (which == "index") {
                    scoresID.push(score.scoreID);
                    createLink(score.creatorName,"", "", `/profile/${score.creatorID}`, newScoreRow.cells[3]);
                } else if (which == "favorites"){
                    favoritesID.push(score.scoreID);

                    let newCell = newScoreRow.insertCell(); 
                    newCell.className = 'score-td';
                    createLink(score.creatorName,"", "", `/profile/${score.creatorID}`, newScoreRow.cells[3]);
                    
                    let unfavoriteButton = createButton("", "favorite-button", "unfavorite-${score.scoreID}", ""); 
                    unfavoriteButton.style.marginRight = "15px";
                    unfavoriteButton.addEventListener('click', function() {
                        unfavoriteScore(score.scoreID, table);
                    })
                    newScoreRow.cells[4].appendChild(unfavoriteButton);
                    newScoreRow.cells[4].style.textAlign = "right";
                    newScoreRow.cells[4].width = "30px";
                } else if (which == "myScores") {  
                    scoresID.push(score.scoreID);
                    let newCell = newScoreRow.insertCell(); 
                    newCell.className = 'score-td';

                    let visibilityBox = document.createElement('input');
                    visibilityBox.id = `visibility-${score.scoreID}`;
                    visibilityBox.type = 'checkbox';
                    visibilityBox.className = 'visibility-box';

                    let newVisibility;
                    if (score.visibility == "public") {
                        visibilityBox.checked = false; 
                        newVisibility = "private";     
                    } else if (score.visibility == "private") {
                        visibilityBox.checked = true;
                        newVisibility = "public"; 
                    }

                    visibilityBox.addEventListener('click', function() {  
                        fetch(`/score/${score.scoreID}/visibility`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ visibility: newVisibility })
                        })
                            .then(response => response.json())
                            .then(serverVisibility => { 
                            if (serverVisibility == "public") {
                                visibilityBox.checked = false; 
                                newVisibility = "private";     
                            } else if (serverVisibility == "private") {
                                visibilityBox.checked = true;
                                newVisibility = "public"; 
                            }
                            score.visibility = serverVisibility;
                        })
                    })  
                    newScoreRow.cells[3].appendChild(visibilityBox);

                    newCell = newScoreRow.insertCell(); 
                    newCell.className = 'score-td';

                    let editScoreButton = createButton("","edit-score-button",`edit-${score.scoreID}`,"");
                    let editScoreLink = createLink("", "", "", `/score-editor/${score.scoreID}`, newScoreRow.cells[4]);
                    editScoreLink.appendChild(editScoreButton); 

                    let deleteButton = createButton("", "deleteButton", "deleteButton-${score.scoreID}", ""); 
                    deleteButton.addEventListener('click', function() {
                        removeScoreModal.showModal();
                        verifyScoreRemove(score.scoreID, table);
                    })
                    newScoreRow.cells[5].style.textAlign = "right";
                    newScoreRow.cells[5].width = "30px";
                    newScoreRow.cells[5].appendChild(deleteButton);
                }        
            })
            let sortCookie = getCookie("sortValue:" + sortCookieTable);
            if (sortCookie) {
                sortDirection[sortCookieTable] = sortCookie;
                sortScores(sortCookie.split(":")[0], sortCookieTable);
            } 
        }
          
    })
}

function verifyScoreRemove(scoreID) {
    let removeScoreModalDiv = document.getElementById('delete-score-modal-div');
    removeScoreModalDiv.innerHTML = "";
    let confirmButton = createButton("confirm", "verifyButton", "confirmButton", ""); 
    let cancelButton = createButton("cancel", "verifyButton", "cancelButton", "");

    removeScoreModalDiv.appendChild(confirmButton);
    removeScoreModalDiv.appendChild(cancelButton);

    confirmButton.addEventListener('click', function() {
        removeScore(scoreID);
        removeScoreModal.close();
    })

    cancelButton.addEventListener('click', function() {
        removeScoreModal.close();
    })
}

function loadUsers() {
    fetch(`/users`)
        .then(response => response.json())
        .then(users_info => {
            users_info.forEach(function(user) {
                let newUserRow = indexUsersTable.insertRow();
                
                let pictureCell =  newUserRow.insertCell(); 
                pictureCell.className = 'follow-td-icon';

                let nameCell =  newUserRow.insertCell(); 
                nameCell.className = 'follow-td';
                
                let userPicture = createImage(`/static/images/${user.profilePicture}`, 'follower-icon'); 
                let userPictureLink = createLink("","", "", `/profile/${user.userID}`, newUserRow.cells[0]);
                userPictureLink.appendChild(userPicture);

                createLink(user.username,"", "", `/profile/${user.userID}`, newUserRow.cells[1]);
            })
        })
}

function loadModal(profileID, SessionUserID, which) {
    followID = [];
    modalTable.innerHTML = "";

    if (which == "followers") {
        fetchURL = `/users/${profileID}/followers-info`;
    } else if (which == "following") {
        fetchURL = `/users/${profileID}/following-info`;
    }

    fetch(fetchURL)
        .then(response => response.json())
        .then(users => {
            if (users != false) {
                users.forEach(function(user) {
                    let newFollowRow = modalTable.insertRow();
                    followID.push(user.followerID);
                    
                    let iconCell = newFollowRow.insertCell(); 
                    iconCell.className = 'follow-td-icon';
        
                    let nameCell = newFollowRow.insertCell(); 
                    nameCell.className = 'follow-td';
        
                    let unfollowCell = newFollowRow.insertCell(); 
                    unfollowCell.className = 'follow-td-unfollow';
                    
                    let imageElement = createImage(`/static/images/${user.profilePicture}`, 'follower-icon');      
                    let profilePictureLink = createLink("", "", "", `/profile/${user.followerID}`, newFollowRow.cells[0]);
                    profilePictureLink.appendChild(imageElement);
        
                    createLink(user.followerName, "", "", `/profile/${user.followerID}`, newFollowRow.cells[1]);
                    
                    fetch(`/users/${user.followerID}/follow-status`) 
                        .then(response => response.json()) 
                        .then(isFollowing => {
                            if (isFollowing === true) {
                                createUnfollowButton(SessionUserID, profileID, user.followerID, newFollowRow.cells[2]);
                            } else {
                                createFollowButton(SessionUserID, profileID, user.followerID, newFollowRow.cells[2]);
                            }
                        })
        
                        if (which == "followers") {
                            if (profileID === SessionUserID) {
                                let removeCell = newFollowRow.insertCell(); 
                                removeCell.className = 'follow-td-remove';
        
                                let removeButton = createButton('remove', 'modal-remove-button', 'remove-${user.followerID}');
                                
                                removeButton.onclick = function() {  
                                    removeFollower(user.followerID, SessionUserID);
                                }
                                newFollowRow.cells[3].appendChild(removeButton);
                            }   
                        }
                    })
            }
           
        })
}

// scoreID = 0 means new undefined score 
function loadScoreEditor(scoreID) {
    let scoreEditorH2 = document.getElementById("sEditor-h2");
    let scoreEditorHead = document.getElementById("sEditor-head");
    
    fetch(`/users/session/scores-info`)
    .then(response => response.json())
    .then(scores_info => { 
        scores_info.forEach(function(score) {
            let newScoreRow = scoreEditorTable.children[0].insertRow();
            scoresID.push(score.scoreID);

            let newCell1 = newScoreRow.insertCell(); 
            newCell1.className = 'score-td';

            let newCell2 = newScoreRow.insertCell(); 
            newCell2.className = 'score-td';
            newCell2.style.width = "30px";
            newCell2.style.padding = "0px";

            createLink(score.scoreName, `score-link-${score.scoreID}`, "", `/scores/${score.scoreID}`, newScoreRow.cells[0]);
            
            let editScoreButton = createButton("","edit-score-button",`edit-${score.scoreID}`,"");
            let editScoreLink = createLink("", `edit-link-${score.scoreID}`, "", `/score-editor/${score.scoreID}`, newScoreRow.cells[1]);
            editScoreLink.appendChild(editScoreButton); 

            if (scoresID.includes(scoreID)) {
                document.getElementById(`edit-${scoreID}`).style.display = "none";
                document.getElementById(`score-link-${scoreID}`).style.textDecoration = "underline";
            }
        })
        checkIfEmpty(scoresID, scoreEditorTable);

        if (scoreID == 0) {
            scoreEditorH2.innerHTML = `New score`;

            document.getElementById("songname-input").value = "";
            document.getElementById("artist-input").value = "";
            document.getElementById("tempo-input").value = "";
            document.getElementById("time-signature-input").value = "";
            document.getElementById("chords-input").value = "";

            document.getElementById("songname-input").placeholder = "Nutshell";
            document.getElementById("artist-input").placeholder = "Alice in Chains";
            document.getElementById("tempo-input").placeholder = "136";
            document.getElementById("time-signature-input").placeholder = "3";
            document.getElementById("chords-input").placeholder = "AbMmaj7:4 FMdom7:4 BbMdom7:4 BbMdom7:4 Bbmdom7:4 EbMdom7:4 AbMmaj7:4";

        } else {
            let newScoreButton = createButton("+","","sEditor-new-button","");
            let newScoreLink = createLink("", "", "", `/score-editor/${0}`, scoreEditorHead);
            newScoreLink.appendChild(newScoreButton); 

            fetch(`/score/${scoreID}/info`)
            .then(response => response.json())
            .then(score_info => { 
                scoreEditorH2.innerHTML = `${score_info.scoreName} - ${score_info.artistName}`;
    
                document.getElementById("songname-input").value = score_info.scoreName;
                document.getElementById("artist-input").value = score_info.artistName;
                document.getElementById("tempo-input").value = score_info.tempo;
                document.getElementById("bpm-value").value = score_info.tempo;
                document.getElementById("time-signature-input").value = score_info.timeSignature;
                document.getElementById("chords-input").value = score_info.chords;

                refresh("chords-output-div", score_info.chords, score_info.scoreName, score_info.artistName, String(score_info.tempo), String(score_info.timeSignature));
            })
        }
    })
}  

function loadSearchResult(queryValue) {
    fetch(`/scores/public`)
    .then(response => response.json())
    .then(scores_info => {   
        let validScores = [];

        for (let i = 0; i < scores_info.length; i++) {
            if (scores_info[i].scoreName.toUpperCase().includes(queryValue.toUpperCase()) || scores_info[i].artistName.toUpperCase().includes(queryValue.toUpperCase()) ) {
                validScores.push({
                    scoreName: `${scores_info[i].scoreName}`,
                    scoreID: `${scores_info[i].scoreID}`,
                    artistName: `${scores_info[i].artistName}`
                });
            } 
        }
        
        if (checkIfEmpty(validScores, searchResultTable) == true) {
        } else {
            validScores.forEach(function(score) {
                let newScoreRow = searchResultTable.children[1].insertRow();

                for (let i = 0; i < 2; i++) {
                    let newCell = newScoreRow.insertCell(); 
                    newCell.className = 'score-td';
                }   
                
                newScoreRow.cells[0].innerHTML = score.artistName;
                newScoreRow.cells[0].width = "35%";
                createLink(score.scoreName,"", "", `/scores/${score.scoreID}`, newScoreRow.cells[1])
                newScoreRow.cells[1].width = "60%";             
            })
        }   
    })
}

function loadScorePage(scoreID) {
    fetch(`/score/${scoreID}/info`)
    .then(response => response.json())
    .then(score_info => { 
        refresh("score-chords-div", score_info.chords, score_info.scoreName, score_info.artistName, String(score_info.tempo), String(score_info.timeSignature));
    })
}

function patchScoreEdit(event) {
    event.preventDefault();
    let scoreSaveForm = document.getElementById("sEditor-form");
    let scoreID = parseInt(document.getElementById('scoreID').value);
    let scoreName = document.getElementById("songname-input").value; 
    let artistName = document.getElementById("artist-input").value; 
    let tempo = document.getElementById("tempo-input").value; 
    let timeSignature = document.getElementById("time-signature-input").value;
    let chords = document.getElementById("chords-input").value; 

    bpmValue.value = parseFloat(tempoSlider.value/100 * parseInt(tempo)).toFixed(0);

    if (isPlaying) {
        isPlaying = !isPlaying;
    }

    if (scoreID == 0) {
        scoreSaveForm.submit()
    } else {
        fetch(`/score-editor/${scoreID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                scoreName: scoreName,
                artistName: artistName,
                tempo: tempo,
                timeSignature: timeSignature,
                chords: chords
            })
        })
    }

    fetch(`/score-editor/${scoreID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            scoreName: scoreName,
            artistName: artistName,
            tempo: tempo,
            timeSignature: timeSignature,
            chords: chords
        })
    })
    refresh("chords-output-div", chords, scoreName, artistName, tempo, timeSignature);
}

//FETCHES
function removeFollower(followerID, SessionUserID) {
    fetch(`/users/${SessionUserID}/followers-info`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followerID: followerID })
    })
    .then(response => response.json())
    .then(removedFollowerID => {
        let index = followID.indexOf(parseInt(removedFollowerID));
        followID.splice(index, 1);
        modalTable.children[0].deleteRow(index);
    })
}

function unfavoriteScore(scoreID) {
    fetch(`/scores/${scoreID}/favorites`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scoreID: scoreID })
    })
    .then(response => response.json())
    .then(unfavoritedScoreID => {
        let index = favoritesID.indexOf(parseInt(unfavoritedScoreID));
        favoritesID.splice(index, 1);
        favoritesTable.children[1].deleteRow(index);
        checkIfEmpty(favoritesID, favoritesTable);
    })
}

function removeScore(scoreID) {
    fetch(`/users/session/scores-info`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scoreID: scoreID })
    })
    .then(response => response.json())
    .then(removedscoreID => {
        let index = scoresID.indexOf(parseInt(removedscoreID));
        scoresID.splice(index, 1);
        myScoresTable.children[1].deleteRow(index);

        if (favoritesID.includes(removedscoreID) == true) {
            let index = favoritesID.indexOf(parseInt(removedscoreID));
            favoritesID.splice(index, 1);
            favoritesTable.children[1].deleteRow(index);
        } 
        checkIfEmpty(scoresID, myScoresTable);
    })
}

function profileButtons(profileID, SessionUserID) {
    fetch(`/users/${profileID}/follow-status`) 
        .then(response => response.json()) 
        .then(isFollowing => {
            if (isFollowing === true) {
                createUnfollowButton (SessionUserID, profileID, profileID, buttonDiv);
            } else {
                createFollowButton (SessionUserID, profileID, profileID, buttonDiv);
            }
        })

    if (SessionUserID === profileID) {
        let editProfileButton = createButton('Edit profile', 'profile-follow-button', "", 'submit');

        let editButtonForm = document.createElement('form');
        editButtonForm.action = `/users/${SessionUserID}`;
        editButtonForm.className = 'profile-button-form';
        editButtonForm.method = 'GET';
        editButtonForm.appendChild(editProfileButton);
    
        buttonDiv.appendChild(editButtonForm);
    }
}

function scoreButtons(scoreID) {
    fetch(`/users/session`) 
    .then(response => response.json()) 
    .then(info => {
        if (info === false) {
        } else {
            fetch(`/scores/${scoreID}/favorites`) 
            .then(response => response.json()) 
            .then(isFavorited => {
                if (isFavorited === true) {
                    createUnfavoriteButton(scoreID);
                } else {
                    createFavoriteButton(scoreID);
                }
            })

            fetch(`/users/session/scores/${scoreID}/ownership`) 
            .then(response => response.json()) 
            .then(isOwner => {
                if (isOwner === true) {
                    let scoreHeadDiv = document.getElementById("score-head");
                    let editScoreButton = createButton("","edit-score-button",`edit-${scoreID}`,"");
                    editScoreButton.style.marginLeft = "30px";
                    editScoreButton.style.marginTop = "6px";
            
                    let editScoreLink = createLink("", "", "edit-score-link", `/score-editor/${scoreID}`, scoreHeadDiv);
                    editScoreLink.appendChild(editScoreButton);
                } 
            })
        }   
    })    
}


//SORT AND SEARCH
function search(table) {
    let input;
    if (table == indexScoreTable) {
        input = document.getElementById("searchbarSongs");
    }
    if (table == indexUsersTable || table == modalTable ) {
        input = document.getElementById("searchbarUsers");
    }
    
    let filter = input.value.toUpperCase();
    let tr = table.getElementsByTagName("tr");

    for (let i = 0; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName("td")[1];
        if (td) {
          let txtValue = td.textContent;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
        }
      }
    }
}


function sortScores(n, which) {
    setCookie("sortValue:" + String(which), String(n) + ":" + sortDirection[which].split(":")[1]);

    let scoreObjects = [];
    let tableToSortDict = [indexScoreTable, myScoresTable, favoritesTable];
    let tableToSort = tableToSortDict[which];
    let tableheads = tableToSort.children[0].children[0].children;

    if (!tableToSort.originalHeads) {
        tableToSort.originalHeads = {};
        for (let i = 0; i < tableheads.length; i++) {
            tableToSort.originalHeads[i] = tableheads[i].innerHTML;
        }
    }
      
    for (let row = 0; row < tableToSort.children[1].children.length; row++) {
        scoreObjects[row] = {};
        for (let cell = 0; cell < tableheads.length; cell++) {
            scoreObjects[row][cell] = tableToSort.children[1].children[row].children[cell].children[0];
        }
    }

    for (let th = 0; th < tableheads.length; th++) {
        if (th !== n) {
            tableheads[th].innerHTML = tableToSort.originalHeads[th];
        } 
    }
    
    let currentHeader = tableheads[n];
    let originalHead = tableToSort.originalHeads[n];

    if (sortDirection[which].split(":")[1] == "ascend") {
        currentHeader.innerText = `${originalHead} ▴`;
        scoreObjects.sort((a, b) => (a[n].innerHTML > b[n].innerHTML) ? 1 : (a[n].innerHTML < b[n].innerHTML) ? -1 : 0);
        sortDirection[which] = String(n) + ":descend";
    }
    else {
        currentHeader.innerText = `${originalHead} ▾`;
        scoreObjects.sort((a, b) => (a[n].innerHTML < b[n].innerHTML) ? 1 : (a[n].innerHTML > b[n].innerHTML) ? -1 : 0);
        sortDirection[which] = String(n) + ":ascend";
    }
       
    for (let row = 0; row < tableToSort.children[1].children.length; row++) {
        for (let m = 0; m < tableheads.length; m++) {
            
            tableToSort.children[1].children[row].children[m].innerHTML = "";
            tableToSort.children[1].children[row].children[m].append(scoreObjects[row][m]);
        } 
    }
}


//AUTHENTICATION
async function verifySignup(event) {
    event.preventDefault();
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;

    fetch(`/info-check?email=${email}&username=${username}`)
    .then(response => response.json())
    .then(validDict  => {
        let isEmailTaken = validDict.email;
        let isUsernameTaken = validDict.username;

        let password = document.getElementById('password').value;
        let confirmPassword = document.getElementById('confirmPassword').value;
        let errorText = document.getElementById('errorText');

        errorText.innerText = "";

        if (password != confirmPassword) {
            errorText.innerText = "Passwords dont match.";
            document.getElementById('password').value = "";
            document.getElementById('confirmPassword').value = "";
            return false;
        } 

        if (password.length < 5) {
            errorText.innerText = "Password is too short.";
            document.getElementById('password').value = "";
            document.getElementById('confirmPassword').value = "";
            return false;
        } 

        if (isEmailTaken == true) {
            errorText.innerText = "Email is already in use, log in instead";
            return false;
        } 

        if (isUsernameTaken == true) {
            errorText.innerText = "Username is already taken.";
            return false;
        } 
        document.getElementById('signup').submit();
    })
}

async function verifyEdit(event) {
    event.preventDefault();
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;

    fetch(`/info-check?email=${email}&username=${username}`)
        .then(response => response.json())
        .then(validDict  => {
            let isEmailTaken = validDict.email;
            let isUsernameTaken = validDict.username;
            let errorText = document.getElementById('errorText');
            errorText.innerText = "";

            fetch(`/users/session`)
            .then(response => response.json())
            .then(user_info  => {
                let oldUsername = user_info.username;
                let oldEmail = user_info.email;

                if (oldEmail != email){
                    if (isEmailTaken) {
                        errorText.innerText = "Email is already taken.";
                        return false;
                    } 
                }
                    
                if (oldUsername != username){
                    if (isUsernameTaken) {
                        errorText.innerText = "Username is already taken.";
                        return false;
                    } 
                }
                document.getElementById('editProfile-form').submit();
            }) 
        })
}

function verifyUserRemove(event) {
    event.preventDefault();
    removeUserModal.showModal();
    let SessionUserID = document.getElementById('SessionUserID').value;

    let removeUserModalDiv = document.getElementById('delete-user-modal-div');
    removeUserModalDiv.innerHTML = "";
    let confirmButton = createButton("confirm", "verifyButton", "confirmButton", ""); 
    let cancelButton = createButton("cancel", "verifyButton", "cancelButton", "");

    removeUserModalDiv.appendChild(confirmButton);
    removeUserModalDiv.appendChild(cancelButton);

    confirmButton.addEventListener('click', function() {
        fetch(`/users/${SessionUserID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userID: SessionUserID })
        })
        .then(response => response.json())
        .then(data => {
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            }
        })
        removeUserModal.close();    
    })

    cancelButton.addEventListener('click', function() {
        removeUserModal.close();
    })

}

async function verifyLogin(event) {
    event.preventDefault();
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    fetch(`/login-check?username=${username}&password=${password}`)
    .then(response => response.json())
    .then(loginValid  => {
        let errorText = document.getElementById('errorText');
        errorText.innerText = "";

        if (loginValid == false) {
            errorText.innerText = "Invalid username/password";
            document.getElementById('password').value = "";
        } else {
            document.getElementById('login').submit();
        }
    });
}

function verifyForgotPW() {
    let errorText = document.getElementById('errorText');
    errorText.innerText = "";

    let forgotPWButton = document.getElementById('forgotPW-button');

    forgotPWButton.onclick = function() {  
        let email = document.getElementById('email-input').value;
        fetch(`/info-check?email=${email}`)
            .then(response => response.json())
            .then(validDict  => {
                isEmailTaken = validDict.email;

            if (isEmailTaken == false) {
                errorText.innerText = "Email not recognized.";
                errorText.style.color = "darkred";
            } 
            
            if (isEmailTaken == true){
                errorText.innerText = "Password reset link has been sent";
                errorText.style.color = "darkseagreen";
            }   
        })
    }   
}

function verifyNewPicture() {
    newPictureInput.addEventListener('change', function(){
        let picture = newPictureInput.files[0];
        let pictureIMG = document.getElementById('profile-edit-icon');
        let originalPicture = document.getElementById('originalPicture').value;
        let filename = picture.name;
        let errorText = document.getElementById('errorText');
    
        if (picture && allowed_extension(filename.split('.')[1])) {
            pictureIMG.src = URL.createObjectURL(picture);
            errorText.innerText = "";
        }   
        else {
            errorText.innerText = "Invalid file";
            pictureIMG.src = originalPicture;
            newPictureInput.value = "";
        }
    
    })
    
    cancelNewPicture.addEventListener('click', function() {
        let originalPicture = document.getElementById('originalPicture').value;
        let pictureIMG = document.getElementById('profile-edit-icon');
    
        pictureIMG.src = originalPicture;
        newPictureInput.value = "";
    })
}

function allowed_extension(extension){
    const allowed_extensions = ["png", "jpg", "jpeg"];
    return allowed_extensions.includes(extension.toLowerCase());
}

class Chord {

    constructor(textChord, duration, notes, root, rootAccidental, triad, extension, extensionNumber, addNote, accidentalNotes) {
        this.textChord = textChord;
        this.duration = duration;
        this.notes = notes;
        this.root = root;
        this.rootAccidental = rootAccidental;
        this.triad = triad;
        this.extension = extension;
        this.extensionNumber = extensionNumber;
        this.addNote = addNote;
        this.accidentalNotes = accidentalNotes;
    }

    displayProperties() {
        console.log(`Text Chord: ${this.textChord}`);
        console.log(`Duration: ${this.duration}`);
        console.log(`Notes: ${this.notes}`);
        console.log(`Root: ${this.root}`);
        console.log(`Root Accidental: ${this.rootAccidental}`);
        console.log(`Triad: ${this.triad}`);
        console.log(`Extension: ${this.extension}`);
        console.log(`Extension Number: ${this.extensionNumber}`);
        console.log(`Add Note: ${this.addNote}`);
        console.log(`Accidental Notes: ${this.accidentalNotes}`);
    }

    playNotes(transpose) { // Play chord
        let playNotes = this.notes;
        if (transpose != 0) {
            playNotes = playNotes.map(note => note + transpose);
        }

        let notes = {};

        for (let i = -12; i < 36; i++) {
            if (i < 0) {
                notes["m" + Math.abs(i)] = document.getElementById("note_m" + String(Math.abs(i)));
            }
            else {
                notes[String(i)] = document.getElementById("note_" + String(i));
            }
        }
        
        playNotes.forEach(note => {
            let noteToPlay;
            if (note < 0) {
                noteToPlay = notes["m" + String(Math.abs(note))];
            }
            else {
                noteToPlay = notes[String(note)];
            }
            noteToPlay.currentTime = 0;
            noteToPlay.volume = volumeSlider.value - volumeSlider.value*0.7;
            noteToPlay.play();
        });

    }

    pauseNotes(transpose) { // Pause notes
        let pauseNotes = this.notes;
        if (transpose != 0) {
            pauseNotes = pauseNotes.map(note => note + transpose);
        }

        let notes = {};

        for (let i = -12; i < 36; i++) {
            if (i < 0) {
                notes["m" + Math.abs(i)] = document.getElementById("note_m" + String(Math.abs(i)));
            }
            else {
                notes[String(i)] = document.getElementById("note_" + String(i));
            }
        }
        pauseNotes.forEach(note => {
            let noteToPause;
            if (note < 0) {
                noteToPause = notes["m" + String(Math.abs(note))];
            }
            else {
                noteToPause = notes[String(note)];
            }
            noteToPause.pause();
        });


    }

    static fromAttributes(attributes) {
        return new Chord(
          attributes.textChord,
          attributes.duration,
          attributes.notes,
          attributes.root,
          attributes.rootAccidental,
          attributes.triad,
          attributes.extension,
          attributes.extensionNumber,
          attributes.addNote,
          attributes.accidentalNotes
        );
      }

    static newChord(durationChord) {
        function pushToNotes(chordNotesAddition, notesAddition) {
            if (typeof(chordNotesAddition) == "object") {
                chordNotes.push(...chordNotesAddition);
                notes.push(...notesAddition);
            }
            else {
                chordNotes.push(chordNotesAddition);
                notes.push(notesAddition);
            }
        }

        let [chord, duration] = durationChord.split(":");
        duration = parseInt(duration);

        // console.log(chord);
    
        let chordNotes = [];
        let notes = [];
    
        // Find root note
    
        let root;
        let rootNote;
        let rootAccidental;
        let chordNoRoot;
    
        [root, rootNote, rootAccidental, chordNoRoot] = getRoot(chord);
    
        pushToNotes("1", root);
    
        // Find triad
    
        let triad;
        let triadChordNotes;
        let triadNotes;
        let chordNoTriad;
    
        [triad, triadChordNotes, triadNotes, chordNoTriad] = getTriad(root, chordNoRoot);

        pushToNotes(triadChordNotes, triadNotes);
    
        // Find 7th note
    
        let seventhChordNote;
        let seventhNote;
        let extension;
        let extensionNumber;
        let chordNoExtension;
    
        [seventhChordNote, seventhNote, extension, extensionNumber, chordNoExtension] = getSeventh(root, triad, chordNoTriad);
    
        if (extension != "") {
            pushToNotes(seventhChordNote, seventhNote);
        }
    
        // Find extra extensions
    
        let extraExtensionChordNotes;
        let extraExtensionNotes;
    
        [extraExtensionChordNotes, extraExtensionNotes] = getExtension(root, extensionNumber);

        pushToNotes(extraExtensionChordNotes, extraExtensionNotes);
 
        // Find add note
    
        let addChordNote;
        let addNote;
        let chordNoAdd;
    
        [addChordNote, addNote, chordNoAdd] = getAddNote(root, chordNoExtension);
        
        if (addChordNote != "") {
            if (chordNoTriad == chordNoExtension) {
                pushToNotes(addChordNote, addNote);
            }
            else {
                addChordNote = undefined;
                addNote = undefined;
            }
        }
    
        // Handle accidentals
    
        let accidentalNoteChanges = getAccidentals(chordNotes, chordNoAdd);

        if (accidentalNoteChanges.length > 0) {
            accidentalNoteChanges.forEach(accidental => {
                if (accidental.index == -1) {
                    pushToNotes(accidental.note, toNote(root, accidental.note));
                }
                else {
                    chordNotes[accidental.index] = accidental.note;
                    notes[accidental.index] = toNote(root, accidental.note);
                }
            });
        }
    
        let accidentalNotes = accidentalNoteChanges.map(accidental => accidental.note);
        
        return new Chord(
            chord,
            duration,
            notes,
            rootNote,
            rootAccidental,
            triad,
            extension,
            extensionNumber,
            addChordNote,
            accidentalNotes
        );
    }
    
}

function toNote(root, chordNote) {
    let chordNoteRelationship = {
        "1": 0, "2": 2, "3": 4, "4": 5, "5": 7, "6": 9, "7": 11,
        "8": 12, "9": 14, "10": 16, "11": 17, "12": 19, "13": 21, "14": 23,
    };

    let note = root + chordNoteRelationship[chordNote.match(/\d+/)[0]];

    if (chordNote.length > 1) {
        for (let accidental of chordNote) {
            if (accidental == "#") {
                note++;;
            }
            if (accidental == "b") {
                note--;
            }
        }
    }

    return note;
}

function getRoot(chord) {
    let chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    let rootNote = chord[0];
    let rootAccidental = chord.slice(0).match(/^(b|#)?/)[0];
    let root = chromatic.indexOf(rootNote);
    let chordNoRoot = chord.slice(1);

    if (chord.length > 1) {
        if (chord[1] == "#") {
            root += 1;
            chordNoRoot = chordNoRoot.slice(1);
            rootAccidental = "#";
        }
        else if (chord[1] == "b") {
            root -= 1;
            rootAccidental = "b";
            chordNoRoot = chordNoRoot.slice(1);
        }
    }

    return [root, rootNote, rootAccidental, chordNoRoot];
}

function getTriad(root, chordNoRoot) {
    let chordTypes = ["M", "m", "5", "ø", "dim", "aug", "sus2", "sus4"];
    let chordTypesDict = {
        "M": ["3", "5"],
        "m": ["b3", "5"],
        "5": ["5", "8"],
        "ø": ["b3", "b5"],
        "dim": ["b3", "b5"],
        "aug": ["3", "#5"],
        "sus2": ["2", "5"],
        "sus4": ["4", "5"]
    };

    let triad = "";
    let triadChordNotes = [];
    let triadNotes = [];
    let chordNoTriad = chordNoRoot;

    for (let i = 0; i < chordTypes.length; i++) {
        if (chordNoRoot.startsWith((chordTypes[i]))) {
            Object.values(chordTypesDict[chordTypes[i]]).forEach(chordTypeNote => {
                triadChordNotes.push(chordTypeNote);
                triadNotes.push(toNote(root, chordTypeNote));
            });
            chordNoTriad = chordNoRoot.slice(chordTypes[i].length);
            triad = chordTypes[i];
            break;
        }
    }

    return [triad, triadChordNotes, triadNotes, chordNoTriad];
}

function getSeventh(root, triad, chordNoTriad) {
    let seventh;
    let seventhNote;
    let extension = "";
    let extensionNumber = "";
    let chordNoExtension = chordNoTriad;

    let extensionTypes = ["dom", "maj"];
    let extensionTypesDict = {
        "dom": "b7",
        "maj": "7",
    }

    for (let i = 0; i < extensionTypes.length; i++) {
        if (chordNoTriad.startsWith(extensionTypes[i])) {
            seventh = extensionTypesDict[extensionTypes[i]];
            extension = extensionTypes[i];
        }
    }

    if (triad == "dim" && chordNoTriad.length > 0 && extension == "") { // Diminished 7th special case
        if (chordNoTriad.match(/\d+/)[0] >= 7) {
            seventh = "bb7";
            extension = "dim";
        }
    }

    if (triad == "ø") { // Half diminished special case
        seventh = "b7";
        extension = "ø";
    }

    if (extension != "") {
        seventhNote = toNote(root, seventh);
        extensionNumber = chordNoTriad.match(/\d+/)[0];
        chordNoExtension = chordNoExtension.slice(extension.length + extensionNumber.length);
    }

    return [seventh, seventhNote, extension, extensionNumber, chordNoExtension];
}

function getExtension(root, extensionNumber) {
    let extraExtensions = [];
    let extraExtensionNotes = [];

    if (parseInt(extensionNumber) > 7) {

        for (let i = 9; i <= extensionNumber; i += 2) {
            extraExtensions.push(i.toString());
            extraExtensionNotes.push(toNote(root, i.toString()));
        }
    }

    return [extraExtensions, extraExtensionNotes];
}

function getAddNote(root, chordNoExtension) {
    let addChordNote = "";
    let addNote;
    let chordNoAdd = chordNoExtension;

    if (chordNoExtension.toUpperCase().startsWith("ADD")) {
        addChordNote = chordNoExtension.match(/\d+/)[0];
        addNote = toNote(root, addChordNote);
        chordNoAdd = chordNoAdd.slice((3 + addChordNote).length);
    }

    return [addChordNote, addNote, chordNoAdd];
}

function getAccidentals(chordNotes, chordNoAdd) {
    let accidentalNotes = [];

    let numbers = [];
    let indices = [];
    let accidentalNoteMatch = chordNoAdd.matchAll(/\d+/g);


    if (chordNoAdd.length != 0) {


        for (let accidentalNote of accidentalNoteMatch) {
            numbers.push(accidentalNote[0]);
            indices.push(accidentalNote.index);
        }

        // ["1", "b3", "5"] => ["1", "3", "5"]
        // This step is unnessecary, but reduces user input error

        let chordNotesNoAccidentals = chordNotes.map(chordNote => chordNote.replace(/\D/g, ""));

        for (let i = 0; i < numbers.length; i++) {
            // If accidental note already in chord
            let accidental = chordNoAdd[indices[i] - 1];
            let accidentalNote = accidental + numbers[i];

            if (chordNotesNoAccidentals.includes(numbers[i])) {
                let numberIndex = chordNotesNoAccidentals.indexOf(numbers[i])
                accidentalNotes.push({"index": numberIndex, "note": accidentalNote});
            }
            else {
                accidentalNotes.push({"index": -1, "note": accidentalNote});
            }
        }
    }
    return accidentalNotes;
}

function toChord(textChord) {
    let chord = document.createElement("div");
    chord.classList.add("chord");

    let root = document.createElement("p");
    root.innerHTML = textChord.root[0];
    root.classList.add("chord-root");
    chord.append(root);

    let extras = document.createElement("div");
    extras.classList.add("chord-extras");
    chord.append(extras);

    let extrasTop = document.createElement("div");
    extrasTop.classList.add("chord-extras-top");
    extras.append(extrasTop);

    let extrasBottom = document.createElement("div");
    extrasBottom.classList.add("chord-extras-bottom");
    extras.append(extrasBottom);

    let rootAccidental = document.createElement("p");
    if (textChord.rootAccidental != "") {
        rootAccidental.innerHTML = textChord.rootAccidental;
        rootAccidental.classList.add("chord-root-accidental");
        extrasTop.append(rootAccidental);
    }

    let triadTextToChord = {
        "M": "",
        "m": "-",
        "5": "5",
        "ø": "ø",
        "dim": "o",
        "aug": "+",
        "sus2": "sus2",
        "sus4": "sus4"
    };

    let triad = document.createElement("p");
    triad.innerHTML = triadTextToChord[textChord.triad];
    triad.classList.add("chord-triad");
    extrasBottom.append(triad);

    let extensionTextToChord = {
        "maj": "maj",
        "dom": "",
        "dim": "",
        "ø": ""
    };

    let extension = document.createElement("p");
    if (textChord.extension != "") {
        extension.innerHTML = extensionTextToChord[textChord.extension] + textChord.extensionNumber;
        extension.classList.add("chord-extension");
        extrasBottom.append(extension);    
    }

    let addNote = document.createElement("p");
    if (textChord.addNote != "") {
        addNote.innerHTML = "Add" + textChord.addNote;
        addNote.classList.add("chord-add-note");
        extrasBottom.append(addNote);
    }

    let accidentalNotes = document.createElement("p");
    if (textChord.accidentalNotes.length > 0) {
        accidentalNotes.innerHTML = "(";
        for (let i = 0; i < textChord.accidentalNotes.length; i++) {
            accidentalNotes.innerHTML += textChord.accidentalNotes[i] + "/";
        }
        accidentalNotes.innerHTML = accidentalNotes.innerHTML.slice(0, -1);
        accidentalNotes.innerHTML += ")";
        accidentalNotes.classList.add("chord-accidental-notes");
        extrasTop.append(accidentalNotes);
    }

    chord.addEventListener("click", function() {
        selectedChord.style.backgroundColor = "transparent";
        selectedChord = chord;
        selectedChord.style.backgroundColor = "beige";

        if (!isPlaying) {
            textChord.playNotes(parseInt(transposeInput.value));
        }
    });

    return chord;
}

function toRest() {
    let restElement = document.createElement("div");
    restElement.classList.add("chord");

    let restSymbol = document.createElement("p");
    restSymbol.classList.add("chord-root")
    restSymbol.innerHTML = "/";
    restElement.append(restSymbol);

    return restElement;
}

function toScoreArray(input, timeSignature) {
    let score = [];
    let currentSection = [];
    let currentLine = [];
    let currentBar = [];
    let quarterNoteCount = 0;
    let barCount = 0;

    function addCurrentBarToLine() {
        currentLine.push(currentBar);
        currentBar = [];
        quarterNoteCount = 0;
        barCount++;
    }

    function addCurrentLineToSection() {
        if (currentLine.length > 0) {
            currentSection.push(currentLine);
            currentLine = [];
            barCount = 0;
        }
    }

    function addCurrentSectionToScore() {
        if (currentSection.length > 0) {
            score.push(currentSection);
            currentSection = [];
        }
    }

    input.forEach(item => {
        let spaceInBar = timeSignature - quarterNoteCount;

        if (item == "section") {
            if (timeSignature - quarterNoteCount > 0 && quarterNoteCount != 0) {
                currentBar[currentBar.length - 1].duration += timeSignature - quarterNoteCount;
            }
            while (barCount < 4 && barCount != 0) {
                addCurrentBarToLine();
            }
            addCurrentLineToSection();
            addCurrentSectionToScore();
        }
        else {
            let itemDuration = item.duration;
            while (itemDuration > 0) {
                if (itemDuration <= spaceInBar) {
                    let currentItem = Chord.fromAttributes({...item, duration: itemDuration});
                    currentBar.push(currentItem);
                    quarterNoteCount += itemDuration;
                    itemDuration = 0;
                }
                else {
                    let currentItem = Chord.fromAttributes({...item, duration: spaceInBar});
                    currentBar.push(currentItem);
                    itemDuration -= spaceInBar;
                    quarterNoteCount += spaceInBar;
                }

                if (quarterNoteCount == timeSignature) {
                    addCurrentBarToLine();
                }

                if (barCount == 4) {
                    addCurrentLineToSection();
                }
            }
           
        }
    });

    if (currentBar.length != 0) {
        addCurrentBarToLine();
    }
    addCurrentLineToSection();
    addCurrentSectionToScore();

    return score;
}

function toScore(scoreArray) {
    function newSection() {
        let newSectionElement = document.createElement("section");
        newSectionElement.classList.add("score-section");
        return newSectionElement;
    }

    function newLine() {
        let newLineElement = document.createElement("div");
        newLineElement.classList.add("score-line");
        return newLineElement;
    }

    function newBar() {
        let newBarElement = document.createElement("div");
        newBarElement.classList.add("score-bar");
        return newBarElement;
    }

    function newBarLine() {
        let newBarLineElement = document.createElement("p");
        newBarLineElement.classList.add("score-bar-line");
        newBarLineElement.innerHTML = "|";
        return newBarLineElement;
    }

    function newBarDoubleLine() {
        let newBarFillerLineElement = document.createElement("p");
        newBarFillerLineElement.classList.add("score-bar-double-line");
        newBarFillerLineElement.innerHTML = "||";
        return newBarFillerLineElement;
    }

    let score = document.createElement("section");
    score.id = "score";
    score.classList.add("score");

    flatScoreElementArray = [];

    let currentSection;
    let currentLine;
    let currentBar;
    let currentItem;

    scoreArray.forEach(section => {
        currentSection = newSection();
        score.append(currentSection);
        section.forEach((line, lineIndex) => {
            currentLine = newLine();
            currentSection.append(currentLine);

            if (lineIndex == 0) {
                currentLine.append(newBarDoubleLine());
            }
            else {
                currentLine.append(newBarLine());
            }

            line.forEach((bar, barIndex) => {
                currentBar = newBar();
                currentLine.append(currentBar);
                bar.forEach(item => {
                    if (item.textChord == "rest") {
                        currentItem = toRest(item)
                    }
                    else {
                        currentItem = toChord(item);
                    }
                    currentBar.append(currentItem);
                    flatScoreElementArray.push(currentItem);
                });
                
                if (barIndex != line.length - 1) {
                    currentLine.append(newBarLine());
                }
            });
            if (lineIndex == section.length - 1) {
                currentLine.append(newBarDoubleLine());
            }
            else {
                currentLine.append(newBarLine());
            }
        });
    });
        return score;
}

function refresh(scoreElementId, chordString, scoreName, artistName, tempo, timeSignature) {


    let scoreElement = document.getElementById(scoreElementId);
    scoreElement.innerHTML = "";

    let scoreHeader = document.createElement("header");
    scoreHeader.id = "score-header";
    scoreHeader.classList.add("score-header");

    let scoreHeaderBPM = document.createElement("p");
    scoreHeaderBPM.id = "score-header-bpm";
    scoreHeaderBPM.classList.add("score-header-bpm");

    let scoreHeaderTitle = document.createElement("h2");
    scoreHeaderTitle.id = "score-header-title";
    scoreHeaderTitle.classList.add("score-header-title");

    let scoreHeaderArtist = document.createElement("p");
    scoreHeaderArtist.id = "score-header-artist";
    scoreHeaderArtist.classList.add("score-header-artist");

    scoreHeader.appendChild(scoreHeaderBPM);
    scoreHeader.appendChild(scoreHeaderTitle);
    scoreHeader.appendChild(scoreHeaderArtist);

    scoreElement.append(scoreHeader);

    let chords = [];

    let sectionSplit = chordString.split("\n\n");
    sectionSplit.forEach((section, sectionIndex) => {  
        let inputSplit = section.split(" ");
        inputSplit.forEach(item => {
            if (item.split(":")[0] == "rest") {
                let restNote = {textChord: "rest", duration: parseInt(item.split(":")[1]), notes: []};
                chords.push(restNote);
            }
            else {
                chords.push(Chord.newChord(item));
            }
        });
        if (sectionIndex != sectionSplit.length - 1) {
            chords.push("section");
        }
    });

    let scoreArray;
    let score;

    if (timeSignature != "" && tempo != "" && artistName != "" && scoreName != "") {
        if (timeSignature.match(/^[0-9]+$/) != null && parseInt(timeSignature)) {
            if (tempo.match(/^[0-9]+$/) != null) {
                scoreHeaderBPM.innerHTML = "BPM: " + tempo;
                scoreHeaderTitle.innerHTML = scoreName;
                scoreHeaderArtist.innerHTML = artistName;
                scoreArray = toScoreArray(chords, parseInt(timeSignature));
                flatScoreArray = scoreArray.flat(Infinity);
                score = toScore(scoreArray);
                scoreElement.append(score);
                selectedChord = flatScoreElementArray[0];
            }
            else {
                alert("Make sure tempo is an integer");
                return;
            }
        }
        else {
            alert("Make sure time signature is an integer")
            return;
        }
    }
    else {
        alert("Make sure no property input fields are left empty empty");
        return;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playBack() {
    if (isPlayBack) {
        return;
    }

    isPlayBack = true;

    let startIndex = flatScoreElementArray.indexOf(selectedChord);
    if (startIndex == -1) {
        selectedChord = flatScoreElementArray[0];
        startIndex = flatScoreElementArray.indexOf(selectedChord);
    }

    let tempo = parseInt(bpmValue.value);

    for (let i = startIndex; i < flatScoreArray.length; i++) {
        if (!isPlaying) {
            flatScoreElementArray[i - 1].style.color = "black";
            playButton.innerHTML = "PLAY";
            playButton.style.backgroundColor = "rgb(45, 168, 93)";
            break;
        }

        if (startIndex != flatScoreElementArray.indexOf(selectedChord)) {
            flatScoreElementArray[i - 1].style.color = "black";
            startIndex = flatScoreElementArray.indexOf(selectedChord);
            i = startIndex;
        }
        
        const chord = flatScoreArray[i];
        flatScoreElementArray[i].style.color = "rgb(61, 117, 177)";
        if (i > startIndex) {
            flatScoreElementArray[i - 1].style.color = "black";
        }

        const length = (60000 / tempo) * chord.duration;
        chord.playNotes(parseInt(transposeInput.value));
        await sleep(length);
        chord.pauseNotes(parseInt(transposeInput.value));
    }

    if (isPlaying) {
        flatScoreElementArray[flatScoreElementArray.length - 1].style.color = "black";
    }

    isPlayBack = false;
    isPlaying = false;
    playButton.innerHTML = "PLAY";
    playButton.style.backgroundColor = "rgb(45, 168, 93)";
}

function setCookie(name, value) {
    let expires = "";
    let date = new Date();
    date.setTime(date.getTime() + (14 * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    for (cookieValue of document.cookie.split(";")) {
        let cookieSplit = cookieValue.split("=");
        if (cookieSplit[0].trim() == name) {
            return cookieSplit[1].trim();
        }
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function updateCookie(name, value) {
    eraseCookie(name);
    setCookie(name, value);
}