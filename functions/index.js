const functions = require("firebase-functions");
const cors = require("cors")({origin: true});
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// http request player colors from player-colors collection
exports.playerColors = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const snapshot = await db.collection("player-colors").get();
    const data = snapshot.docs.map((doc) => doc.data());
    res.json(data);
  });
});

exports.changeColor = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const tokenId = req.headers.authorization.split("Bearer ")[1];
      await admin.auth().verifyIdToken(tokenId);
    } catch (err) {
      console.log(err);
      res.status(401).send(err);
      return;
    }

    const snapshot = await db.collection("player-colors").get();
    const colData = snapshot.docs.map((doc) => {
      const docData = {id: doc.id, data: doc.data()};
      return docData;
    });

    for (let i = 0; i < colData.length; i++) {
      if (colData[i].data.playerNum === req.body.playerNum) {
        db.collection("player-colors")
            .doc(colData[i].id)
            .update({color: req.body.color})
            .then(() => {
              console.log("Successfully updated");
            })
            .catch((err) => {
              console.error("Error updating document: ", err);
            });
      }
    }
    res.status(200).send("Successful update");
  });
});

exports.setProfileRef = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const tokenId = req.headers.authorization.split("Bearer ")[1];
      await admin.auth().verifyIdToken(tokenId);
    } catch (err) {
      console.log(err);
      res.status(401).send(err);
      return;
    }

    db.collection("player-colors").doc(req.body.uid)
        .update({profileImageUrl: req.body.downloadUrl})
        .then(() => {
          console.log("Successfully updated");
        })
        .catch((err) => {
          console.error("Error updating document: ", err);
        });

    res.status(200).send("Successful update");
  });
});
