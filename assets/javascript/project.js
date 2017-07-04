$(document).ready(function() {

  $("#flip").on("click", function() {

    $('.ui.sidebar')
      .sidebar('toggle');

    //       $('.ui.dropdown')
    //   .dropdown()
    // ;
  });

  $('.ui.sidebar.inverted.vertical.menu').sidebar({
    transition: 'overlay'
  });

  $('.ui.radio.checkbox')
    .checkbox();

  $('#getNews').on('click', function() {
    $('.basic.modal.nyTime')
      .modal('show');
  });

  $('#getTwitter').on('click', function() {
    $('.basic.modal.twitter')
      .modal('show');
  });

  $('#getBooks').on('click', function() {
    $('.basic.modal.books')
      .modal('show');
  });

  $('#getPodcasts').on('click', function() {
    $('.basic.modal.podcast')
      .modal('show');
  });

  $('#getMeetUp').on('click', function() {
    $('.basic.modal.meetup')
      .modal('show');
  });

  //Firebase initialize
  var config = {
    apiKey: "AIzaSyDxW087mUoLk6smGAHixRd5lLKYBZ4JeA8",
    authDomain: "first-project-5b478.firebaseapp.com",
    databaseURL: "https://first-project-5b478.firebaseio.com",
    projectId: "first-project-5b478",
    storageBucket: "",
    messagingSenderId: "618602692351"
  };

  firebase.initializeApp(config);

  console.log(firebase);

  //store firebase db and auth in global variables
  var database = firebase.database();
  var auth = firebase.auth();
  var name = "";
  var email = "";
  var password = "";
  var interest = "";
  var datatopic = "";

  //
  //creates user -- signup email authentication
  $("#signup").on("click", function() {
    window.location.href = "signup.html";
  });

  // console.log("Hello World!!");
  $("#signUpSubmit").on("click", function(event) {
    event.preventDefault();

    name = $("#signUpName").val().trim();
    email = $("#signUpEmail").val().trim();
    password = $("#signUpPassword").val().trim();

    var newuser = auth.createUserWithEmailAndPassword(email, password);

    newuser.then(function(user) {
      var ref = database.ref("/user/" + user.uid);

      ref.set({
        userName: name,
        email: email,
        uid: user.uid,
        interest: false
      })

    }).catch(function(error) {
      console.log(error.code);
      console.log(error.message);
    });

    $("#signUpName").val("");
    $("#signUpName").val("");
    $("#signUpName").val("");

    auth.signOut();
    setTimeout(function() {
      window.location.href = "login.html";
    }, 2000);

  });

  //user login
  $("#login").on("click", function() {
    window.location.href = "login.html";
  });

  $("#signUpLink").on("click", function() {
    window.location.href = "signup.html";
  });

  $("#loginSubmit").on("click", function(event) {
    event.preventDefault();

    email = $("#loginEmail").val().trim();
    password = $("#loginPassword").val().trim();

    var loginuser = auth.signInWithEmailAndPassword(email, password);

    loginuser.then(function() {
      $("#loginEmail").val("");
      $("#loginPassword").val("");
      window.location.href = 'main.html';

    }).catch(function(error) {
      console.log(error.code);
      console.log(error.message);
    })
  });

  getContent();

  $("#logout").on("click", function() {

    var logoutuser = auth.signOut();

    logoutuser.then(function() {

      console.log("Logged out!");
      window.location.href = "index.html";

    }).catch(function(error) {

      console.log(error.code);
      console.log(error.message);
    });
  });

  function getContent() {

    auth.onAuthStateChanged(function(user) {

      if (user) {
        var ref = database.ref("/user/" + user.uid);

        ref.once("value", function(snapshot) {

          var datatopic = snapshot.val().interest;
          $("#userName").text("Welcome back " + snapshot.val().userName);
          console.log(datatopic);

          if (datatopic === false) {
            setFavoriteTopic();

          } else {
            getYouTube(datatopic);
            getBooks(datatopic);
            // getNews(datatopic);
            getPodcasts(datatopic);
            getMeetup(datatopic);
            // getTwitter(datatopic);
            getSavedYouTubeFromDatabase();
            getSavedPodcastFromDatabase();
            getSavedBooksFromDatabase();
          }

          console.log(user.uid + "is now signed in");
        });
      } else {
        $("#userName").html("<a style='color: black;' href='login.html'>Sign In</a>");
        console.log("no user is signed in");
      }
    });
  };

  //Add Favorite Interest for New User and change user settings for interest - password - email
  function setFavoriteTopic() {
    $('.basic.modal.setting').modal('show');
    $('#newUserModal').show();
    $('.userSettings').hide();
    $('#changePasswordForm').hide();
    $('#changeEmailForm').hide();
    changeInterest();
  };
  //Change User Settings (Favorite Interest, Password, Email Address)
  $('.icon.button').on('click', function() {
    $('.basic.modal.setting').modal('show');
    $('#newUserModal').hide();
    $('.userSettings').show();
    $('#changePasswordForm').hide();
    $('#changeEmailForm').hide();
    changeInterest();
  });

  function changeInterest() {
    $("#newInterestSubmit").on("click", function() {
      var interest = $("#newInterestInput").val().trim();
      var user = auth.currentUser;
      var ref = database.ref("/user/" + user.uid);
      ref.update({
        interest: interest,
      });
      $("#newInterestInput").val("");
      $('.basic.modal.setting').modal('hide');
      setTimeout(function() {
        getContent();
      }, 2000);
    });
  };
  //Change Password in Settings
  $("#changePassword").on("click", function() {
    $("#changePasswordForm").show();
  });

  $("#changePasswordSubmit").on("click", function(event) {
    event.preventDefault();
    var emailAddress = $("#changePasswordInput").val().trim();
    auth.sendPasswordResetEmail(emailAddress).then(function() {
      $("#emailSentConfirm").html("A password reset email has been sent to " + emailAddress);
    }, function(error) {
      $("#emailSentConfirm").html(error);
    });
    $("#changePasswordInput").val("");
  });

  $("#changeEmail").on("click", function() {
    $("#changeEmailForm").show();
  });
  //Change Email in Settings
  $("#changeEmailSubmit").on("click", function(event) {
    event.preventDefault();
    var emailAddress = $("#changeEmailInput").val().trim();
    var user = auth.currentUser;
    user.updateEmail(emailAddress).then(function() {
      $("#emailSentConfirm").html("Your user email has been changed to " + emailAddress);
      var ref = database.ref("/user/" + user.uid);
      ref.update({email : emailAddress});
    }, function(error) {
      $("#emailSentConfirm").html(error);
    });
    $("#changePasswordInput").val("");
  });

  //Search topic to populate APIs
  $("#searchSubmit").on("click", function(event) {
    event.preventDefault();

    datatopic = $("#searchInput").val().trim();
    console.log(datatopic);

    getYouTube(datatopic);
    getBooks(datatopic);
    // getNews(datatopic);
    getPodcasts(datatopic);
    getMeetup(datatopic);
    // getTwitter(datatopic);
    $("#searchInput").val("");
  });

  /*//////////////////////////////////////
  /////////////////Mauricio API ///////////////
  /*/ /////////////////////////////////////

  function getYouTube(datatopic) {
    var searchTopic = datatopic.split(" ").join("+");

    // NEW VARIABLE TO set search to begin 30 days ago from current time
    // USING MOMENT.JS
    var searchBeginingDate = moment().subtract(30, 'days').toISOString();
    console.log(searchBeginingDate);
    // the youtube query url requires "publishedAfter" to be a string
    var publishedAfter = String(searchBeginingDate);
    console.log(publishedAfter);
    // ===============================================================
    // var order = 'date';
    var videoID;
    // =======PREVIOUS URL BEFORE MAURICIO'S MOMENT.JS DATE TEST.======
    // var queryURL = 'https://www.googleapis.com/youtube/v3/search?maxResults=9&part=snippet&&relevanceLanguage=en&q=' + searchTopic + '&order=' + order + '&order=viewCount&type=video&videoEmbeddable=true&key=AIzaSyCnbcvaas-tjIurM5-936c9S3mT5dJgTIo';
    // =====================================================================
    // =TESTING NEW QUERY URL TO GRAB VIDEOS FROM 30 DAYS AGO WITH MOST viewCountS

    var queryURL = 'https://www.googleapis.com/youtube/v3/search?maxResults=9&part=snippet&&relevanceLanguage=en&q=' +
      searchTopic + '&publishedAfter=' + publishedAfter +
      '&type=video&videoEmbeddable=true&key=AIzaSyCnbcvaas-tjIurM5-936c9S3mT5dJgTIo';
    // + '&order=viewCount'
    $.ajax({
        url: queryURL,
        method: 'GET',
        dataType: 'jsonp'
      })

      .done(function(response) {
        // console.log("YouTube: " + queryURL);
        console.log(response);
        // console.log(response.items);

        $("#video-div").empty();
        // var results = data.items;
        for (var i = 0; i < response.items.length; i++) {
          var ytHoldDiv = $("<div>");
          var youtubeDiv = $("<iframe class='youtube' allowfullscreen>");
          youtubeDiv.css({
            "width": "250px",
            "height": "160px",
            "display": "block",
            "padding": "10px"
          });

          var videoIdList = response.items[i].id.videoId;
          var url = 'https://www.youtube.com/embed/' + videoIdList;

          // grabbing the title for every video
          var videoTitle = response.items[i].snippet.title;
          // console.log(videoTitle);

          var saveIcon = $("<i>");

          saveIcon.addClass("plus square outline icon green inverted ytSaveIcon");
          saveIcon.css({
            "padding": "0px",
            "margin-left": "8px"
          });

          saveIcon.attr("data-ytUrl", url).attr("data-ytTitle", videoTitle);

          youtubeDiv.attr("src", url);
          youtubeDiv.addClass("margin-top");
          ytHoldDiv.append(youtubeDiv);
          ytHoldDiv.append(saveIcon);
          // $("#video-div").append(youtubeDiv);
          // $("#video-div").append(saveDiv);
          $("#video-div").append(ytHoldDiv);
          $('#ytThumbnail').on('click', function() {
            $('.basic.modal.yt')
              .modal('show');


          });
        }

        $("#ytThumbnail").empty();

        // APPENDING thumbnails TO youtube DIV

        for (var i = 0; i < response.items.length; i++) {
          var ytHoldDiv = $("<div class=thumbnails>");
          var ytThumbNailUrl = response.items[i].snippet.thumbnails.default.url;
          console.log(ytThumbNailUrl);
          var ytThumbnailHolder = $("<img>").attr("src", ytThumbNailUrl);
          ytThumbnailHolder.css({
            "height": "75px",
            "width": "90px",
          })
          ytHoldDiv.css({
            "display": "flex",
            "flex-flow": "column-wrap",
            "justify-content": "center",
            "float": "left",
            // "padding" : "1px",
            "width": "33.33%",
            // "border" : "1px solid black",
            "background-color": "black",
            "border-radius": "10px"
          })

          ytHoldDiv.append(ytThumbnailHolder);
          $("#ytThumbnail").append(ytHoldDiv);
        }

      })

      .fail(function(err) {
        console.log(err.statusText);
      })
  };

  function getBooks(datatopic) {
    var searchTopic = datatopic.split(" ").join("+");
    var GbooksAPIkey = "AIzaSyAdRit-J3O3HY3ojccN4WDrf1Zqa-mVcgw"
    var queryURL = "https://www.googleapis.com/books/v1/volumes?q=" + searchTopic + "&langRestrict=en&maxResults=15&orderBy=newest&key=" + GbooksAPIkey;

    $.ajax({
        url: queryURL,
        method: 'GET',
      })
      .done(function(response) {

        console.log(response);
        console.log("Books: " + queryURL);

        $("#books-div").empty();
        $("#booksIntro").empty();

        var arr = response.items;
        for (var i = 0; i < arr.length; i++) {
          var booksRow = $('<div>').attr('class', 'booksContainer');
          var thumbnailsSource = arr[i].volumeInfo.imageLinks.smallThumbnail;
          var thumbnails = $('<img>').attr('src', thumbnailsSource).attr('class', 'bookImage');

          bookLink = $('<a>').attr({
            'class': 'podlink',
            'href': arr[i].volumeInfo.infoLink,
            'target': '_blank'
          });
          bookLink.append(thumbnails);

          bookTitle = $('<p>').attr('class', 'bookTitle');
          var saveButton = $("<i class='green plus icon booksSaveIcon'><i>");
          saveButton.attr("data-image", thumbnailsSource).attr("data-booksUrl", arr[i].volumeInfo.infoLink).attr("data-title", arr[i].volumeInfo.title);
          bookTitle.html(arr[i].volumeInfo.title);
          // description.html(' : '+arr[i].volumeInfo.description);

          booksRow.append(bookLink, saveButton);
          $("#books-div").append(booksRow);

          $('.booksContainer').css({
            'width': '5%',
            'margin-bottom': '30px',
            'margin-right': '0px',
            'float': 'left'
          });

          $(thumbnails).css({
            'margin-top': '20px',
            'float': 'left'
          });
        };

        for (i = 0; i < 1; i++) {
          var introBookThumbnail = arr[i].volumeInfo.imageLinks.smallThumbnail;
          // var introBookTitle = $("<p>" + arr[i].volumeInfo.title + "</p>");
          var introBookDiv = $("<div>");
          introBookDiv.css({
            "display": "inline-block",
            "margin-right": "10px",
            "display":"flex",
            "justify-content":"center"
          });
          var introBookImage = $("<img>");
          introBookImage.attr("src", introBookThumbnail);

          // introBookDiv.append(introBookImage, introBookTitle);

          introBookDiv.append(introBookImage);

          $("#booksIntro").append(introBookDiv);
        };

      }).fail(function(err) {
        console.log(err.statusText);
      });
  };

  function getNews(datatopic) {

    var searchTopic = datatopic.split(" ").join("+");
    var endpoint = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + searchTopic + '&sort=newest&begin_date=20170000&hl=true&api_key=a49e8a22035943e9bb2f4928fe15d8fe';
    // params = 'q=' + searchTopic + '&sort=newest&api_key=a49e8a22035943e9bb2f4928fe15d8fe';
    // params = 'q=' + searchTopic + '&sort=newest&api_key=6c06af0cde254bc0a14d82aaa261021c';

    // var url = endpoint;

    $.ajax({
        url: endpoint,
        method: 'GET'
      }).then(function(data) {
        console.log(data);
        console.log("NYT: " + endpoint);
        // book.html("Categorie: " + data.response.docs[0].section_name);
        // source.html("Source: " + data.response.docs[0].source);
        // snippet.html("Description: " + data.response.docs[0].snippet);
        // date.html("Date: " + data.response.docs[0].pub_date);
        $("#nyTime-div").empty();

        var arr = data.response.docs; // array of 10 objects
        for (var i = 0; i < arr.length; i++) {
          var content = $("<div>").attr('class', 'nyTimeBox');
          var source = $("<p>").attr('class', 'source'),
            headline = $("<h5>").attr('class', 'headline')
          snippet = $("<p>").attr('class', 'snippet'),
            date = $("<p>").attr('class', 'date');
          web = $("<a>").attr({
              'class': 'link',
              "href": arr[i].web_url
            }),
            headline.html(arr[i].headline.main);
          source.html("Source : " + arr[i].source);
          snippet.html("' " + arr[i].snippet + " '");
          date.html(arr[i].pub_date);
          web.html("Read More >>") + arr[i].web_url;
          content.append(source, date, headline, snippet, web);
          $("#nyTime-div").append(content);
        }
        $("#nyTimeIntro").empty();
        for (var i = 0; i < 1; i++) {
          var content = $("<div>").attr('class', 'nyTimeBox');
          var snippet = $("<h6>").attr('class', 'snippet'),
            headline = $("<h5>").attr('class', 'headline'),
            date = $("<p>").attr('class', 'date');
          web = $("<a>").attr({
              'class': 'link',
              "href": arr[i].web_url
            }),

            headline.html(arr[i].headline.main);
          snippet.html("' " + arr[i].snippet + " '");
          date.html(arr[i].pub_date);
          web.html("Read More >>") + arr[i].web_u
          content.append(date, headline, snippet, web);
          $("#nyTimeIntro").append(content);
        }
      })

      .catch(function(err) {
        console.log(err.statusText);
      });
    // GET, DELETE, POST, PUT
  };

  function getPodcasts(datatopic) {
    var searchTopic = datatopic.split(" ").join("%20");
    var queryURL = 'https://api.ottoradio.com/v1/podcasts?query=' + searchTopic + '&type=recent&count=10';

    $.ajax({
        url: queryURL,
        method: 'GET',
      })
      .done(function(response) {

        console.log(response);
        console.log("Podcast: " + queryURL);

        $("#pod-div").empty();

        for (var i = 0; i < response.length; i++) {

          var podDiv = $("<div>");
          var podTitle = $("<p>" + response[i].title + "</p>");
          var podSource = $("<p>" + response[i].source + "</p>");
          var podDate = $("<p>" + response[i].published_at + "</p>");

          var audioSource = $("<source>");
          audioSource.attr("src", response[i].audio_url).attr("type", "audio/mpeg");

          podDiv.css({
            "width": "315px",
            "height": "160px",
            "float": "left",
            "margin": "10px 50px 20px 50px",
          });

          var podPlayIcon = $("<i>");
          podPlayIcon.addClass("play icon green clickPlay");
          podPlayIcon.attr("data-src", response[i].audio_url).attr("data-podTitle", response[i].title);

          var podSaveIcon = $("<i>");
          podSaveIcon.addClass("plus square outline icon green inverted podSaveIcon");

          podSaveIcon.attr("data-podUrl", response[i].audio_url).attr("data-podTitle", response[i].title);

          podDiv.append(podPlayIcon);
          podDiv.append(podTitle);
          podDiv.append(podSource, podDate, podSaveIcon);

          $("#pod-div").append(podDiv);
        };

      }).fail(function(err) {
        console.log(err.statusText);
      });
  };

  $('.ui.sticky')
    .sticky({
      context: '#example1'
    });

  /*//////////////////////////////////////
  /////////////////air API ///////////////
  /*/ /////////////////////////////////////

  // meet up api ///////////////////////////////////////////

  function getMeetup(datatopic) {
    var searchTopic = datatopic.split(" ").join("+");
    $.ajax({

        url: 'https://api.meetup.com/find/groups?page=20&text=' + searchTopic + '&key=4f2661595c402d1f6c515a3b671056',
        method: "GET",
        dataType: "jsonp"
      })
            .then(function(data) {
        console.log(data);

         $("#meetup-div").empty();
        var arr = data.data; // array of 10 objects
        for (var i = 0; i < arr.length; i++) {
          var content = $("<div>").attr('class', 'box');
          var city = $("<h2>").attr('class', 'city'),
            description = $("<p>").attr('class', 'meetupDescription'),
            link = $("<a>").attr({
              'class': 'link',
              'href': arr[i].link,
              'target':'_blank'
            }),
            name = $("<h1>").attr('class', 'name');

          city.html(arr[i].city);
          description.html(arr[i].description);
          link.html(arr[i].link);
          name.html(arr[i].name);
          content.append(name,city,description,link);
          $("#meetup-div").append(content);
        }
      })
      .catch(function(err) {
        console.log(err.statusText);
      })
    // GET, DELETE, POST, PUT
  };

  // 2.twitter ///////////////////////////////////////////////////
  function getTwitter(datatopic) {
    var searchTopic = datatopic.split(" ").join("+");
    var queryURL = 'https://twitterpopularapi.herokuapp.com/api?q=' + searchTopic + '&count=9';
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "jsonp"
      })
      .then(function(data) {
        console.log(data);
        console.log(queryURL);
        var arr = data.statuses; // array of 10 objects
        for (var i = 0; i < arr.length; i++) {
          var content = $("<div>").attr('class', 'box');
          var text = $("<p>").attr('class', 'text'),
            name = $("<p>").attr('class', 'name');
          text.html("Latest Tweet: " + arr[i].text);
          content.append(text);
          $("#twitter-div").append(content);
        }

      })
      .fail(function(err) {
        console.log(err.statusText);
      })
  };


  //Saving - Displaying - Deleting Saved Items
  //YouTube Saves
  $(document).on("click", ".ytSaveIcon", function() {
    var ytUrl = $(this).attr("data-ytUrl");
    var ytTitle = $(this).attr("data-ytTitle");
    $(this).removeClass("plus square");
    $(this).addClass("red pin");

    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/ytSaved");
    ref.push({
      ytUrl: ytUrl,
      ytTitle: ytTitle,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    getSavedYouTubeFromDatabase();
  });

  function getSavedYouTubeFromDatabase() {
    $("#ytSavedItems").empty();
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/ytSaved");
    ref.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var dbItemKey = childSnapshot.key;

        var ytSavedUrl = childSnapshot.val().ytUrl;
        var ytSavedDiv = $("<div>");
        ytSavedDiv.css("margin-top", "20px");
        var iFrameSaved = $("<iframe class='youtube' allowfullscreen>");
        iFrameSaved.css({
          "width": "150px",
          "height": "80px",
          "display": "block",
          // "padding": "5px"
        });
        iFrameSaved.attr("src", ytSavedUrl);
        var deleteIcon = $("<i>");
        deleteIcon.addClass("remove circle icon green deleteIcon");
        deleteIcon.css({
          "float": "right",
          "margin-right": "20px"
        });
        deleteIcon.attr("data-itemKey", dbItemKey);

        ytSavedDiv.append(deleteIcon);
        ytSavedDiv.append(iFrameSaved);

        $("#ytSavedItems").prepend(ytSavedDiv);

      });
    });
  };

  $(document).on("click", ".deleteIcon", function() {
    var itemKey = $(this).attr("data-itemKey");
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/ytSaved");
    ref.child(itemKey).remove();
    getSavedYouTubeFromDatabase();
  });

  //Podcast Saves
  $(document).on("click", ".podSaveIcon", function() {
    var podUrl = $(this).attr("data-podUrl");
    var podTitle = $(this).attr("data-podTitle");

    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/podSaved");
    ref.push({
      podUrl: podUrl,
      podTitle: podTitle,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    getSavedPodcastFromDatabase();
  });

  function getSavedPodcastFromDatabase() {
    $("#podSavedItems").empty();
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/podSaved");
    ref.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var dbItemKey = childSnapshot.key;

        var podSavedTitle = childSnapshot.val().podTitle;
        var podSavedUrl = childSnapshot.val().podUrl;
        var podSavedDiv = $("<div>");
        var podTitle = $("<p>" + podSavedTitle + "</p>");

        podSavedDiv.css("margin-top", "20px");

        var podPlayIcon = $("<i>");
        // podSavedDiv.css("margin-bottom", "10px");
        podPlayIcon.addClass("play icon green clickPlay");
        podPlayIcon.attr("data-src", podSavedUrl).attr("data-podTitle", podSavedTitle);
        podTitle.css({
          "width": "100px",
          "display": "inline",
          "margin-left": "5px",
          "font-size": "10px"
        });

        var deleteIcon = $("<i>");
        deleteIcon.addClass("remove circle icon green deleteIcon");
        deleteIcon.css({
          "float": "right",
          "margin-right": "20px"
        });
        deleteIcon.attr("data-itemKey", dbItemKey);

        podSavedDiv.append(podPlayIcon);
        podSavedDiv.append(deleteIcon);
        podSavedDiv.append(podTitle);

        $("#podSavedItems").prepend(podSavedDiv);

      });
    });
  };

  $(document).on("click", ".clickPlay", function() {
    $("#audioPlayer").empty();
    var podURL = $(this).attr("data-src");
    var podTitle = $(this).attr("data-podTitle");
    var audioControl = $("<audio controls autoplay>");
    var audioSource = $("<source>");

    $("#pod-nowPlaying").html("You are listening to " + podTitle);

    audioSource.attr("src", podURL).attr("type", "audio/mpeg");
    audioControl.append(audioSource);

    $("#audioPlayer").append(audioControl);
  });

  $(document).on("click", ".deleteIcon", function() {
    var itemKey = $(this).attr("data-itemKey");
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/podSaved");
    ref.child(itemKey).remove();
    getSavedPodcastFromDatabase();
  });

  //Book Saves
  $(document).on("click", ".booksSaveIcon", function() {
    var booksImage = $(this).attr("data-image");
    var booksUrl = $(this).attr("data-booksUrl");
    var booksTitle = $(this).attr("data-title");
    $(this).removeClass("plus square");
    $(this).addClass("pin");

    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/booksSaved");
    ref.push({
      booksImage: booksImage,
      booksUrl: booksUrl,
      booksTitle: booksTitle,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
    getSavedBooksFromDatabase();
  });

  function getSavedBooksFromDatabase() {
    $("#booksSavedItems").empty();
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/booksSaved");
    ref.once("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var dbItemKey = childSnapshot.key;

        var booksSavedImage = childSnapshot.val().booksImage;
        var booksSavedUrl = childSnapshot.val().booksUrl;
        var booksSavedTitle = childSnapshot.val().booksTitle;
        var booksSavedDiv = $("<div>");
        booksSavedDiv.css("margin-top", "20px");
        var booksTitle = $("<div>");
        booksTitle.append(booksSavedTitle);
        booksTitle.css({
          "width": "100px",
          "display": "inline-block",
          "font-size": "10px",
          // "word-break" : "break-all"
        })

        var booksThumbnail = $("<img>");
        booksThumbnail.attr("src", booksSavedImage);
        booksThumbnail.css({
          "height": "100px",
          "width": "auto",
          "margin": "0 5px 5px 0",
        });

        var booksSavedLink = $("<a>").attr({
          'class': 'booklink',
          'href': booksSavedUrl,
          'target': '_blank'
        });

        booksSavedLink.append(booksThumbnail);

        var deleteIcon = $("<i>");
        deleteIcon.addClass("remove circle icon green deleteIcon");
        deleteIcon.css({
          "float": "right",
          "margin-right": "20px"
        });
        deleteIcon.attr("data-itemKey", dbItemKey);

        booksSavedDiv.append(booksSavedLink);
        booksSavedDiv.append(deleteIcon);
        booksSavedDiv.append(booksTitle);

        $("#booksSavedItems").prepend(booksSavedDiv);

      });
    });
  };

  $(document).on("click", ".deleteIcon", function() {
    var itemKey = $(this).attr("data-itemKey");
    var user = auth.currentUser;
    var ref = database.ref("/user/" + user.uid + "/booksSaved");
    ref.child(itemKey).remove();
    getSavedBooksFromDatabase();
  });
});
//document end.