const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeBDAndserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server running at http://localhost:3000`);
    });
  } catch (e) {
    console.log(`DB Error:${e.mesaage}`);
    process.exit(1);
  }
};
initializeBDAndserver();

//API 1
const getAllplayersList = (list) => {
  return {
    playerId: list.player_id,
    playerName: list.player_name,
  };
};
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `SELECT * FROM player_details`;
  const getAllplayersObj = await db.all(getAllPlayersQuery);
  response.send(getAllplayersObj.map((list) => getAllplayersList(list)));
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlyerQuery = `SELECT * FROM player_details WHERE player_id = ${playerId}`;
  const getPlayer = await db.get(getPlyerQuery);
  response.send(getAllplayersList(getPlayer));
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updateDetailsQuery = `UPDATE player_details SET
    player_name = '${playerName}' 
    WHERE player_id = ${playerId}`;
  const updatePlayer = await db.run(updateDetailsQuery);
  response.send(`Player Details Updated`);
});

//API 4
const getMatchList = (list) => {
  return {
    matchId: list.match_id,
    match: list.match,
    year: list.year,
  };
};
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT * FROM match_details WHERE match_id = ${matchId}`;
  const getMatchDT = await db.get(getMatchQuery);
  response.send(getMatchList(getMatchDT));
});

//API 5
const getMatchDetails = (list) => {
  return {
    matchId: list.match_id,
    match: list.match,
    year: list.year,
  };
};
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchDetailsQuery = `
  SELECT
  *
  FROM
  match_details INNER JOIN  player_match_score ON match_details.match_id = player_match_score.match_id
  WHERE 
  player_id = ${playerId}`;
  const getAllPlayerMatches = await db.all(getPlayerMatchDetailsQuery);
  response.send(getAllPlayerMatches.map((list) => getMatchDetails(list)));
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerWithMatchIdQuery = `
    SELECT
    *
    FROM
    player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id 
    WHERE 
    match_id = ${matchId}`;
  const getPlayerWithMatchId = await db.all(getPlayerWithMatchIdQuery);
  response.send(getPlayerWithMatchId.map((list) => getAllplayersList(list)));
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    SELECT
    player_id as playerId,
    player_name as playerName,
    sum(score) as totalScore,
    sum(fours) as totalFours,
    sum(sixes) as totalSixes
    FROM
    player_details NATURAL JOIN player_match_score 
    WHERE 
    player_id = ${playerId}`;
  const getPlayerAllDT = await db.all(getPlayerDetailsQuery);
  response.send(getPlayerAllDT[0]);
  //   response.send(getAllPlayerMatches.map((list) => getMatchDetails(list)));
});
module.exports = app;
