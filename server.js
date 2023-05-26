const express = require("express");
const app = express();
const admin = require("firebase-admin");
const cron = require("node-cron");
var serviceAccount = require("./login-7a56f-firebase-adminsdk-xqcyd-972b92f694.json");
const { json } = require("body-parser");
const { time } = require("console");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

var timeSlots = [10, 11, 12, 13, 14, 15];

cron.schedule("* * * * *", () => {
  db.collection("users")
    .get()
    .then((documents) => {
      documents.docs.map((document) => {
        const timetable =
          document.data().timetable != null
            ? JSON.parse(document.data().timetable)
            : [];
        const time = new Date();
        const hour = time.getHours();
        const day = time.getDay();
        const min = time.getMinutes();
        if (timeSlots.includes(hour)) {
          const notification =
            timetable.timetable[day - 1][timeSlots.indexOf(hour)];
          console.log(notification);
          admin
            .messaging()
            .send({
              notification: {
                title: "Reminder! You have a lecture",
                body: `You have a lecture of ${notification.subject} at Room No. ${notification.classNumber}`,
              },
              android: {
                priority: "high",
                notification: {
                  sound: "default",
                  color: "#4B48C9",
                  icon: "@mipmap/ic_launcher",
                },
              },
              token: document.data().fcm_token,
            })
            .then((response) => {
              console.log("Successfully sent notification:", response);
            })
            .catch((error) => {
              console.log(error);
              console.error("Error sending notification:");
            });
        }
      });
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
