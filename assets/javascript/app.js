var displayTime;

//Get current time with Moment.js
function updateTime() {
  displayTime = moment().format("HH:mm:ss");
  $("#currentTime").html(displayTime);
}

//run updateTime after html is loaded
$(function() {
  updateTime();
  setInterval(updateTime, 1000); //time counter
});

// Firebase configuration
var config = {
  apiKey: "AIzaSyAXkYSDZX56imKl1taI93THOOHF2vzdmCY",
  authDomain: "train-scheduler-7ce67.firebaseapp.com",
  databaseURL: "https://train-scheduler-7ce67.firebaseio.com",
  projectId: "train-scheduler-7ce67",
  storageBucket: "",
  messagingSenderId: "135693448620",
  appId: "1:135693448620:web:917dd9d1412e2e0c"
};
// Initialize Firebase
firebase.initializeApp(config);

var database = firebase.database();

$("#addSchedule").on("click", function() {
  var trainName = $("#inputTrainName")
    .val()
    .trim();
  var trainDestination = $("#inputDestination")
    .val()
    .trim();
  var trainFirstTime = $("#inputFirstTrain").val();
  var trainFrequency = $("#inputFrequency")
    .val()
    .trim();

  console.log(trainFirstTime);
  var newTrain = {
    name: trainName,
    destination: trainDestination,
    first_train: trainFirstTime,
    frequency: trainFrequency
  };

  database.ref().push(newTrain);

  $("#trainModal").modal("hide"); //hide modal after submit

  $("form").trigger("reset"); //clear form field

  return false; //prevent page reloading
});

database.ref().on("child_added", function(snapshot) {
  var fireID = snapshot.key;
  var fireData = snapshot.val();
  var timeFirst = fireData.first_train; // time: display time, t: calc time
  var timeFrequency = fireData.frequency;

  //Convert time of first train
  var tFirstConverter = moment(timeFirst, "HH:mm");

  //Time difference (in minutes) between the first train and current time
  var tDiff = moment().diff(moment(tFirstConverter), "minutes");

  //Time has passed until next arrival
  var tPassed = tDiff % timeFrequency;

  //Next train arrival time
  var tMinuteTillArrival = timeFrequency - tPassed;
  var tArrival = moment().add(tMinuteTillArrival, "minutes");
  var timeArrival = moment(tArrival).format("HH:mm");

  //Create remove button
  var trashIcon = $("<button>")
    .addClass("btn remove-btn")
    .attr("trainID", fireID);
  trashIcon.append("<i class = 'fa fa-trash' aria-hidden = 'true'></i>");

  //Update html TABLE
  var tableRow = $("<tr>").append([
    $("<td>").text(fireData.name),
    $("<td>").text(fireData.destination),
    $("<td>").text(fireData.frequency),
    $("<td>").text(timeArrival),
    $("<td>").text(tMinuteTillArrival),
    $("<td>").html(trashIcon)
  ]);
  $("#newTrain").append(tableRow);

  //Update html CARD
  var trainCard = $("<div>")
    .addClass("card mb-4")
  
  var cardTitle = $('<h5>').addClass('p-0 text-capitalize').text(fireData.name)
  var cardSubtitle = $('<div>').addClass('row justify-content-center').append([
    $('<div>').addClass('text-capitalize col-5').html("<span><i class = 'fa fa-map-marker' aria-hidden = 'true'></i> " + fireData.destination + "</span>"),
    $('<div>').addClass('col-5').html("<span><i class = 'fa fa-clock-o' aria-hidden = 'true'></i> Every " + fireData.frequency + " mins</span>")
  ])

  var cardHeader = $('<div>').addClass('card-header text-center align-items-center').append(cardTitle, cardSubtitle)
  
  var cardBody = $("<div>").addClass('card-body row text-center')
  cardBody.append([
    $('<p>').addClass('col-6 m-0').text('NEXT ARRIVAL'),
    $('<p>').addClass('col-6 m-0').text('MINUTES AWAY'),
    $('<p>').addClass('col-6 m-0').text(timeArrival),
    $('<p>').addClass('col-6 m-0').text(`${tMinuteTillArrival} mins`)
  ]);

  trainCard.append(cardHeader, cardBody)
  $('#trainCard').append(trainCard)
  // TODO: Research to update time arrival every minute
  //!Do that with Ajax reload
});

//Button remove train schedule
$(document).on("click", ".remove-btn", function() {
  event.preventDefault();
  //Find all key values
  var trainKey = $(this).attr("trainID");
  var trainVal = database.ref(trainKey);

  //Remove from Firebase
  trainVal.remove();

  //Remove from HTML
  $(this)
    .parent()
    .parent()
    .remove();
});

//TODO: Add Firebase Authentication

//TODO: Let user edit train table
