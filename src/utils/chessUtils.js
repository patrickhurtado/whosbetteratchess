
const TIME_CLASSES = {
  RAPID: "rapid",
};

const CHESS_COLORS = {
  WHITE: "white",
  BLACK: "black",
}


const datesAreOnSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();


const getColorOfPlayer = (username, game) => {
  const { white, black } = game;

  if (white.username.toLowerCase() === username) {
    return CHESS_COLORS.WHITE;
  }
  else if (black.username.toLowerCase() === username) {
    return CHESS_COLORS.BLACK;
  };
};

const getGameResultForUser = (username, game) => {
  const { white, black } = game;

  if (white.username.toLowerCase() === username) {
    return white;
  }
  else if (black.username.toLowerCase() === username) {
    return black;
  };
};

export const getGamesForToday = (games) => {
  if (!games) return [];

  const todayGames = [];
  const today = new Date();
  for (const game of games) {
    const pgnDate = new Date(game.end_time * 1000);
    if (datesAreOnSameDay(today, pgnDate)) {
      todayGames.push(game);
    };
  };
  return todayGames;
};

export const getLastGameBeforeToday = (games) => {
  if (!games) return [];

  const beforeGames = [];
  const today = new Date();
  for (const game of games) {
    const pgnDate = new Date(game.end_time * 1000);
    if ((!datesAreOnSameDay(today, pgnDate)) && game.time_class === TIME_CLASSES.RAPID && game.rated) {
      beforeGames.push(game);
    };
  };

  beforeGames.sort((a, b) => a.end_time - b.end_time);

  if (beforeGames.length === 0) {
    return undefined;
  };

  return beforeGames[beforeGames.length - 1];
};

export const gamesWonLossDrawnToday = (currentPlayer, games) => {
  if (!games) return {
    wins: 0,
    losses: 0,
    draws: 0,
  };
  let wins = 0;
  let losses = 0;
  let draws = 0;
  const username = currentPlayer.toLowerCase();
  for (const game of getGamesForToday(games)) {
    const { white, black } = game;
    if (white.result === black.result) {
      draws++;
    }
    else if (white.username.toLowerCase() === username) {
      white.result === "win" ? wins++ : losses++;
    }
    else if (black.username.toLowerCase() === username) {
      black.result === "win" ? wins++ : losses++;
    };
  };
  return {
    wins, losses, draws
  }
};

export const eloGainedToday = (currentPlayer, games) => {
  if (!games) return 0;
  const username = currentPlayer.toLowerCase();

  const todayGames = getGamesForToday(games).sort((a, b) => a.end_time - b.end_time);
  const ratedRapidGames = todayGames.filter(game => game.time_class === TIME_CLASSES.RAPID && game.rated);

  const lastOldGame = getLastGameBeforeToday(games);

  if (ratedRapidGames.length === 0) return 0;
  const firstRating = lastOldGame ? getGameResultForUser(username, lastOldGame).rating : getGameResultForUser(username, ratedRapidGames[0]).rating; //getColorOfPlayer(username, games[0]) === CHESS_COLORS.WHITE ? firstPgn.tags.WhiteELO : firstPgn.tags.BlackELO;
  const recentGameRating = getGameResultForUser(username, ratedRapidGames[ratedRapidGames.length - 1]).rating;

  return recentGameRating - firstRating;
};