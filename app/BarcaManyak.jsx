"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/* Sheets/scrims are triggered from all over the tree, including from deep inside
   ".card" elements — and ".card" uses backdrop-filter, which (per spec) makes it a
   containing block for its "position:fixed" descendants. That silently breaks the
   sheet's "always docked near the top of the real viewport" behavior: instead of
   being fixed to the screen, it ends up fixed relative to that card's box, which is
   why the same picker sheet could look fine from one entry point and land far too
   low from another. Rendering every scrim/sheet through a portal sidesteps this
   entirely — the portal target is the app's own ".bm" root rather than document.body,
   since every rule in this file's stylesheet is scoped as ".bm .whatever" and would
   silently stop applying to anything portaled outside that wrapper. ".bm" itself only
   sets position:relative (not transform/filter/perspective), so it's a no-op for
   "position:fixed" containing-block purposes — the scrim still ends up truly fixed
   to the viewport, just while keeping all of its styling. */
function Portal({ children }) {
  if (typeof document === "undefined") return null;
  const root = document.querySelector(".bm") || document.body;
  return createPortal(children, root);
}

const UI_COPY = {
  en: {
    loading: "Loading the league…", players: "players", nextUp: "Up Next", games: "Games", table: "Table", me: "Profile",
    seasonDone: "Season's done", seasonDoneNote: "Check the table for the damage.", live: "Live", home: "Home", away: "Away",
    days: "days", hrs: "hrs", min: "min", sec: "sec", kickoff: "Kick-off", yourTime: "your time", timeTbc: "time not confirmed",
    betsClosed: "Bets are closed", lineups: "Line-ups", refreshScore: "Refresh score", getResult: "Get result",
    autoRefresh: "Refreshing itself every 2 minutes while the game is on.", yourBet: "Your bet", dembeleFilled: "🐵 Dembele filled it",
    liveTableNote: "Game's live — points below are provisional, based on the current score, and will keep changing until full time.",
    inputModeToggle: "Switch between wheel and arrow score input",
    lastResult: "Last result", everyoneBetsTap: "tap for everyone's bets", standings: "Standings", gamesScored: "games scored",
    betHistory: "View bet history", noGamesYet: "No games played yet.",
    rules: "Rules", exactScore: "Exact score", rightDirection: "Right direction", bonusScorer: "Bonus scorer bet",
    bonusAssist: "Bonus assist bet", seasonalScorer: "Seasonal top scorer", seasonalAssister: "Seasonal top assister",
    finalScoreRule: "Final score", finalScoreRuleText: "Extra time counts; penalty shoot-outs don't.",
    doublePointsRule: "Double points", doublePointsRuleText: "Champions League knockout games, the Champions League Final, and the Copa del Rey Final all pay double.",
    doublePointsBadge: "×2 points",
    betDeadlineRule: "Bet deadline", betDeadlineRuleText: "bets close 2 minutes before kick-off",
    points3: "3 points", points1: "1 point", pointsHalf: "0.5 points", points10: "10 points",
    seasonalChoices: "Seasonal choices", seasonCalls: "Season calls · 10 points each", seasonIntro: "Two names, twenty points. Once you save them they're set until the last whistle in May.",
    topGoalscorer: "Top goalscorer", topAssist: "Top assist maker", lockBoth: "Lock both in", noEdits: "No edits after this. Choose like it's twenty points, because it is.",
    whereStands: "Where it stands", checkOnline: "Check online", topScorer: "Top scorer", topAssists: "Top assists", seasonalBets: "Seasonal bets",
    hasntCalled: "hasn't called it yet", locked: "Locked", profileSaved: "Profile saved.", nameUpdated: "Name updated.", photoUpdated: "Photo updated.",
    switchUser: "Not you? Switch profile", editName: "Edit name", saveName: "Save name", cancel: "Cancel", noPoints: "no points yet", changePhoto: "Change photo",
    teamBadges: "Team badges", manage: "Manage", hide: "Hide", theLeague: "The league", bot: "bot",
    badgeNote: "Every club shows a badge in its own colours. Upload a crest image for any team to use that instead. It applies for everyone in the league. Uploading works better than a link: most club sites block their images from loading elsewhere.",
    shareNote: "Send your friends this same link. Everything they save shows up here.", bonusBets: "Bonus bets", scorer: "Scorer", assist: "Assist",
    none: "none", clearPick: "Clear this pick", done: "Done", placeBet: "Place bet", updateBet: "Update bet",
    whoScores: "Who scores? +1", whoAssists: "Who assists? +0.5", scoreHint: "Spot on = 3 pts · right direction only = 1 pt",
    all: "All", setScoreHere: "Set any score right here. Every tap saves itself. Tap a game to open it.", missed: "missed", openMatch: "Open match",
    everyoneBets: "Everyone's bets", noBet: "no bet", noScorer: "no scorer", confirmedXI: "Confirmed XI", predictedXI: "Predicted XI",
    notPulled: "Not pulled yet", refreshLineups: "Refresh line-ups", getLineups: "Get line-ups from the web", updated: "Updated",
    kickoffDetails: "Kick-off details", edit: "Edit", checkDate: "Check date & time online", dateKickoff: "Date and kick-off (Spanish local time)", opponent: "Opponent",
    fullTime: "Full time", setResult: "Set the result by hand", open: "Open", finalScore: "Final score", barcaScorers: "Barça scorers (comma separated)", saveFullTime: "Save as full time",
    whoAreYou: "Who are you?", joinLeague: "Join the league", startLeague: "Start the league", yourName: "Your name", profilePicture: "Profile picture",
    join: "Join BarcaManyak", choosePhoto: "Choose photo", remove: "Remove", switchLanguage: "HE",
    tagline: "Every Barça game · Every silly prediction", nameExample: "e.g. Guy", sharedLeague: "Everyone who opens this sees the same league: bets, results and the table are shared.",
    betSaved: "Bet saved.", waitingMonkey: "Nothing in yet and Dembele hasn't picked either. Give it a second.", noScorerPicked: "no scorer picked",
    exactPlus: "Exact score +3", directionPlus: "Right direction +1", directionMissed: "Direction missed", scorerPlus: "scorer +1",
    bonusExplainer: "Both pay out even if your score is nowhere close.", forwards: "Forwards", midfield: "Midfield", defenders: "Defenders", keepers: "Keepers",
    noLineup: "No line-up pulled yet", viewLastLineup: "View last line-up", lastLineup: "Last match line-up", showCurrentLineup: "Back to current match",
    previousLineupUnavailable: "No earlier line-up has been saved yet.", close: "Close", homeUpdateNote: "plays at home. Changing this updates it for everyone.", you: "you",
    resultSaved: "Result saved for everyone.", doubleDown: "Double down", armed: "armed",
    doubleDownText: "Three exact scores in a row and you're armed. From the next game everything you score doubles: direction pays 2, scorer 2, assist 1, an exact score 6. Keep hitting exact scores and it rolls on. The first game you miss the exact score is still doubled, then it's over and you start again.",
    monkeyRule: "Miss a bet and Dembele the monkey bets for you.", seasonPointsNote: "Points land automatically once these names match. The final pull in May settles it.",
    uploadAllBadges: "Upload all badges at once", uploadBadgeNote: "Choose multiple crest files; each one is matched to the club named in its filename.", added: "Added", couldntPlace: "Couldn't place",
    custom: "custom", uploadImage: "Upload image", reset: "Reset", pasteImageLink: "…or paste a direct image link", use: "Use",
    seasonLockedToast: "Season bets locked in. No takebacks.", nothingLive: "Nothing live yet.", fullTimeUpdated: "Full time. Points updated for everyone.", scoreUpdated: "Score updated", scoreReadError: "Couldn't read the score. Try again in a moment.",
    lineupsLoaded: "Line-ups pulled in.", lineupsError: "Couldn't read the line-ups yet. They usually land about an hour before kick-off.", fixtureUpdated: "Fixture updated from the web.", fixtureError: "Couldn't confirm the date and time yet.",
    seasonStatsError: "Couldn't pull the season stats right now.", leading: "Leading", assistsWord: "assists",
    matchEvents: "Match events", noEvents: "No match events yet", goalEvent: "Goal", yellowCardEvent: "Yellow card", redCardEvent: "Red card", substitutionEvent: "Substitution",
    betIsIn: "Bet locked in", betNotIn: "No bet placed yet for this game", monkeyLike: "Monkey like Dembele",
    sideBets: "Side Bets", didNotAnswer: "No answer", ptsShort: "points", bonusShort: "Bonus", playsAtHome: "Plays at home", pointsWord: "points on the table", closesOn: "Closes", allSaved: "All saved",
    sideBetsIntro: "Season-long calls. One pick per question, and you can change your mind until the deadline.",
    sideBetsClosed: "Side bets are closed. They shut on 1 September 2026.",
    sideBetsEditable: "You can keep editing these until the deadline.",
    saveSideBets: "Save side bets", sideBetsSaved: "Side bets saved.", whoPicked: "Who has picked",
    saveFailed: "Could not save. Try again.",
    choosePreset: "Choose a picture", uploadYourOwn: "Upload your own", lastLineupSource: "Last match: FC Basel · 16 Aug 2026",
    devMode: "Dev mode", enterPassword: "Password", wrongPassword: "Wrong password.", unlock: "Unlock",
    openDevPanel: "Open dev panel", lockDev: "Lock",
    devSideBets: "Side bets", devUsers: "Users", devFixtures: "Fixtures",
    devSideBetsIntro: "Set the real outcome for each side bet. Points land for everyone the moment you pick one.",
    devClosed: "closed", devOutcomeSaved: "Outcome saved. Points updated.", devOutcomeCleared: "Outcome cleared.", devClearOutcome: "Clear",
    devUserSaved: "User updated.", devUserDeleted: "User deleted.", devDeleteUser: "Delete", devConfirmDelete: "Confirm delete", devNoUsers: "No players yet.",
    devSeedTitle: "Seed test data", devSeedNote: "Fills in a random score (and sometimes a scorer/assist) for every fixture that doesn't already have a bet, for every player. Never overwrites an existing bet — safe to run more than once.",
    devSeedButton: "Seed random bets for everyone", devSeedDone: "Random bets added.",
    devOpponent: "Opponent", devDate: "Date", devTime: "Time (Spanish local time)", devFixtureSaved: "Fixture updated.", save: "Save",
    devApiId: "Live data link (advanced)", devApiIdHint: "Optional. Paste a TheSportsDB event id as sdb:1234 to pull real live minute/score/goals for this fixture, even for a friendly. Leave blank for none.",
  },
  he: {
    loading: "טוען את הליגה…", players: "שחקנים", nextUp: "המשחק הבא", games: "משחקים", table: "טבלה", me: "פרופיל",
    seasonDone: "העונה הסתיימה", seasonDoneNote: "אפשר לבדוק את הנזק בטבלה.", live: "חי", home: "בית", away: "חוץ",
    days: "ימים", hrs: "שעות", min: "דקות", sec: "שניות", kickoff: "שריקת פתיחה", yourTime: "בזמן המקומי שלך", timeTbc: "השעה טרם אושרה",
    betsClosed: "ההימורים נסגרו", lineups: "הרכבים", refreshScore: "רענון תוצאה", getResult: "קבלת תוצאה",
    autoRefresh: "הנתונים מתעדכנים אוטומטית כל 2 דקות בזמן המשחק.", yourBet: "ההימור שלך", dembeleFilled: "🐵 דמבלה מילא במקומך",
    liveTableNote: "יש משחק חי — הניקוד למטה זמני, מבוסס על התוצאה הנוכחית, וימשיך להשתנות עד לסיום המשחק.",
    inputModeToggle: "החלפה בין גלגלת לחיצים לבחירת התוצאה",
    lastResult: "התוצאה האחרונה", everyoneBetsTap: "לחצו לצפייה בהימורים של כולם", standings: "טבלה", gamesScored: "משחקים חושבו",
    betHistory: "צפייה בהיסטוריית הימורים", noGamesYet: "עדיין לא היו משחקים.",
    rules: "חוקים", exactScore: "תוצאה מדויקת", rightDirection: "כיוון נכון", bonusScorer: "בונוס על כובש",
    bonusAssist: "בונוס על בישול", seasonalScorer: "מלך השערים העונתי", seasonalAssister: "מלך הבישולים העונתי",
    finalScoreRule: "תוצאת הסיום", finalScoreRuleText: "כולל הארכה; פנדלים לא נספרים.",
    doublePointsRule: "ניקוד כפול", doublePointsRuleText: "משחקי נוקאאוט בליגת האלופות, גמר ליגת האלופות וגמר גביע המלך משלמים ניקוד כפול.",
    doublePointsBadge: "×2 נקודות",
    betDeadlineRule: "מועד סגירת ההימורים", betDeadlineRuleText: "ההימורים נסגרים 2 דקות לפני שריקת הפתיחה",
    points3: "3 נקודות", points1: "נקודה אחת", pointsHalf: "0.5 נקודה", points10: "10 נקודות",
    seasonalChoices: "בחירות עונתיות", seasonCalls: "בחירות עונתיות · 10 נקודות לכל בחירה", seasonIntro: "שני שמות, עשרים נקודות. לאחר השמירה הבחירות נעולות עד שריקת הסיום האחרונה במאי.",
    topGoalscorer: "מלך השערים", topAssist: "מלך הבישולים", lockBoth: "נעילת שתי הבחירות", noEdits: "לא ניתן לערוך לאחר הנעילה. בחרו בזהירות, אלה עשרים נקודות.",
    whereStands: "המצב כרגע", checkOnline: "בדיקה ברשת", topScorer: "מלך השערים", topAssists: "מלך הבישולים", seasonalBets: "הימורים עונתיים",
    hasntCalled: "עדיין לא בחר", locked: "נעול", profileSaved: "הפרופיל נשמר.", nameUpdated: "השם עודכן.", photoUpdated: "התמונה עודכנה.",
    switchUser: "לא אתה? החלפת פרופיל", editName: "עריכת שם", saveName: "שמירת שם", cancel: "ביטול", noPoints: "עדיין אין נקודות", changePhoto: "החלפת תמונה",
    teamBadges: "סמלי קבוצות", manage: "ניהול", hide: "הסתרה", theLeague: "חברי הליגה", bot: "בוט",
    badgeNote: "לכל מועדון מוצג סמל בצבעיו. אפשר להעלות תמונת סמל לכל קבוצה והיא תופיע אצל כולם. העלאת קובץ אמינה יותר מקישור, מכיוון שאתרים רבים חוסמים טעינת תמונות חיצונית.",
    shareNote: "שלחו לחברים את אותו קישור. כל מה שהם שומרים יופיע כאן.", bonusBets: "הימורי בונוס", scorer: "כובש", assist: "מבשל",
    none: "ללא", clearPick: "ניקוי הבחירה", done: "סיום", placeBet: "שליחת הימור", updateBet: "עדכון הימור",
    whoScores: "מי יכבוש? 1+", whoAssists: "מי יבשל? 0.5+", scoreHint: "תוצאה מדויקת = 3 נק׳ · כיוון נכון בלבד = נקודה",
    all: "הכול", setScoreHere: "אפשר לקבוע תוצאה כאן, כל לחיצה נשמרת. לחצו על משחק כדי לפתוח אותו.", missed: "הוחמץ", openMatch: "פתיחת משחק",
    everyoneBets: "ההימורים של כולם", noBet: "ללא הימור", noScorer: "ללא כובש", confirmedXI: "הרכב מאושר", predictedXI: "הרכב משוער",
    notPulled: "טרם התקבל", refreshLineups: "רענון הרכבים", getLineups: "קבלת הרכבים מהרשת", updated: "עודכן",
    kickoffDetails: "פרטי המשחק", edit: "עריכה", checkDate: "בדיקת תאריך ושעה ברשת", dateKickoff: "תאריך ושעת פתיחה (שעון ספרד)", opponent: "יריבה",
    fullTime: "סיום", setResult: "הזנת תוצאה ידנית", open: "פתיחה", finalScore: "תוצאת סיום", barcaScorers: "כובשי בארסה (מופרדים בפסיקים)", saveFullTime: "שמירה כתוצאת סיום",
    whoAreYou: "מי אתם?", joinLeague: "הצטרפות לליגה", startLeague: "פתיחת הליגה", yourName: "השם שלך", profilePicture: "תמונת פרופיל",
    join: "הצטרפות ל־BarcaManyak", choosePhoto: "בחירת תמונה", remove: "הסרה", switchLanguage: "EN",
    tagline: "כל משחק של בארסה · כל ניחוש משוגע", nameExample: "למשל גיא", sharedLeague: "כל מי שפותח את הקישור רואה את אותה ליגה: ההימורים, התוצאות והטבלה משותפים לכולם.",
    betSaved: "ההימור נשמר.", waitingMonkey: "עדיין אין הימור ודמבלה עוד לא בחר, תנו לו רגע.", noScorerPicked: "לא נבחר כובש",
    exactPlus: "תוצאה מדויקת 3+", directionPlus: "כיוון נכון 1+", directionMissed: "הכיוון הוחמץ", scorerPlus: "כובש 1+",
    bonusExplainer: "שני הבונוסים ניתנים גם אם תוצאת ההימור רחוקה מהתוצאה בפועל.", forwards: "חלוצים", midfield: "קישור", defenders: "הגנה", keepers: "שוערים",
    noLineup: "ההרכב טרם התקבל", viewLastLineup: "צפייה בהרכב האחרון", lastLineup: "ההרכב מהמשחק הקודם", showCurrentLineup: "חזרה למשחק הנוכחי",
    previousLineupUnavailable: "עדיין לא נשמר הרכב ממשחק קודם.", close: "סגירה", homeUpdateNote: "מארחת. שינוי כאן יתעדכן אצל כולם.", you: "אתם",
    resultSaved: "התוצאה נשמרה עבור כולם.", doubleDown: "דאבל דאון", armed: "מוכן",
    doubleDownText: "שלוש תוצאות ברצף מפעילות דאבל דאון. מהמשחק הבא כל הניקוד מוכפל: כיוון שווה 2, כובש 2, בישול 1 ותוצאה מדויקת 6. הרצף נמשך כל עוד פוגעים בתוצאה המדויקת. המשחק הראשון שבו מחמיצים עדיין מוכפל, ואז הרצף מתחיל מחדש.",
    monkeyRule: "אם פספסתם הימור, דמבלה הקוף יהמר במקומכם.", seasonPointsNote: "הנקודות מחושבות אוטומטית כשהשמות תואמים. הבדיקה האחרונה במאי סוגרת את התוצאה.",
    uploadAllBadges: "העלאת כל הסמלים יחד", uploadBadgeNote: "בחרו כמה קובצי סמלים; כל קובץ ישויך למועדון לפי השם שלו.", added: "נוספו", couldntPlace: "לא ניתן לשייך",
    custom: "מותאם", uploadImage: "העלאת תמונה", reset: "איפוס", pasteImageLink: "…או הדבקת קישור ישיר לתמונה", use: "שימוש",
    seasonLockedToast: "הבחירות העונתיות ננעלו ולא ניתן לשנותן.", nothingLive: "אין משחק חי כרגע.", fullTimeUpdated: "המשחק הסתיים והנקודות עודכנו לכולם.", scoreUpdated: "התוצאה עודכנה", scoreReadError: "לא הצלחנו לקרוא את התוצאה. נסו שוב בעוד רגע.",
    lineupsLoaded: "ההרכבים התקבלו.", lineupsError: "עדיין לא הצלחנו לקבל את ההרכבים, לרוב הם מתפרסמים כשעה לפני המשחק.", fixtureUpdated: "פרטי המשחק עודכנו מהרשת.", fixtureError: "עדיין לא הצלחנו לאשר את התאריך והשעה.",
    seasonStatsError: "לא הצלחנו לקבל כרגע את נתוני העונה.", leading: "מובילים", assistsWord: "בישולים",
    matchEvents: "אירועי המשחק", noEvents: "עדיין אין אירועים במשחק", goalEvent: "שער", yellowCardEvent: "כרטיס צהוב", redCardEvent: "כרטיס אדום", substitutionEvent: "חילוף",
    betIsIn: "ההימור נשמר", betNotIn: "עדיין לא הימרתם על המשחק הזה", monkeyLike: "קוף כמו דמבלה",
    sideBets: "הימורי צד", didNotAnswer: "לא ענו", ptsShort: "נקודות", bonusShort: "בונוס", playsAtHome: "משחקת בבית", pointsWord: "נקודות על הפרק", closesOn: "נסגר ב־", allSaved: "הכול שמור",
    sideBetsIntro: "הימורים לכל העונה. בחירה אחת לכל שאלה, ואפשר לשנות עד מועד הסגירה.",
    sideBetsClosed: "הימורי הצד נסגרו: מועד הסגירה היה 1 בספטמבר 2026.",
    sideBetsEditable: "אפשר לערוך את הבחירות עד מועד הסגירה.",
    saveSideBets: "שמירת הימורי הצד", sideBetsSaved: "הימורי הצד נשמרו.", whoPicked: "מי כבר בחר",
    saveFailed: "השמירה נכשלה, נסו שוב.", choosePreset: "בחירת תמונה", uploadYourOwn: "העלאת תמונה משלכם", lastLineupSource: "המשחק האחרון: פ.צ. באזל · 16 באוגוסט 2026",
    devMode: "מצב פיתוח", enterPassword: "סיסמה", wrongPassword: "סיסמה שגויה.", unlock: "פתיחה",
    openDevPanel: "פתיחת פאנל הפיתוח", lockDev: "נעילה",
    devSideBets: "הימורי צד", devUsers: "משתמשים", devFixtures: "משחקים",
    devSideBetsIntro: "קבעו את התוצאה בפועל לכל הימור צד. הנקודות מתעדכנות לכולם ברגע שנבחרת תוצאה.",
    devClosed: "נסגרו", devOutcomeSaved: "התוצאה נשמרה, הנקודות עודכנו.", devOutcomeCleared: "התוצאה נמחקה.", devClearOutcome: "ניקוי",
    devUserSaved: "המשתמש עודכן.", devUserDeleted: "המשתמש נמחק.", devDeleteUser: "מחיקה", devConfirmDelete: "אישור מחיקה", devNoUsers: "עדיין אין שחקנים.",
    devSeedTitle: "מילוי נתוני בדיקה", devSeedNote: "ממלא תוצאה אקראית (ולפעמים גם כובש/מבשל) לכל משחק שעדיין אין לו הימור, לכל שחקן. לא דורס הימור קיים — בטוח להריץ יותר מפעם אחת.",
    devSeedButton: "מילוי הימורים אקראיים לכולם", devSeedDone: "נוספו הימורים אקראיים.",
    devOpponent: "יריבה", devDate: "תאריך", devTime: "שעה (שעון ספרד)", devFixtureSaved: "פרטי המשחק עודכנו.", save: "שמירה",
    devApiId: "קישור לנתונים חיים (מתקדם)", devApiIdHint: "אופציונלי. הדביקו מזהה אירוע מ-TheSportsDB בפורמט sdb:1234 כדי למשוך דקה/תוצאה/גולים אמיתיים בשידור חי למשחק הזה, גם אם זה משחק ידידות. השאירו ריק אם אין צורך.",
  },
};

const LanguageContext = React.createContext({ lang: "en", t: (key) => UI_COPY.en[key] || key });
const useI18n = () => React.useContext(LanguageContext);
const FootballContext = React.createContext({ squad: [] });
const useFootball = () => React.useContext(FootballContext);

/* ============================================================
   BarcaManyak — Barça betting league 2026/27
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap');

.bm * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.bm {
  --garnet:#A50044; --garnet-lo:#6B002C; --blue:#004D98; --blue-dp:#00305F;
  --gold:#EDBB00; --yellow:#FFED02; --red:#DB0030;
  --ink:#0A0C10; --ink-2:#121721; --ink-3:#1B2230;
  --bone:#F7F4EC; --bone-dim:#A7A9AE;
  --line:rgba(247,244,236,.12); --win:#4FD18B; --lose:#E8595B; --live:#DB0030;
  font-family:'Inter',system-ui,-apple-system,sans-serif;
  background-color:var(--ink);
  /* the FC Barcelona crest+wordmark photo used to sit behind this gradient; on the
     Games tab its white lettering ended up peeking out just above the fixtures card
     and getting visually cropped by the card's top edge, so it's been dropped —
     just the ambient vignette gradient remains, with no source image to crop. */
  background-image:
    linear-gradient(180deg,rgba(4,8,14,.30) 0,rgba(10,12,16,.72) 330px,var(--ink) 760px);
  background-size:100% 760px;
  background-position:center top;
  background-repeat:no-repeat;
  color:var(--bone);
  min-height:100vh; padding-bottom:84px; max-width:760px; margin:0 auto; position:relative;
}
.bm h1,.bm h2,.bm h3,.bm .display {
  font-family:'Anton','Arial Narrow',Impact,sans-serif;
  font-weight:400; text-transform:uppercase; letter-spacing:.02em; margin:0;
}
/* was JetBrains Mono: the dotted zero read badly. Inter with tabular figures keeps
   numbers aligned in columns without switching typeface. */
.bm .mono { font-variant-numeric:tabular-nums; font-feature-settings:'tnum' 1,'zero' 0; letter-spacing:-.01em; }
.bm .band { height:7px; background:repeating-linear-gradient(90deg,var(--garnet) 0 14px,var(--blue) 14px 28px);
  box-shadow:inset 0 1.5px 0 var(--gold), inset 0 -1.5px 0 var(--gold); }
.bm .senyera { height:5px; background:repeating-linear-gradient(90deg,var(--yellow) 0 7px,var(--red) 7px 14px); }
.bm .topbar { display:flex; align-items:center; gap:10px; padding:14px 16px 12px; direction:ltr;
  background:linear-gradient(160deg,rgba(107,0,44,.88),rgba(10,12,16,.62) 78%);
  backdrop-filter:blur(9px); -webkit-backdrop-filter:blur(9px); }
.bm .brand-icons { display:flex; align-items:center; gap:7px; flex:none; }
.bm .messi-mark { width:43px; height:43px; object-fit:cover; object-position:center 28%; border-radius:12px;
  border:1px solid rgba(237,187,0,.45); box-shadow:0 5px 16px rgba(0,0,0,.35); }
.bm .lang-toggle { width:auto; min-width:45px; padding:7px 10px; border-radius:9px; background:rgba(247,244,236,.08);
  color:var(--gold); border:1px solid var(--line); font-size:11px; font-weight:800; letter-spacing:.04em; }
.bm .name-edit { width:29px; height:29px; border-radius:9px; padding:0; display:grid; place-items:center;
  background:rgba(247,244,236,.07); color:var(--gold); border:1px solid var(--line); flex:none; }
.bm .name-edit svg { width:14px; height:14px; }
.bm[dir="rtl"] { text-align:right; }
.bm[dir="rtl"] .mono { direction:ltr; unicode-bidi:isolate; }
.bm[dir="rtl"] .x { margin-left:0; margin-right:auto; }
.bm .wordmark { font-size:27px; line-height:1; letter-spacing:-.01em; display:inline-flex;
  direction:ltr; unicode-bidi:isolate; align-items:baseline;
  text-shadow:0 3px 14px rgba(0,0,0,.6); }
.bm .wordmark .wm-a { color:var(--bone); -webkit-text-stroke:.6px rgba(10,12,16,.55); }
.bm .wordmark .wm-b { background:linear-gradient(180deg,#FFED02 0%,#EDBB00 55%,#B98A00 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  -webkit-text-fill-color:transparent; padding-inline-end:2px; }
.bm .wordmark::after { content:""; display:block; }

.bm .tagline { font-size:9.5px; letter-spacing:.18em; color:var(--bone-dim); text-transform:uppercase;
  margin-top:4px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.bm .tagline-count { white-space:nowrap; }
.bm .tagline-dot { opacity:.6; }
.bm .tagline-season { direction:ltr; unicode-bidi:isolate; letter-spacing:.1em; }
.bm .wrap { padding:16px; }
.bm .card { background:rgba(18,23,33,.92); border:1px solid var(--line); border-radius:16px; padding:16px;
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.bm .card + .card { margin-top:12px; }
.bm .eyebrow { font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--bone-dim); }

.bm .hero { border-radius:20px; overflow:hidden; border:1px solid rgba(247,244,236,.16);
  background:radial-gradient(120% 100% at 50% 0%,rgba(27,36,64,.88) 0%,rgba(18,23,33,.9) 58%,rgba(10,12,16,.94) 100%);
  backdrop-filter:blur(9px); -webkit-backdrop-filter:blur(9px); box-shadow:0 18px 46px rgba(0,0,0,.22); }
.bm .hero-in { padding:18px 16px 20px; }
.bm .comp-chip { display:inline-flex; align-items:center; gap:6px; font-size:10px; letter-spacing:.16em;
  text-transform:uppercase; padding:5px 9px; border-radius:999px;
  background:rgba(242,193,78,.12); color:var(--gold); border:1px solid rgba(242,193,78,.28); }
.bm .live-chip { background:rgba(255,77,77,.14); color:#FF8080; border-color:rgba(255,77,77,.4); }
.bm .dot { width:7px; height:7px; border-radius:50%; background:var(--live); animation:bmpulse 1.4s infinite; }
@keyframes bmpulse { 50% { opacity:.25; } }
.bm .vs { display:flex; align-items:flex-start; justify-content:center; gap:10px; margin:16px 0 6px; }
.bm .team { flex:1; text-align:center; }
.bm .team-name { font-size:17px; line-height:1.05; margin-top:8px; }
.bm .team-tag { font-size:9.5px; letter-spacing:.18em; color:var(--bone-dim); margin-top:5px; text-transform:uppercase; }
.bm .dash { font-size:12px; color:var(--bone-dim); letter-spacing:.16em; padding-top:26px; }
.bm .bigscore { font-size:44px; line-height:1; padding-top:14px; }
.bm .clock { display:flex; gap:8px; justify-content:center; margin-top:14px; }
.bm .clock div { min-width:58px; padding:8px 4px; border-radius:12px; text-align:center;
  background:rgba(243,238,226,.05); border:1px solid var(--line); }
.bm .clock b { display:block; font-size:22px; line-height:1; }
.bm .clock i { font-style:normal; font-size:9px; letter-spacing:.14em; color:var(--bone-dim); text-transform:uppercase; }
.bm .kickoff { text-align:center; font-size:12.5px; color:var(--bone-dim); margin-top:12px; }

.bm button { font-family:inherit; cursor:pointer; border:none; }
.bm .btn { display:inline-flex; align-items:center; justify-content:center; gap:7px;
  padding:12px 16px; border-radius:12px; font-size:14px; font-weight:600;
  background:var(--garnet); color:#fff; width:100%; }
.bm .btn:active { transform:translateY(1px); }
.bm .btn.ghost { background:rgba(243,238,226,.06); color:var(--bone); border:1px solid var(--line); }
.bm .btn.gold { background:var(--gold); color:#2A1E00; }
.bm .btn.red { background:var(--live); color:#fff; }
.bm .btn:disabled { opacity:.42; cursor:not-allowed; }
.bm .btn.sm { padding:8px 12px; font-size:12.5px; width:auto; }
.bm .row { display:flex; gap:8px; }

/* scroll-wheel score picker (see ScoreWheel component). Base .wheel is the full size
   used on the Up Next tab; .wheel.compact is the smaller "option 2" size (single-number
   peek) used on the Games tab, where rows are tighter. Both are self-contained size
   systems — item height (and thus the scroll math) differs between them, so each has
   its own full set of dimensions below rather than sharing one. */
.bm .wheel { position:relative; width:64px; height:120px; overflow:hidden; border-radius:14px;
  background:rgba(243,238,226,.04); border:1px solid var(--line); }
/* height must stay an exact multiple of the item height (3 x 40) — that's what
   makes "scrollTop = index * itemHeight" the true centered/snapped position for
   every index; any other height creates a constant offset between the browser's
   own scroll-snap centering and the JS math, and the two fight each other. */
.bm .wheel.compact { width:34px; height:40px; border-radius:10px; }
/* compact's height (2 x 20) is its own exact multiple — see the note above. */
.bm .wheel-mask-top, .bm .wheel-mask-bottom { position:absolute; left:0; right:0; height:34%; z-index:2; pointer-events:none; }
.bm .wheel-mask-top { top:0; background:linear-gradient(180deg, var(--ink-2), rgba(18,23,33,0)); }
.bm .wheel-mask-bottom { bottom:0; background:linear-gradient(0deg, var(--ink-2), rgba(18,23,33,0)); }
.bm .wheel-window { position:absolute; top:50%; left:6px; right:6px; height:40px; margin-top:-20px;
  border-top:1px solid rgba(237,187,0,.4); border-bottom:1px solid rgba(237,187,0,.4);
  background:rgba(237,187,0,.06); border-radius:8px; pointer-events:none; z-index:1; }
.bm .wheel.compact .wheel-window { left:4px; right:4px; height:20px; margin-top:-10px; border-radius:6px; }
.bm .wheel-track { height:100%; overflow-y:scroll; scroll-snap-type:y mandatory; scrollbar-width:none;
  -ms-overflow-style:none; }
.bm .wheel-track::-webkit-scrollbar { display:none; }
.bm .wheel-track::before, .bm .wheel-track::after { content:""; display:block; height:40px; }
.bm .wheel.compact .wheel-track::before, .bm .wheel.compact .wheel-track::after { height:10px; }
.bm .wheel-item { height:40px; display:flex; align-items:center; justify-content:center; font-size:24px;
  font-family:'Anton',sans-serif; color:var(--bone-dim); scroll-snap-align:center; }
.bm .wheel.compact .wheel-item { height:20px; font-size:15px; }
.bm .wheel-item.on { color:var(--gold); }

/* old up/down arrow stepper, brought back as an alternative to the wheel — toggled per
   tab via the "FN" button (see InputModeToggle). Same two-size system as the wheel. */
.bm .stepper { display:flex; flex-direction:column; align-items:center; gap:4px; width:64px; }
.bm .stepper.compact { width:34px; gap:2px; }
.bm .stepper-btn { width:100%; height:26px; display:flex; align-items:center; justify-content:center;
  background:rgba(243,238,226,.06); border:1px solid var(--line); border-radius:8px;
  color:var(--bone-dim); font-size:12px; padding:0; }
.bm .stepper-btn:disabled { opacity:.3; }
.bm .stepper.compact .stepper-btn { height:18px; border-radius:6px; font-size:9px; }
.bm .stepper-value { font-family:'Anton',sans-serif; font-size:26px; color:var(--gold); line-height:1; padding:4px 0; }
.bm .stepper.compact .stepper-value { font-size:17px; padding:1px 0; }

/* small "FN" pill that swaps the wheel for the old arrow stepper on a given tab */
.bm .fn-toggle { width:29px; height:29px; flex:none; padding:0; border-radius:9px;
  background:rgba(247,244,236,.08); color:var(--bone-dim); border:1px solid var(--line);
  font-size:10.5px; font-weight:800; letter-spacing:.02em; }
.bm .fn-toggle.on { color:var(--gold); border-color:rgba(237,187,0,.4); background:rgba(237,187,0,.1); }

.bm .pick-list { max-height:52vh; overflow-y:auto; margin:-4px -4px 0; padding:4px; }
.bm .pick { display:flex; align-items:center; gap:10px; width:100%; text-align:left;
  padding:11px 12px; border-radius:12px; background:rgba(243,238,226,.04);
  border:1px solid transparent; color:var(--bone); font-size:14px; margin-bottom:6px; }
.bm .pick.on { border-color:var(--gold); background:rgba(242,193,78,.11); }
.bm .player-photo { width:34px; height:34px; border-radius:50%; object-fit:cover; background:var(--ink-3); flex:none; }
.bm .num { width:28px; height:28px; border-radius:8px; display:grid; place-items:center;
  font-size:11.5px; background:var(--blue); color:#DDE6FF; flex:none; }
.bm .pos { margin-left:auto; font-size:9.5px; letter-spacing:.14em; color:var(--bone-dim); }

.bm .av-btn { padding:0; border:none; background:none; flex:none;
  display:flex; flex-direction:column; align-items:center; gap:3px; width:auto; }
.bm .av-btn:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
.bm .av-btn-label { font-size:9px; letter-spacing:.04em; color:var(--bone-dim); line-height:1; }
.bm .av { border-radius:50%; object-fit:cover; flex:none; background:var(--ink-3);
  display:grid; place-items:center; overflow:hidden; }
.bm .av.xs { width:24px; height:24px; font-size:11px; }
.bm .av.s { width:30px; height:30px; font-size:13px; }
.bm .av.m { width:40px; height:40px; font-size:17px; }
.bm .av.l { width:76px; height:76px; font-size:32px; }

.bm .frow { display:flex; align-items:center; gap:11px; padding:11px 0; border-top:1px solid var(--line); }
.bm .frow:first-child { border-top:none; }
.bm .grow { flex:1; min-width:0; }
.bm .nm { font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.bm .sub { font-size:11.5px; color:var(--bone-dim); margin-top:2px; }
.bm .pts { font-size:20px; }
.bm .rank { width:22px; font-size:13px; color:var(--bone-dim); text-align:right; flex:none; }
.bm .medal { color:var(--gold); }
.bm .frow.armed { border:1px solid rgba(237,187,0,.55); border-radius:12px; padding:11px 10px;
  margin:3px 0; background:linear-gradient(140deg,rgba(237,187,0,.14),rgba(237,187,0,.03));
  box-shadow:0 0 12px rgba(237,187,0,.15); }
.bm .tag { font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; padding:3px 7px;
  border-radius:6px; background:rgba(243,238,226,.08); color:var(--bone-dim); }
.bm .tag.in { background:rgba(79,209,139,.14); color:var(--win); }
.bm .tag.out { background:rgba(232,89,91,.14); color:var(--lose); }
.bm .tag.monkey { background:rgba(242,193,78,.15); color:var(--gold); }
.bm .tag.big { font-size:10.5px; padding:5px 10px; letter-spacing:.14em; }

.bm .fx { display:flex; align-items:center; gap:10px; width:100%; text-align:left;
  padding:12px 0; border-top:1px solid var(--line); background:none; color:var(--bone); }
.bm .fx-date { width:44px; flex:none; text-align:center; }
.bm .fx-date b { display:block; font-size:18px; line-height:1; margin-top:2px; }
.bm .fx-date i { display:block; font-style:normal; font-size:9px; letter-spacing:.1em; color:var(--bone-dim); text-transform:uppercase; }
.bm .month { font-size:11px; letter-spacing:.2em; color:var(--gold); text-transform:uppercase; margin:18px 0 2px; font-weight:700; }
.bm .score-pill { font-size:14px; padding:4px 9px; border-radius:8px; background:var(--ink-3); flex:none; }
.bm .quick { background:rgba(243,238,226,.03); border:1px solid var(--line);
  border-radius:14px; padding:12px; margin:2px 0 10px; }
.bm .fxrow { display:flex; align-items:center; gap:8px; padding:9px 0; border-top:1px solid var(--line); }
.bm .fxrow:first-child { border-top:none; }
.bm .fxmain { display:flex; align-items:center; gap:10px; flex:1; min-width:0;
  background:none; color:var(--bone); text-align:left; padding:0; }
.bm .vb { display:flex; align-items:flex-start; gap:8px; flex:none; }
.bm .vb-col { display:flex; flex-direction:column; align-items:center; gap:4px; width:48px; }
.bm .vb-tag { font-size:8px; letter-spacing:.06em; color:var(--bone-dim); text-transform:uppercase; }
/* ---- games list, layout A ---- */
.bm .fxcard { padding:13px 0; border-top:1px solid var(--line); }
.bm .fxcard:first-of-type { border-top:none; }
.bm .fxcard-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:9px; }
.bm .fx-when { display:flex; align-items:center; gap:7px; background:none; padding:0; color:var(--bone-dim);
  font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; font-family:inherit; }
.bm .fx-when b { color:var(--bone); font-weight:600; letter-spacing:0; text-transform:none; font-size:11.5px; }
.bm .fx-dot { width:3px; height:3px; border-radius:50%; background:var(--bone-dim); flex:none; opacity:.7; }
.bm .fx-bonus { flex:none; display:inline-flex; align-items:center; gap:5px; padding:5px 10px;
  border-radius:999px; background:rgba(247,244,236,.05); border:1px solid var(--line);
  color:var(--bone-dim); font-size:11.5px; font-weight:600; max-width:140px;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.bm .fx-bonus.on { border-color:rgba(237,187,0,.45); background:rgba(237,187,0,.12); color:var(--gold); }
.bm .fxcard-body { display:flex; align-items:center; gap:12px; }
.bm .fx-teams { flex:1; min-width:0; display:flex; flex-direction:column; align-items:stretch;
  gap:7px; background:none; padding:0; color:var(--bone); text-align:start; }
.bm .fx-side { display:flex; align-items:center; gap:8px;
  font-size:14.5px; font-weight:600; min-width:0; width:100%; text-align:start; }
/* the pseudo element eats every spare pixel AFTER the content, which pins the crest
   and the name to the reading edge: right in Hebrew, left in English */
.bm .fx-side::after { content:""; flex:1 1 auto; min-width:0; }
/* the crest is always the first thing on the reading edge, so both rows line up */
.bm .fx-side > svg, .bm .fx-side > img { flex:none; }
/* layout A gives each club its own line, so drop the two-line clamp from the old row */
.bm .fx-side .club-name { max-width:none; white-space:normal; overflow:visible;
  display:inline; line-height:1.2; }
.bm .fx-home { font-size:11px; opacity:.85; flex:none; }
.bm .fxcard-comp { margin-top:8px; }
.bm .fx-team { display:flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600;
  white-space:nowrap; overflow:hidden; }
.bm .fx-team + .fx-team { margin-top:3px; }
.bm .fx-comp { padding-inline-start:26px; }
.bm .bet-in { display:flex; align-items:center; gap:10px; margin-top:12px; padding:10px 12px;
  border-radius:12px; background:rgba(79,209,139,.1); border:1px solid rgba(79,209,139,.32); }
.bm .bet-in-tick { width:24px; height:24px; border-radius:50%; background:var(--win); color:#06240f;
  display:grid; place-items:center; font-size:14px; font-weight:800; flex:none; }
.bm .bet-in-title { font-size:12px; font-weight:700; color:var(--win); }
.bm .bet-in-detail { font-size:13px; margin-top:2px; }
.bm-splash { position:fixed; inset:0; z-index:9999; overflow:hidden; background:#0A0C10;
  animation:bmSplashOut .55s ease .95s forwards; }
.bm-splash-crest { position:absolute; left:50%; top:42%; width:44vw; max-width:230px;
  transform:translate(-50%,-50%); object-fit:contain;
  filter:drop-shadow(0 10px 34px rgba(0,0,0,.7));
  animation:bmSplashZoom 1.5s cubic-bezier(.3,.02,.3,1) forwards; }
.bm-splash-veil { position:absolute; inset:0;
  background:radial-gradient(120% 90% at 50% 30%,rgba(10,12,16,0) 0,rgba(10,12,16,.35) 60%,rgba(10,12,16,.9) 100%); }
.bm-splash-word { position:absolute; left:0; right:0; bottom:22%; text-align:center; direction:ltr;
  font-family:'Anton','Arial Narrow',Impact,sans-serif; text-transform:uppercase; letter-spacing:.03em;
  font-size:34px; color:#F7F4EC; text-shadow:0 4px 22px rgba(0,0,0,.8);
  animation:bmSplashWord 1.1s ease forwards; }
.bm-splash-word span { color:#EDBB00; }
@keyframes bmSplashZoom { from { transform:translate(-50%,-50%) scale(.86); opacity:.4; }
  60% { opacity:1; } to { transform:translate(-50%,-50%) scale(1.12); opacity:1; } }
@keyframes bmSplashWord { 0% { opacity:0; transform:translateY(10px); } 45% { opacity:1; transform:none; } 100% { opacity:0; } }
@keyframes bmSplashOut { to { opacity:0; visibility:hidden; } }
@media (prefers-reduced-motion:reduce) {
  .bm-splash { animation:bmSplashOut .3s ease forwards; }
  .bm-splash-crest, .bm-splash-word { animation:none; }
}
.bm .bonus-fx { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:7px;
  padding:10px 12px; margin-bottom:12px; border-radius:12px; direction:ltr;
  background:rgba(247,244,236,.05); border:1px solid var(--line); }
.bm .bonus-fx-name { font-size:13.5px; font-weight:700; }
.bm .bonus-fx-v { font-size:10px; color:var(--bone-dim); }
.bm .bonus-fx-when { flex-basis:100%; text-align:center; font-size:11px; color:var(--bone-dim); }
.bm .side-icon { width:38px; height:38px; flex:none; object-fit:contain;
  border-radius:9px; background:rgba(247,244,236,.06); padding:3px; }
.bm .side-q { flex:1; font-size:14.5px; font-weight:600; line-height:1.35; }
.bm .side-pts { flex:none; font-size:12px; font-weight:700; color:var(--gold);
  background:rgba(237,187,0,.13); border:1px solid rgba(237,187,0,.32); border-radius:7px; padding:3px 8px; }
.bm .side-opts { display:flex; flex-wrap:wrap; gap:7px; margin-top:11px; }
.bm .side-opt { padding:9px 13px; border-radius:11px; font-size:13.5px; font-weight:600;
  background:rgba(247,244,236,.05); border:1px solid var(--line); color:var(--bone); }
.bm .side-opt.on { background:rgba(237,187,0,.15); border-color:var(--gold); color:var(--gold); }
.bm .side-opt:disabled { opacity:.55; }
.bm .opt-bonus { margin-inline-start:4px; font-size:10.5px; font-weight:800; color:var(--gold); }
.bm .side-faces { display:flex; gap:10px; margin-top:11px; }
.bm .side-faces-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:9px; }
.bm .side-faces-grid .side-face { padding:9px 5px; font-size:11.5px; }
.bm .side-faces-grid .side-face img, .bm .side-faces-grid .side-noface { width:54px; height:54px; }
.bm .side-face { flex:1; display:flex; flex-direction:column; align-items:center; gap:7px;
  padding:11px 8px; border-radius:14px; background:rgba(247,244,236,.05);
  border:1px solid var(--line); color:var(--bone); font-size:12.5px; font-weight:600; text-align:center; }
.bm .side-face img { width:64px; height:64px; border-radius:50%; object-fit:cover; object-position:top center;
  background:var(--ink-3); }
.bm .side-noface { width:64px; height:64px; border-radius:50%; display:grid; place-items:center;
  background:var(--ink-3); font-size:24px; font-family:'Anton',sans-serif; color:var(--bone-dim); }
.bm .side-face.on { background:rgba(237,187,0,.14); border-color:var(--gold); color:var(--gold); }
.bm .side-face:disabled { opacity:.55; }
.bm .side-reveal { margin-top:12px; padding-top:11px; border-top:1px solid var(--line); }
.bm .side-reveal-row { display:flex; gap:9px; align-items:flex-start; padding:6px 0; }
.bm .side-reveal-row.muted { opacity:.6; }
.bm .side-reveal-opt { flex:none; min-width:96px; max-width:120px; font-size:11.5px; font-weight:700;
  color:var(--gold); line-height:1.3; }
.bm .side-reveal-row.muted .side-reveal-opt { color:var(--bone-dim); }
.bm .side-voters { display:flex; flex-wrap:wrap; gap:6px; }
.bm .side-voter { display:inline-flex; align-items:center; gap:5px; font-size:11.5px; font-weight:600;
  background:rgba(247,244,236,.05); border:1px solid var(--line); border-radius:999px;
  padding:2px 8px 2px 2px; }
.bm[dir="rtl"] .side-voter { padding:2px 2px 2px 8px; }
.bm .side-status { margin-top:12px; padding:9px 12px; border-radius:11px; font-size:12.5px;
  background:rgba(79,209,139,.1); border:1px solid rgba(79,209,139,.3); color:#8FE3B4; }
.bm .side-status.shut { background:rgba(232,89,91,.1); border-color:rgba(232,89,91,.3); color:#F2A2A3; }
.bm .side-save { margin-top:12px; padding:12px;
  border-radius:16px; background:rgba(18,23,33,.96); border:1px solid var(--line); }
.bm .monkey-tag { display:inline-block; margin-top:3px; font-size:9px; letter-spacing:.06em; text-transform:uppercase;
  color:#F2C14E; background:rgba(237,187,0,.14); border:1px solid rgba(237,187,0,.4);
  border-radius:5px; padding:2px 6px; }
.bm .bet-out { margin-top:12px; padding:10px 12px; border-radius:12px; font-size:12.5px;
  background:rgba(232,89,91,.1); border:1px solid rgba(232,89,91,.3); color:#F2A2A3; }
.bm .fixture-clubs { display:grid; grid-template-columns:auto auto auto auto auto;
  align-items:center; justify-content:start; gap:3px; direction:ltr; min-width:0; }
.bm .fixture-clubs .club-name { max-width:105px; font-size:13px; font-weight:600; overflow:hidden; line-height:1.08;
  display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; white-space:normal; }
.bm .team-medium,.bm .team-short { display:none; }
.bm .fixture-clubs .versus { color:var(--bone-dim); text-align:center; font-size:10px; padding:0 1px; }
/* a wrapped name leaves slack inside its box; pull the text toward the "v" so the
   gap sits on the badge side instead of in the middle */
.bm .fixture-clubs .club-end { text-align:right; }
.bm .fixture-clubs .club-start { text-align:left; }
.bm[dir="rtl"] .fxrow { direction:rtl; }
.bm[dir="rtl"] .fxmain { direction:rtl; text-align:right; gap:6px; }
.bm[dir="rtl"] .fixture-clubs { justify-content:end; }
.bm[dir="rtl"] .fxmain .sub { text-align:right; }
.bm .match-head-clubs { display:flex; align-items:center; justify-content:space-between; gap:10px; width:70px; flex:none; direction:ltr; }
.bm .fx-team span { overflow:hidden; text-overflow:ellipsis; }
.bm .rules { margin-top:12px; }
.bm .rules div { display:flex; align-items:baseline; gap:8px; font-size:14px; padding:8px 0;
  border-bottom:1px solid var(--line); }
.bm .rules div:last-child { border-bottom:none; }
.bm .rules b { font-weight:600; }
.bm .rules i { font-style:normal; color:var(--bone-dim); flex:1; }
.bm .rules span { font-size:14.5px; color:var(--gold); font-weight:700; white-space:nowrap; }
.bm .dd-box { margin-top:14px; padding:12px 14px; border-radius:12px;
  background:linear-gradient(140deg,rgba(219,0,48,.14),rgba(237,187,0,.08));
  border:1px solid rgba(237,187,0,.3); }
.bm .dd-title { font-family:'Anton',sans-serif; text-transform:uppercase; letter-spacing:.04em;
  font-size:15px; color:var(--gold); }
.bm .dd-box p { margin:6px 0 0; font-size:12.5px; line-height:1.6; color:var(--bone); }
.bm .dd-badge { font-size:8.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--gold);
  background:rgba(237,187,0,.14); border:1px solid rgba(237,187,0,.35);
  border-radius:5px; padding:2px 5px; margin-top:3px; white-space:nowrap; }
.bm .segpt { font-size:10px; color:var(--gold); }
.bm .vb-done { display:flex; align-items:center; gap:8px; flex:none; }
.bm .av-edit { position:relative; display:inline-block; }
.bm .av-edit .pen { position:absolute; right:-2px; bottom:-2px; width:26px; height:26px; border-radius:50%;
  background:var(--gold); color:#2A1E00; display:grid; place-items:center; border:2px solid var(--ink-2); padding:0; }
.bm .av-edit .pen svg { width:13px; height:13px; }
.bm .avatar-panel { margin-top:14px; padding-top:14px; border-top:1px solid var(--line); }
.bm .avatar-presets { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:8px; margin-top:9px; direction:ltr; }
.bm .avatar-preset { aspect-ratio:1; padding:0; border-radius:12px; overflow:hidden; border:2px solid transparent;
  background:var(--ink-3); }
.bm .avatar-preset.on { border-color:var(--gold); box-shadow:0 0 0 2px rgba(237,187,0,.16); }
.bm .avatar-preset img { width:100%; height:100%; object-fit:cover; display:block; }
.bm .next-bet { margin-top:14px; text-align:initial; }

.bm .scrim { position:fixed; inset:0; background:rgba(4,6,12,.72); z-index:40;
  display:flex; align-items:flex-start; justify-content:center; }
.bm .sheet { background:var(--ink-2); width:100%; max-width:760px; border-radius:20px 20px 0 0;
  border-top:1px solid var(--line); margin-top:2cm; height:calc(100vh - 2cm); height:calc(100dvh - 2cm);
  overflow-y:auto; padding:0 16px 26px; }
.bm .sheet-head { position:sticky; top:0; background:var(--ink-2); padding:16px 0 12px; z-index:2;
  display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--line); margin-bottom:14px; }
.bm .x { margin-left:auto; background:none; color:var(--bone-dim); font-size:22px; line-height:1; padding:0 4px; }

.bm .nav { position:fixed; bottom:0; left:0; right:0; z-index:30;
  background:rgba(8,11,20,.94); backdrop-filter:blur(12px); border-top:1px solid var(--line);
  display:flex; max-width:760px; margin:0 auto; }
.bm .nav button { flex:1; background:none; color:var(--bone-dim); padding:9px 0 12px;
  display:flex; flex-direction:column; align-items:center; gap:4px; font-size:9.5px;
  letter-spacing:.1em; text-transform:uppercase; }
.bm .nav button.on { color:var(--gold); }
.bm .nav svg { width:21px; height:21px; }

.bm input, .bm select { width:100%; padding:11px 12px; border-radius:11px; background:var(--ink-3);
  font-size:16px; /* below 16px iOS auto-zooms the page on focus */
  border:1px solid var(--line); color:var(--bone); font-family:inherit; }
.bm label.fl { display:block; font-size:10px; letter-spacing:.16em; text-transform:uppercase;
  color:var(--bone-dim); margin:14px 0 6px; }
.bm .note { font-size:11.5px; color:var(--bone-dim); line-height:1.55; }
.bm .warn { font-size:12px; color:var(--gold); background:rgba(242,193,78,.08);
  border:1px solid rgba(242,193,78,.2); padding:10px 12px; border-radius:11px; line-height:1.5; }
.bm .spin { width:15px; height:15px; border:2px solid rgba(243,238,226,.25); border-top-color:var(--bone);
  border-radius:50%; animation:bmspin .7s linear infinite; }
@keyframes bmspin { to { transform:rotate(360deg); } }
.bm .center { text-align:center; }

/* ---- pitch ---- */
.bm .pitch { position:relative; width:100%; padding-top:126%; border-radius:14px; overflow:hidden;
  background:repeating-linear-gradient(180deg,#2E8B4A 0 8.33%,#2A7F44 8.33% 16.66%); }
.bm .pline { position:absolute; border:2px solid rgba(255,255,255,.5); }
.bm .tok { position:absolute; transform:translate(-50%,-50%); width:19%; text-align:center; }
.bm .tok-shirt { width:30px; height:30px; margin:0 auto; border-radius:50%;
  display:grid; place-items:center; font-size:11px; font-weight:700; border:2px solid rgba(255,255,255,.85);
  box-shadow:0 2px 6px rgba(0,0,0,.35); }
.bm .tok-nm { margin-top:4px; font-size:9.5px; font-weight:600; line-height:1.15;
  color:#fff; text-shadow:0 1px 3px rgba(0,0,0,.85); word-break:break-word; }
.bm .seg { display:flex; gap:6px; background:rgba(243,238,226,.05); padding:4px;
  border-radius:12px; border:1px solid var(--line); }
.bm .seg button { flex:1; padding:9px 6px; border-radius:9px; background:none; color:var(--bone-dim);
  font-size:12.5px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:7px; }
.bm .seg button.on { background:rgba(243,238,226,.1); color:var(--bone); }
.bm .event-row { display:grid; grid-template-columns:42px 22px minmax(0,1fr); align-items:center; gap:8px;
  padding:9px 0; border-top:1px solid var(--line); font-size:12.5px; }
.bm .event-row:first-child { border-top:none; }
.bm .event-icon { text-align:center; font-size:15px; }

@media (prefers-reduced-motion:reduce){ .bm * { animation:none!important; transition:none!important; } }
@media (max-width:480px){
  .bm .team-full { display:none; }
  .bm .team-medium { display:inline; }
  .bm .fixture-clubs .club-name { max-width:76px; font-size:12px; }
  .bm .fxmain { gap:6px; }
  .bm .avatar-presets { grid-template-columns:repeat(5,minmax(0,1fr)); }
}
@media (max-width:360px){
  .bm .team-medium { display:none; }
  .bm .team-short { display:inline; }
  .bm .fixture-clubs .club-name { max-width:58px; font-size:11.5px; }
}
.bm button:focus-visible, .bm input:focus-visible, .bm select:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
`;

const APP_LOGO = "data:image/webp;base64,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";

/* ---------------- squad ---------------- */
/*
 * Stable, locally-owned squad catalogue. API-Football abbreviates names and may
 * mix reserve players into the first-team response, so the betting UI does not
 * consume that response directly. Refresh this small catalogue after transfer
 * windows; match data remains the only time-sensitive API concern.
 */
const SQUAD = [
  { id: 386828, n: 10, name: "Lamine Yamal", he: "לאמין ימאל", pos: "FW" },
  { id: 1496, n: 11, name: "Raphinha", he: "ראפיניה", pos: "FW" },
  { id: 7334, n: 27, name: "Karim Adeyemi", he: "כרים אדיימי", pos: "FW" },
  { id: 138787, n: 10, name: "Anthony Gordon", he: "אנתוני גורדון", pos: "FW" },
  { id: 338958, n: 19, name: "Roony Bardghji", he: "רוני בארדג'י", pos: "FW" },
  { id: 445973, n: 29, name: "Toni Fernández", he: "טוני פרננדס", pos: "FW" },
  { id: 426446, n: 74, name: "Jesse Bisiwu", he: "ג'סי ביסיוו", pos: "FW" },
  { id: 1323, n: 20, name: "Dani Olmo", he: "דני אולמו", pos: "MF" },
  { id: 133609, n: 8, name: "Pedri", he: "פדרי", pos: "MF" },
  { id: 296667, n: 6, name: "Gavi", he: "גאבי", pos: "MF" },
  { id: 340626, n: 16, name: "Fermín López", he: "פרמין לופס", pos: "MF" },
  { id: 538, n: 21, name: "Frenkie de Jong", he: "פרנקי דה יונג", pos: "MF" },
  { id: 329728, n: 17, name: "Marc Casadó", he: "מארק קסאדו", pos: "MF" },
  { id: 433396, n: 22, name: "Marc Bernal", he: "מארק ברנאל", pos: "MF" },
  { id: 101814, n: 4, name: "Ronald Araújo", he: "רונאלד אראוחו", pos: "DF" },
  { id: 1257, n: 23, name: "Jules Koundé", he: "ז'ול קונדה", pos: "DF" },
  { id: 396623, n: 5, name: "Pau Cubarsí", he: "פאו קובארסי", pos: "DF" },
  { id: 2282, n: 15, name: "Andreas Christensen", he: "אנדראס כריסטנסן", pos: "DF" },
  { id: 161928, n: 3, name: "Alejandro Balde", he: "אלחנדרו באלדה", pos: "DF" },
  { id: 386859, n: 39, name: "Héctor Fort", he: "הקטור פורט", pos: "DF" },
  { id: 181701, n: 18, name: "Gerard Martín", he: "ז'ראר מרטין", pos: "DF" },
  { id: 619, n: 24, name: "Eric García", he: "אריק גרסיה", pos: "DF" },
  { id: 491250, n: 26, name: "Jofre Torrents", he: "ז'ופרה טורנטס", pos: "DF" },
  { id: 433395, n: 36, name: "Álvaro Cortés", he: "אלברו קורטס", pos: "DF" },
  { id: 182718, n: 13, name: "Joan García", he: "ז'ואן גרסיה", pos: "GK" },
  { id: 851, n: 25, name: "Wojciech Szczęsny", he: "וויצ'ך שצ'סני", pos: "GK" },
  /* Added by hand from photos Guy supplied — these two have no API-Football id in our
     local set, so they carry an explicit photo filename instead. */
  { id: "cancelo", n: 2, name: "João Cancelo", he: "ז'ואאו קנסאלו", pos: "DF", photo: "/assets/players/cancelo.png" },
  { id: "rodri", n: 16, name: "Rodri", he: "רודרי", pos: "MF", photo: "/assets/players/rodri.png" },
].map((player) => ({ ...player, photo: player.photo || `/assets/players/${player.id}.png` }));

const PROFILE_PRESETS = [
  ["/assets/avatars/avatar-01.webp", "center 28%"],
  ["/assets/avatars/avatar-02.jpg", "center 28%"],
  ["/assets/avatars/avatar-03.jpeg", "center 25%"],
  ["/assets/avatars/avatar-04.jpeg", "center 32%"],
  ["/assets/avatars/avatar-05.jpeg", "center 25%"],
  ["/assets/avatars/avatar-06.webp", "center 12%"],
  ["/assets/avatars/avatar-07.jpeg", "center 30%"],
  ["/assets/avatars/avatar-08.jpg", "center 34%"],
  ["/assets/avatars/avatar-09.jpg", "center 30%"],
  ["/assets/avatars/avatar-10.jpg", "center 22%"],
  ["/assets/avatars/avatar-11.jpg", "center 20%"],
  ["/assets/avatars/avatar-12.jpg", "center 22%"],
  ["/assets/avatars/avatar-13.jpg", "center 20%"],
  ["/assets/avatars/avatar-14.jpg", "center 24%"],
].map(([src, position]) => ({ src, position }));

const lineupPlayer = (name, number) => {
  const player = SQUAD.find((item) => item.name === name);
  return { name, number: number ?? player?.n, photo: player?.photo || null };
};

// Manual fallback from FC Basel 2–5 Barcelona, 16 August 2026.
// Kept local so viewing the previous XI never spends an API request.
const DEFAULT_LAST_LINEUP = {
  updatedAt: Date.parse("2026-08-16T18:30:00+02:00"),
  barcelona: {
    confirmed: true,
    formation: "4-2-3-1",
    players: [
      lineupPlayer("Joan García", 13),
      lineupPlayer("Eric García", 24),
      lineupPlayer("Andreas Christensen", 15),
      lineupPlayer("Gerard Martín", 18),
      lineupPlayer("Alejandro Balde", 3),
      lineupPlayer("Xavi Espart", 42),
      lineupPlayer("Marc Bernal", 22),
      lineupPlayer("Karim Adeyemi", 27),
      lineupPlayer("Fermín López", 16),
      lineupPlayer("Anthony Gordon", 17),
      lineupPlayer("Raphinha", 11),
    ],
  },
};
/* Dembele the monkey only backs defenders and midfielders */
const MONKEY_POOL = SQUAD.filter((p) => p.pos === "DF" || p.pos === "MF").map((p) => p.name);
const ATTACK_POOL = SQUAD.filter((p) => p.pos === "FW" || p.pos === "MF").map((p) => p.name);

const PLAYER_HE = { ...Object.fromEntries(SQUAD.map((player) => [player.name, player.he])), "Xavi Espart": "צ'אבי אספארט" };
const PLAYER_ALIASES = {
  "W. Szczęsny": "Wojciech Szczęsny", "R. Araújo": "Ronald Araújo", "A. Christensen": "Andreas Christensen",
  "Pau Cubarsí Paredes": "Pau Cubarsí", "J. Koundé": "Jules Koundé", Fermín: "Fermín López",
  "F. de Jong": "Frenkie de Jong", "K. Adeyemi": "Karim Adeyemi", "R. Bardghji": "Roony Bardghji",
  "J. Bisiwu": "Jesse Bisiwu", "A. Gordon": "Anthony Gordon", "Álvaro Cortés Moyano": "Álvaro Cortés",
};
const canonicalPlayer = (name) => PLAYER_ALIASES[name] || name;
const playerLabel = (name, lang) => {
  const canonical = canonicalPlayer(name);
  return lang === "he" ? (PLAYER_HE[canonical] || canonical) : canonical;
};

/* ---------------- team identities (club colours, abbreviations) ---------------- */
const TEAMS = {
  "Barcelona": { abbr: "FCB", a: "#A50044", b: "#004D98", t: "#EDBB00" },
  "Elche": { abbr: "ELC", a: "#0B7A3B", b: "#F3EEE2", t: "#0B7A3B" },
  "Athletic Club": { abbr: "ATH", a: "#E30613", b: "#F3EEE2", t: "#E30613" },
  "Rayo Vallecano": { abbr: "RAY", a: "#F3EEE2", b: "#E4002B", t: "#E4002B" },
  "Valencia": { abbr: "VAL", a: "#F3EEE2", b: "#F18E00", t: "#1B1B1B" },
  "Levante": { abbr: "LEV", a: "#004E9E", b: "#B4141E", t: "#F3EEE2" },
  "Racing Santander": { abbr: "RAC", a: "#009B48", b: "#F3EEE2", t: "#009B48" },
  "Sevilla": { abbr: "SEV", a: "#F3EEE2", b: "#D50032", t: "#D50032" },
  "Getafe": { abbr: "GET", a: "#003DA5", b: "#F3EEE2", t: "#F3EEE2" },
  "Real Betis": { abbr: "BET", a: "#00954C", b: "#F3EEE2", t: "#00954C" },
  "Real Madrid": { abbr: "RMA", a: "#F3EEE2", b: "#00529F", t: "#C6A64B" },
  "Deportivo Alavés": { abbr: "ALA", a: "#0761AF", b: "#F3EEE2", t: "#F3EEE2" },
  "Atlético Madrid": { abbr: "ATM", a: "#CB3524", b: "#1E3D73", t: "#F3EEE2" },
  "Villarreal": { abbr: "VIL", a: "#FFE500", b: "#004B87", t: "#1B1B1B" },
  "Deportivo La Coruña": { abbr: "DEP", a: "#0055A4", b: "#F3EEE2", t: "#F3EEE2" },
  "Celta Vigo": { abbr: "CEL", a: "#8AC3EE", b: "#F3EEE2", t: "#1B3A5C" },
  "Málaga": { abbr: "MLG", a: "#0B3D91", b: "#F3EEE2", t: "#F3EEE2" },
  "Real Sociedad": { abbr: "RSO", a: "#0067B1", b: "#F3EEE2", t: "#F3EEE2" },
  "Espanyol": { abbr: "ESP", a: "#007FC8", b: "#F3EEE2", t: "#F3EEE2" },
  "Osasuna": { abbr: "OSA", a: "#D81920", b: "#0A2A5E", t: "#F3EEE2" },
  /* Champions League opponents */
  "Paris Saint-Germain": { abbr: "PSG", a: "#004170", b: "#DA291C", t: "#FFFFFF", euro: 1 },
  "Manchester City": { abbr: "MCI", a: "#6CABDD", b: "#1C2C5B", t: "#1C2C5B", euro: 1 },
  "Liverpool": { abbr: "LIV", a: "#C8102E", b: "#F6EB61", t: "#FFFFFF", euro: 1 },
  "Newcastle United": { abbr: "NEW", a: "#241F20", b: "#F7F7F7", t: "#F7F7F7", euro: 1 },
  "Tottenham Hotspur": { abbr: "TOT", a: "#132257", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Inter Milan": { abbr: "INT", a: "#0B1CA0", b: "#000000", t: "#FFFFFF", euro: 1 },
  "Juventus": { abbr: "JUV", a: "#000000", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Napoli": { abbr: "NAP", a: "#12A0DB", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Marseille": { abbr: "OM", a: "#1073BF", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "PSV Eindhoven": { abbr: "PSV", a: "#ED1C24", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Sporting CP": { abbr: "SCP", a: "#008057", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Olympiacos": { abbr: "OLY", a: "#E30613", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Galatasaray": { abbr: "GAL", a: "#A90432", b: "#FBB315", t: "#FBB315", euro: 1 },
  "Slavia Praha": { abbr: "SLA", a: "#D7141A", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Union Saint-Gilloise": { abbr: "USG", a: "#005BAA", b: "#FFD100", t: "#FFD100", euro: 1 },
  "Qarabağ": { abbr: "QAR", a: "#2B2A72", b: "#F5A623", t: "#F5A623", euro: 1 },
  "Pafos": { abbr: "PAF", a: "#123F6D", b: "#F5C518", t: "#F5C518", euro: 1 },
  "Kairat": { abbr: "KAI", a: "#FFD500", b: "#111111", t: "#111111", euro: 1 },
  "Arsenal": { abbr: "ARS", a: "#EF0107", b: "#023474", t: "#FFFFFF", euro: 1 },
  "Chelsea": { abbr: "CHE", a: "#034694", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Bayern München": { abbr: "FCB", a: "#DC052D", b: "#0066B2", t: "#FFFFFF", euro: 1 },
  "Bayer Leverkusen": { abbr: "B04", a: "#E32219", b: "#000000", t: "#FFED00", euro: 1 },
  "Borussia Dortmund": { abbr: "BVB", a: "#FDE100", b: "#000000", t: "#000000", euro: 1 },
  "Eintracht Frankfurt": { abbr: "SGE", a: "#E1000F", b: "#000000", t: "#FFFFFF", euro: 1 },
  "Atalanta": { abbr: "ATA", a: "#1961AC", b: "#1A1A1A", t: "#FFFFFF", euro: 1 },
  "AS Monaco": { abbr: "ASM", a: "#CE1126", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Ajax": { abbr: "AJA", a: "#D2122E", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Benfica": { abbr: "SLB", a: "#E30613", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Club Brugge": { abbr: "CLU", a: "#1B4E9B", b: "#000000", t: "#FFFFFF", euro: 1 },
  "FC Copenhagen": { abbr: "FCK", a: "#12326E", b: "#FFFFFF", t: "#FFFFFF", euro: 1 },
  "Bodø/Glimt": { abbr: "BOD", a: "#FFE500", b: "#111111", t: "#111111", euro: 1 },
  "Unknown": { abbr: "?", a: "#2A3348", b: "#4A5670", t: "#A9A296" },
};
const TEAM_HE = {
  Barcelona: "ברצלונה", Elche: "אלצ'ה", "Athletic Club": "אתלטיק בילבאו", "Rayo Vallecano": "ראיו וייקאנו",
  Valencia: "ולנסיה", Levante: "לבאנטה", "Racing Santander": "ראסינג סנטנדר", Sevilla: "סביליה", Getafe: "חטאפה",
  "Real Betis": "ריאל בטיס", "Real Madrid": "ריאל מדריד", "Deportivo Alavés": "דפורטיבו אלאבס", "Atlético Madrid": "אתלטיקו מדריד",
  Villarreal: "ויאריאל", "Deportivo La Coruña": "דפורטיבו לה קורוניה", "Celta Vigo": "סלטה ויגו", Málaga: "מלאגה",
  "Real Sociedad": "ריאל סוסיאדד", Espanyol: "אספניול", Osasuna: "אוססונה", "Paris Saint-Germain": "פריז סן ז'רמן",
  "Manchester City": "מנצ'סטר סיטי", Liverpool: "ליברפול", "Newcastle United": "ניוקאסל יונייטד", "Tottenham Hotspur": "טוטנהאם",
  "Inter Milan": "אינטר", Juventus: "יובנטוס", Napoli: "נאפולי", Marseille: "מארסיי", "PSV Eindhoven": "פ.ס.וו איינדהובן",
  "Sporting CP": "ספורטינג ליסבון", Olympiacos: "אולימפיאקוס", Galatasaray: "גלאטסראיי", "Slavia Praha": "סלביה פראג",
  "Union Saint-Gilloise": "אוניון סן ז'ילואז", Qarabağ: "קרבאך", Pafos: "פאפוס", Kairat: "קאיראט", Arsenal: "ארסנל",
  Chelsea: "צ'לסי", "Bayern München": "באיירן מינכן", "Bayer Leverkusen": "באייר לברקוזן", "Borussia Dortmund": "בורוסיה דורטמונד",
  "Eintracht Frankfurt": "איינטרכט פרנקפורט", Atalanta: "אטאלנטה", "AS Monaco": "מונאקו", Ajax: "אייאקס", Benfica: "בנפיקה",
  "Club Brugge": "קלאב ברוז'", "FC Copenhagen": "פ.צ. קופנהגן", "Bodø/Glimt": "בודה/גלימט", Unknown: "טרם נקבע",
};
const TEAM_BADGES = {
  Barcelona: "/assets/teams/barcelona.png", Elche: "/assets/teams/elche.png", "Athletic Club": "/assets/teams/athletic-club.png",
  "Rayo Vallecano": "/assets/teams/rayo-vallecano.png", Valencia: "/assets/teams/valencia.png", Levante: "/assets/teams/levante.png",
  "Racing Santander": "/assets/teams/racing-santander.png", Sevilla: "/assets/teams/sevilla.png", Getafe: "/assets/teams/getafe.png",
  "Real Betis": "/assets/teams/real-betis.png", "Real Madrid": "/assets/teams/real-madrid.png", "Deportivo Alavés": "/assets/teams/deportivo-alaves.png",
  "Atlético Madrid": "/assets/teams/atletico-madrid.png", Villarreal: "/assets/teams/villarreal.png", "Deportivo La Coruña": "/assets/teams/deportivo-la-coruna.png",
  "Celta Vigo": "/assets/teams/celta-vigo.png", Málaga: "/assets/teams/malaga.png", "Real Sociedad": "/assets/teams/real-sociedad.png",
  Espanyol: "/assets/teams/espanyol.png", Osasuna: "/assets/teams/osasuna.png", "Paris Saint-Germain": "/assets/teams/paris-saint-germain.png",
  "Manchester City": "/assets/teams/manchester-city.png", Liverpool: "/assets/teams/liverpool.png", "Newcastle United": "/assets/teams/newcastle-united.png",
  "Tottenham Hotspur": "/assets/teams/tottenham-hotspur.png", "Inter Milan": "/assets/teams/inter-milan.png", Juventus: "/assets/teams/juventus.png",
  Napoli: "/assets/teams/napoli.png", Marseille: "/assets/teams/marseille.png", "PSV Eindhoven": "/assets/teams/psv-eindhoven.png",
  "Sporting CP": "/assets/teams/sporting-cp.png", Olympiacos: "/assets/teams/olympiacos.png", Galatasaray: "/assets/teams/galatasaray.png",
  "Slavia Praha": "/assets/teams/slavia-praha.png", "Union Saint-Gilloise": "/assets/teams/union-saint-gilloise.png", Qarabağ: "/assets/teams/qarabag.png",
  Pafos: "/assets/teams/pafos.png", Kairat: "/assets/teams/kairat.png", Arsenal: "/assets/teams/arsenal.png", Chelsea: "/assets/teams/chelsea.png",
  "Bayern München": "/assets/teams/bayern-munchen.png", "Bayer Leverkusen": "/assets/teams/bayer-leverkusen.png",
  "Borussia Dortmund": "/assets/teams/borussia-dortmund.png", "Eintracht Frankfurt": "/assets/teams/eintracht-frankfurt.png",
  Atalanta: "/assets/teams/atalanta.png", "AS Monaco": "/assets/teams/as-monaco.png", Ajax: "/assets/teams/ajax.png",
  Benfica: "/assets/teams/benfica.png", "Club Brugge": "/assets/teams/club-brugge.png", "FC Copenhagen": "/assets/teams/fc-copenhagen.png",
  "Bodø/Glimt": "/assets/teams/bodo-glimt.png",
};
const COMP_HE = { "La Liga": "לה ליגה", "Champions League": "ליגת האלופות", "Copa del Rey": "קופה דל ריי", Supercopa: "סופרקופה" };
const compLabel = (name, lang) => lang === "he" ? (COMP_HE[name] || name) : name;
const compFromApi = (league) => ({ 140: "La Liga", 2: "Champions League", 143: "Copa del Rey", 556: "Supercopa" })[league?.id] || league?.name || "";
/* the web can call a club anything ("PSG", "Internazionale") — resolve it to one key */
function canonicalTeam(name) {
  if (!name) return name;
  if (TEAMS[name]) return name;
  const f = normKey(name);
  if (!f) return name;
  let best = null, bestLen = 0;
  for (const [team, aliases] of Object.entries(TEAM_ALIASES)) {
    for (const al of aliases) {
      if ((f.includes(al) || al.includes(f)) && al.length > bestLen) { best = team; bestLen = al.length; }
    }
  }
  return best || name;
}
/* "Barcelona" stays the internal key everywhere; this is only what the user reads */
const teamLabel = (n, lang = "en") => {
  const key = canonicalTeam(n);
  if (lang === "he") return TEAM_HE[key] || n;
  return key === "Barcelona" ? "FC Barcelona" : n;
};
function ResponsiveTeamName({ team, align }) {
  const { lang } = useI18n();
  const key = canonicalTeam(team);
  const full = teamLabel(team, lang);
  const medium = lang === "en" && key === "Barcelona" ? "Barcelona" : full;
  const short = lang === "en" && key === "Barcelona" ? "FCB" : (teamInfo(team).abbr || full);
  return <span className={`club-name${align ? ` club-${align}` : ""}`}>
    <span className="team-full">{full}</span><span className="team-medium">{medium}</span><span className="team-short">{short}</span>
  </span>;
}
function teamInfo(name) {
  const key = canonicalTeam(name);
  if (TEAMS[key]) return TEAMS[key];
  const abbr = (name || "?").replace(/[^A-Za-zÀ-ÿ ]/g, "").split(" ").filter(Boolean)
    .map((w) => w[0]).join("").slice(0, 3).toUpperCase() || "???";
  return { abbr, a: "#2A3348", b: "#4A5670", t: "#F3EEE2" };
}

/* ---------------- fixtures ---------------- */
const L = (date, opp, home, tbd) => ({ comp: "La Liga", date, time: "21:00", opp, home, tbd: !!tbd });
const LIGA = [
  L("2026-08-23", "Elche", false), L("2026-08-28", "Athletic Club", true),
  L("2026-09-01", "Rayo Vallecano", true), L("2026-09-06", "Valencia", false),
  L("2026-09-13", "Levante", false), L("2026-09-16", "Racing Santander", true),
  L("2026-09-20", "Sevilla", false), L("2026-10-11", "Getafe", true),
  L("2026-10-18", "Real Betis", false), L("2026-10-25", "Real Madrid", true),
  L("2026-11-01", "Deportivo Alavés", true), L("2026-11-08", "Atlético Madrid", false),
  L("2026-11-22", "Villarreal", true), L("2026-11-29", "Deportivo La Coruña", false),
  L("2026-12-06", "Celta Vigo", true), L("2026-12-13", "Málaga", false),
  L("2026-12-20", "Real Sociedad", true), L("2027-01-03", "Espanyol", false),
  L("2027-01-10", "Osasuna", false), L("2027-01-17", "Elche", true),
  L("2027-01-24", "Deportivo Alavés", false), L("2027-01-31", "Valencia", true),
  L("2027-02-07", "Atlético Madrid", true), L("2027-02-14", "Villarreal", false),
  L("2027-02-21", "Levante", true), L("2027-02-28", "Athletic Club", false),
  L("2027-03-07", "Real Betis", true), L("2027-03-14", "Deportivo La Coruña", true, true),
  L("2027-03-21", "Rayo Vallecano", false), L("2027-04-04", "Sevilla", true),
  L("2027-04-11", "Racing Santander", false), L("2027-04-18", "Espanyol", true),
  L("2027-04-21", "Celta Vigo", false), L("2027-05-02", "Osasuna", true),
  L("2027-05-09", "Real Madrid", false), L("2027-05-16", "Real Sociedad", false),
  L("2027-05-23", "Málaga", true), L("2027-05-30", "Getafe", false),
];
const UCL_DATES = [
  ["2026-09-09", "Matchday 1"], ["2026-10-13", "Matchday 2"], ["2026-10-21", "Matchday 3"],
  ["2026-11-04", "Matchday 4"], ["2026-11-25", "Matchday 5"], ["2026-12-09", "Matchday 6"],
  ["2027-01-20", "Matchday 7"], ["2027-01-27", "Matchday 8"],
];
const CUPS = [
  { comp: "Copa del Rey", date: "2026-12-02", round: "Round of 32" },
  { comp: "Supercopa", date: "2027-02-03", round: "Semi-final" },
  { comp: "Supercopa", date: "2027-02-07", round: "Final" },
  { comp: "Copa del Rey", date: "2027-01-13", round: "Round of 16" },
  { comp: "Copa del Rey", date: "2027-02-03", round: "Quarter-final" },
  { comp: "Copa del Rey", date: "2027-03-03", round: "Semi-final, 1st leg" },
  { comp: "Copa del Rey", date: "2027-04-07", round: "Semi-final, 2nd leg" },
  { comp: "Copa del Rey", date: "2027-04-24", round: "Final" },
];
function seedFixtures() {
  const out = [];
  LIGA.forEach((f, i) => out.push({ ...f, id: `liga-${i + 1}`, round: `Matchday ${i + 1}` }));
  UCL_DATES.forEach(([date, round], i) => out.push({
    id: `ucl-${i + 1}`, comp: "Champions League", date, time: "21:00",
    opp: "Unknown", home: i % 2 === 0, round, tbd: true,
  }));
  CUPS.forEach((c, i) => out.push({
    id: `cup-${i + 1}`, comp: c.comp, date: c.date, time: "21:00",
    opp: "Unknown", home: c.comp !== "Supercopa", round: c.round, tbd: true,
  }));
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/* ---------------- time ---------------- */
const isSummer = (d) => { const m = +d.slice(5, 7); return m >= 4 && m <= 10; };
const koDate = (f) => new Date(`${f.date}T${f.time || "21:00"}:00${isSummer(f.date) ? "+02:00" : "+01:00"}`);
const started = (f) => koDate(f).getTime() <= Date.now();
const locked = (f) => koDate(f).getTime() - 2 * 60 * 1000 <= Date.now();
const fmtKO = (f) => koDate(f).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MON_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
/* "Mon · 24 Aug · 22:00" in the reader's own locale and timezone */
function koLabel(fx, lang) {
  const d = koDate(fx);
  const loc = lang === "he" ? "he-IL" : "en-GB";
  const day = d.toLocaleDateString(loc, { weekday: "short" });
  const date = d.toLocaleDateString(loc, { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
  return (
    <>
      <span>{day}</span><span className="fx-dot" />
      <b>{date}</b><span className="fx-dot" />
      <span className="mono">{time}</span>
    </>
  );
}
const monthKey = (d, lang) => `${(lang === "he" ? MON_HE : MON)[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;
const sides = (f) => (f.home ? { home: "Barcelona", away: f.opp } : { home: f.opp, away: "Barcelona" });

async function footballGet(resource, fixture) {
  const q = new URLSearchParams({ resource });
  if (fixture) q.set("fixture", String(fixture));
  const r = await fetch(`/api/football?${q}`);
  const data = await r.json();
  if (!r.ok || data.error) throw new Error(data.error || "Football data unavailable");
  return data;
}

function normalizeSquad(payload) {
  const team = payload?.response?.[0];
  return (team?.players || []).map((p) => ({
    id: p.id, n: p.number ?? null, name: p.name, pos: ({ Attacker: "FW", Midfielder: "MF", Defender: "DF", Goalkeeper: "GK" })[p.position] || p.position,
    photo: p.photo || null, age: p.age ?? null,
  }));
}

/* football-data.org/TheSportsDB give a UTC instant (e.g. "2026-08-23T19:30:00Z" for a
   21:30 Madrid kick-off); the rest of the app stores/reads fixture date+time as Madrid
   LOCAL wall-clock (koDate() re-adds its own +02:00/+01:00 DST guess on top). Slicing
   the UTC string directly — as this used to do — hands koDate() the UTC hour and lets
   it re-offset that again, so every synced kick-off landed 1-2 hours off from the real
   time (worse once rendered in a browser timezone east of Madrid, e.g. Israel, where a
   late-evening match could roll past midnight and show as ~1am). Converting through
   Europe/Madrid here, once, is what makes date/time agree with what koDate() expects.
   */
function madridDateTime(iso) {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  // some locales render midnight as "24:00" under hour12:false — normalize to "00"
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${hour}:${parts.minute}` };
}

function normalizeFixtures(payload) {
  return (payload?.response || []).map((item) => {
    const homeIsBarca = item.teams?.home?.id === 529;
    const opponent = homeIsBarca ? item.teams?.away : item.teams?.home;
    const madrid = madridDateTime(item.fixture?.date);
    const statusCode = item.fixture?.status?.short || "NS";
    return {
      id: `api-${item.fixture.id}`, apiId: item.fixture.id, comp: compFromApi(item.league),
      date: madrid?.date || "", time: madrid?.time || "21:00", opp: opponent?.name || "Unknown",
      home: homeIsBarca, round: item.league?.round || "", tbd: item.fixture?.status?.short === "TBD",
      teamLogos: { Barcelona: homeIsBarca ? item.teams?.home?.logo : item.teams?.away?.logo, [opponent?.name || "Unknown"]: opponent?.logo },
      apiResult: item.goals?.home != null ? { h: item.goals.home, a: item.goals.away, status: FINISHED_CODES.has(statusCode) ? "finished" : SCHEDULED_CODES.has(statusCode) ? "scheduled" : "live", minute: item.fixture?.status?.elapsed ?? null } : null,
    };
  }).filter((f) => f.date).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

/* Ties a real football-data.org / TheSportsDB fixture to the matching entry in our own
   hardcoded schedule, purely by competition + matchday number — the one join key both
   sides agree on without any name-matching guesswork. Only La Liga and the Champions
   League's 8 league-phase matchdays are matched this way today: Copa del Rey isn't on
   either provider, Supercopa's football-data payload carries no matchday number, and
   the Champions League knockout stage (round > 8) has no seeded fixture to attach to
   yet (see the comment above sdbRoundLabel in api/football/route.ts). Once matched, the
   seed fixture's placeholder date/time/opponent get replaced with the real thing and it
   picks up a live apiId — which is the one thing refreshScore() actually needs in order
   to work at all. */
function matchApiFixtures(seed, payload) {
  const seedIds = new Set(seed.map((f) => f.id));
  return normalizeFixtures(payload).flatMap((item) => {
    const prefix = item.comp === "La Liga" ? "liga" : item.comp === "Champions League" ? "ucl" : null;
    if (!prefix) return [];
    const num = Number((item.round.match(/(\d+)/) || [])[1]);
    if (!num) return [];
    const seedId = `${prefix}-${num}`;
    if (!seedIds.has(seedId)) return [];
    return [{
      seedId,
      patch: { apiId: item.apiId, date: item.date, time: item.time, opp: item.opp, home: item.home, tbd: false, teamLogos: item.teamLogos },
      apiResult: item.apiResult,
    }];
  });
}

const FINISHED_CODES = new Set(["FT", "AET", "PEN"]);
const SCHEDULED_CODES = new Set(["TBD", "NS", "PST", "CANC", "ABD", "AWD", "WO"]);
function normalizeMatch(payload) {
  const item = payload?.response?.[0];
  if (!item) throw new Error("Match data unavailable");
  const code = item.fixture?.status?.short || "NS";
  const events = (item.events || []).map((e) => ({
    minute: e.time?.elapsed ?? null, extra: e.time?.extra ?? null, teamId: e.team?.id, team: e.team?.name,
    player: e.player?.name || null, assist: e.assist?.name || null, type: e.type || "", detail: e.detail || "",
  }));
  const goals = events.filter((e) => e.type === "Goal" && e.teamId === 529 && !/Missed/i.test(e.detail));
  return {
    item, code, status: FINISHED_CODES.has(code) ? "finished" : SCHEDULED_CODES.has(code) ? "scheduled" : "live",
    minute: item.fixture?.status?.elapsed ?? null, h: item.goals?.home ?? null, a: item.goals?.away ?? null,
    scorers: goals.map((e) => cleanName(e.player)).filter(Boolean), assists: goals.map((e) => cleanName(e.assist)).filter(Boolean), events,
  };
}

function normalizeLineups(match) {
  const photoById = new Map();
  (match.item?.players || []).forEach((team) => (team.players || []).forEach((p) => photoById.set(p.player?.id, p.player?.photo || null)));
  const out = {};
  (match.item?.lineups || []).forEach((lineup) => {
    const key = lineup.team?.id === 529 ? "barcelona" : "opponent";
    out[key] = {
      confirmed: true, formation: lineup.formation || "", players: (lineup.startXI || []).map((entry) => ({
        id: entry.player?.id, name: entry.player?.name, number: entry.player?.number, pos: entry.player?.pos,
        grid: entry.player?.grid, photo: photoById.get(entry.player?.id) || null,
      })),
    };
  });
  return out;
}

/* ---------------- Dembele's brain ---------------- */
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* Dembele's own card for the season: barça goals, opponent goals, and he always
   backs a defender or a midfielder to score. Approved 17 Aug 2026. He is free to
   land on the same score or scorer as anyone else — he picks what he wants. */
const DEMBELE_BETS = {
  "liga-1": { b: 2, o: 1, scorer: "Pedri", assister: "Lamine Yamal" },
  "liga-2": { b: 2, o: 1, scorer: "Fermín López", assister: "Raphinha" },
  "liga-3": { b: 3, o: 1, scorer: "Gavi", assister: "Alejandro Balde" },
  "liga-4": { b: 1, o: 1, scorer: "Frenkie de Jong", assister: "Pedri" },
  "liga-5": { b: 2, o: 0, scorer: "Pau Cubarsí", assister: "Lamine Yamal" },
  "liga-6": { b: 4, o: 1, scorer: "Marc Casadó", assister: "Dani Olmo" },
  "liga-7": { b: 2, o: 2, scorer: "Jules Koundé", assister: "Raphinha" },
  "liga-8": { b: 2, o: 0, scorer: "Pedri", assister: "Jules Koundé" },
  "liga-9": { b: 2, o: 1, scorer: "Fermín López", assister: "Lamine Yamal" },
  "liga-10": { b: 2, o: 1, scorer: "Andreas Christensen", assister: "Raphinha" },
  "liga-11": { b: 3, o: 1, scorer: "Gerard Martín", assister: "Fermín López" },
  "liga-12": { b: 1, o: 3, scorer: "Frenkie de Jong", assister: "Dani Olmo" },
  "liga-13": { b: 3, o: 2, scorer: "Marc Bernal", assister: "Lamine Yamal" },
  "liga-14": { b: 2, o: 2, scorer: "Eric García", assister: "Pedri" },
  "liga-15": { b: 4, o: 2, scorer: "Gavi", assister: "Raphinha" },
  "liga-16": { b: 3, o: 0, scorer: "Pedri", assister: "Alejandro Balde" },
  "liga-17": { b: 2, o: 1, scorer: "Pau Cubarsí", assister: "Lamine Yamal" },
  "liga-18": { b: 3, o: 2, scorer: "Fermín López", assister: "Anthony Gordon" },
  "liga-19": { b: 2, o: 1, scorer: "Alejandro Balde", assister: "Pedri" },
  "liga-20": { b: 4, o: 0, scorer: "Marc Casadó", assister: "Raphinha" },
  "liga-21": { b: 1, o: 1, scorer: "Jules Koundé", assister: "Dani Olmo" },
  "liga-22": { b: 3, o: 1, scorer: "Pedri", assister: "Lamine Yamal" },
  "liga-23": { b: 2, o: 2, scorer: "Frenkie de Jong", assister: "Raphinha" },
  "liga-24": { b: 1, o: 2, scorer: "Gavi", assister: "Fermín López" },
  "liga-25": { b: 3, o: 0, scorer: "Fermín López", assister: "Alejandro Balde" },
  "liga-26": { b: 1, o: 1, scorer: "Andreas Christensen", assister: "Pedri" },
  "liga-27": { b: 3, o: 1, scorer: "Pedri", assister: "Lamine Yamal" },
  "liga-28": { b: 2, o: 0, scorer: "Marc Bernal", assister: "Dani Olmo" },
  "liga-29": { b: 2, o: 2, scorer: "Gerard Martín", assister: "Raphinha" },
  "liga-30": { b: 3, o: 0, scorer: "Gavi", assister: "Lamine Yamal" },
  "liga-31": { b: 3, o: 1, scorer: "Eric García", assister: "Pedri" },
  "liga-32": { b: 4, o: 1, scorer: "Fermín López", assister: "Raphinha" },
  "liga-33": { b: 0, o: 1, scorer: "Marc Casadó", assister: "Anthony Gordon" },
  "liga-34": { b: 2, o: 0, scorer: "Pau Cubarsí", assister: "Dani Olmo" },
  "liga-35": { b: 2, o: 3, scorer: "Pedri", assister: "Lamine Yamal" },
  "liga-36": { b: 2, o: 2, scorer: "Jules Koundé", assister: "Fermín López" },
  "liga-37": { b: 3, o: 1, scorer: "Gavi", assister: "Raphinha" },
  "liga-38": { b: 1, o: 0, scorer: "Frenkie de Jong", assister: "Pedri" },
  "ucl-1": { b: 3, o: 1, scorer: "Pedri", assister: "Lamine Yamal" },
  "ucl-2": { b: 1, o: 1, scorer: "Jules Koundé", assister: "Raphinha" },
  "ucl-3": { b: 2, o: 0, scorer: "Fermín López", assister: "Dani Olmo" },
  "ucl-4": { b: 2, o: 2, scorer: "Frenkie de Jong", assister: "Pedri" },
  "ucl-5": { b: 4, o: 1, scorer: "Gavi", assister: "Lamine Yamal" },
  "ucl-6": { b: 2, o: 1, scorer: "Pau Cubarsí", assister: "Raphinha" },
  "ucl-7": { b: 2, o: 1, scorer: "Marc Bernal", assister: "Fermín López" },
  "ucl-8": { b: 0, o: 2, scorer: "Andreas Christensen", assister: "Anthony Gordon" },
  "cup-1": { b: 4, o: 0, scorer: "Marc Casadó", assister: "Toni Fernández" },
  "cup-4": { b: 3, o: 1, scorer: "Gerard Martín", assister: "Dani Olmo" },
  "cup-5": { b: 2, o: 1, scorer: "Fermín López", assister: "Lamine Yamal" },
  "cup-6": { b: 2, o: 0, scorer: "Eric García", assister: "Pedri" },
  "cup-7": { b: 1, o: 1, scorer: "Pedri", assister: "Raphinha" },
  "cup-8": { b: 2, o: 1, scorer: "Gavi", assister: "Lamine Yamal" },
  "cup-2": { b: 2, o: 1, scorer: "Frenkie de Jong", assister: "Raphinha" },
  "cup-3": { b: 1, o: 2, scorer: "Pedri", assister: "Lamine Yamal" },
};

function monkeyBet(fx) {
  const pick = DEMBELE_BETS[fx.id];
  if (pick) {
    return {
      h: fx.home ? pick.b : pick.o,
      a: fx.home ? pick.o : pick.b,
      scorer: pick.scorer, assister: pick.assister, monkey: true,
    };
  }
  /* Fallback for any fixture added later that isn't on his card: take a plausible
     scoreline for the venue and a defender or midfielder to score. */
  const seed = hash("dembele:" + fx.id);
  const shapes = [[2, 1], [3, 1], [2, 0], [1, 1], [3, 2], [2, 2], [1, 2], [4, 1]];
  const [b, o] = shapes[seed % shapes.length];
  return {
    h: fx.home ? b : o,
    a: fx.home ? o : b,
    scorer: MONKEY_POOL[seed % MONKEY_POOL.length],
    assister: ATTACK_POOL[(seed >> 3) % ATTACK_POOL.length],
    monkey: true,
  };
}

/* ---------------- scoring ---------------- */
const dir = (h, a) => (h > a ? 1 : h < a ? -1 : 0);
const cleanName = (s) => String(s).replace(/\(.*?\)/g, "").replace(/[0-9']/g, "").trim();
const inList = (name, list) => {
  if (!name) return false;
  const surname = name.toLowerCase().split(" ").pop();
  return (list || []).some((x) => cleanName(x).toLowerCase().includes(surname));
};
const fmtPts = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const DD_STREAK = 3;   // exact scores in a row needed to unlock double down

/* Champions League knockout-stage games, and the Copa del Rey Final, pay double
   points. Champions League matchdays 1–8 are the league phase (not doubled); any
   other round for that competition is knockout stage, including the final. */
function isDoublePointsFixture(f) {
  if (!f) return false;
  const round = String(f.round || "").trim().toLowerCase();
  if (!round) return false;
  if (f.comp === "Champions League") return !round.startsWith("matchday");
  if (f.comp === "Copa del Rey") return round === "final";
  return false;
}

function scoreBet(bet, res, doubled = false, compDoubled = false) {
  const none = { pts: 0, exact: false, direction: false, hit: false, assist: false, doubled: false };
  if (!bet || !res || res.h == null || res.a == null) return none;
  const exact = bet.h === res.h && bet.a === res.a;
  const direction = !exact && dir(bet.h, bet.a) === dir(res.h, res.a);
  const hit = inList(bet.scorer, res.scorers);
  const assist = inList(bet.assister, res.assists);
  let pts = (exact ? 3 : direction ? 1 : 0) + (hit ? 1 : 0) + (assist ? 0.5 : 0);
  const multiplier = (doubled ? 2 : 1) * (compDoubled ? 2 : 1);
  pts *= multiplier;
  return { pts, exact, direction, hit, assist, doubled: doubled || compDoubled };
}

/* Walk a player's games in order: three exact scores in a row unlock double down,
   every following game scores double, and it ends after the first game that isn't
   an exact score (that game is still doubled).

   Live matches are deliberately NOT skipped here: while a game is in progress the
   API's current (unofficial) score is treated as provisional and scored exactly like
   a final result, so the table recalculates every time the live score changes — a
   1-0 exact bet shows +3 while it's 1-0, drops to +1 the instant it becomes 2-0, and
   so on. Once the match actually ends, `results[f.id]` simply holds the true final
   score and that's what's scored from then on — nothing else has to change for that
   transition, since this function only ever looks at whatever score is currently on
   record for the fixture. */
function runTally(uid, fixtures, results, betFor) {
  let pts = 0, exact = 0, direction = 0, hits = 0, assists = 0, monkeyed = 0, streak = 0, doubledGames = 0;
  fixtures.forEach((f) => {
    const r = results[f.id];
    if (!r || r.h == null) return;
    const b = betFor(uid, f);
    if (!b) { streak = 0; return; }
    if (b.inherited) monkeyed++;
    const doubled = streak >= DD_STREAK;
    const sc = scoreBet(b, r, doubled, isDoublePointsFixture(f));
    pts += sc.pts;
    if (sc.exact) exact++; if (sc.direction) direction++;
    if (sc.hit) hits++; if (sc.assist) assists++;
    if (doubled) doubledGames++;
    streak = sc.exact ? streak + 1 : 0;
  });
  return { pts, exact, direction, hits, assists, monkeyed, streak, doubledGames, armed: streak >= DD_STREAK };
}

/* ---------------- side bets (seasonal, one pick each) ---------------- */
/* Locks on the Sunday on/before the season's real opener — LIGA[0].date, the hardcoded
   first fixture of the season as originally scheduled. This is intentionally read from
   the LIGA constant (defined above, near the top of the file) rather than from the live
   `fixtures` table in D1: the Dev Panel's fixture editor (Dev Panel > Fixtures) lets
   anyone reassign an existing fixture's date/opponent to preview a friendly or any other
   test match, and if this deadline were computed from that same mutable data, a purely
   cosmetic preview could accidentally drag the "earliest fixture" backwards and lock the
   season bets early. Anchoring on the original constant keeps this deadline stable no
   matter what gets previewed elsewhere. It's also a fixed point in time rather than
   "whatever's next right now": once the season begins the deadline has already passed
   and stays passed, rather than perpetually chasing next week's game. */
function computeSideDeadline() {
  if (!LIGA.length) return null;
  const d = new Date(`${LIGA[0].date}T00:00:00`);
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1);   // walk back to the Sunday on/before it
  d.setHours(12, 0, 0, 0);                                // safely ahead of any evening kick-off
  return d.getTime();
}
const sideBetsOpen = () => {
  const deadline = computeSideDeadline();
  return deadline == null || Date.now() < deadline;
};

const playerOpt = (name) => {
  const p = SQUAD.find((x) => x.name === name);
  return { id: name, en: name, he: p?.he || name, photo: p?.photo || null };
};

const SIDE_BETS = [
  { id: "stage", pts: 4, icon: "/assets/side/ucl.png", en: "Which stage will Barça reach in the Champions League this season?", he: "לאיזה שלב בארסה תגיע בליגת האלופות העונה?",
    options: [
      { id: "league", en: "League phase", he: "שלב הבתים" },
      { id: "r16", en: "Round of 16", he: "שמינית גמר" },
      { id: "qf", en: "Quarter-final", he: "רבע גמר" },
      { id: "sf", en: "Semi-final", he: "חצי גמר" },
      { id: "final", en: "Final", he: "גמר" },
    ] },
  { id: "copaFinal", pts: 2, icon: "/assets/teams/barcelona.png", en: "Will Barça reach the Copa del Rey final?", he: "האם בארסה תגיע לגמר הקופה דל ריי?",
    options: [{ id: "yes", en: "Yes", he: "כן" }, { id: "no", en: "No", he: "לא" }] },
  { id: "titles", pts: 5, en: "How many trophies?", he: "מספר תארים",
    options: [0, 1, 2, 3, 4, 5, 6].map((n) => ({ id: String(n), en: String(n), he: String(n) })) },
  { id: "gordonFermin", pts: 2, en: "Who scores more?", he: "מי יבקיע יותר?",
    options: [playerOpt("Anthony Gordon"), playerOpt("Fermín López")] },
  { id: "raphinhaYamal", pts: 2, en: "Who scores more?", he: "מי יבקיע יותר?",
    options: [playerOpt("Raphinha"), playerOpt("Lamine Yamal")] },
  { id: "olmoPedri", pts: 3, en: "Who assists more?", he: "מי יבשל יותר?",
    options: [playerOpt("Dani Olmo"), playerOpt("Pedri")] },
  { id: "uclTopScorer", pts: 2, icon: "/assets/side/ucl.png", en: "Champions League Top Scorer", he: "מלך שערים בליגת האלופות",
    options: ["Raphinha", "Lamine Yamal", "Fermín López", "Dani Olmo", "Anthony Gordon", "Pedri"].map(playerOpt) },
  { id: "clasico", pts: 4, icon: "/assets/teams/real-madrid.png", en: "Barça vs Real: goal balance over the season", he: "בארסה מול ריאל: מאזן שערים",
    options: [
      { id: "barca", en: "In Barça's favour", he: "לטובת בארסה" },
      { id: "real", en: "In Real's favour", he: "לטובת ריאל" },
      /* level is the boldest, least-likely call, so it pays extra: 4 base + 2 bonus = 6 */
      { id: "draw", en: "Level", he: "תיקו", bonus: 2 },
    ] },
  { id: "atletico", pts: 2, icon: "/assets/teams/atletico-madrid.png", en: "Will Barça score more than 2 against Atlético in a match this season?",
    he: "האם בארסה תבקיע יותר מ־2 שערים במשחק לאטלטיקו העונה?",
    options: [{ id: "yes", en: "Yes", he: "כן" }, { id: "no", en: "No", he: "לא" }] },
  { id: "englishFirst", pts: 2, icon: "/assets/side/premier-league.png",
    en: "First game with an English club in the Champions League", he: "משחק ראשון מול קבוצה אנגלית בליגת האלופות",
    options: [
      { id: "win", en: "Win", he: "ניצחון" },
      { id: "loss", en: "Loss", he: "הפסד" },
      { id: "draw", en: "Draw", he: "תיקו" },
    ] },
  { id: "cards", pts: 2, en: "Who collects more yellow cards?", he: "מי יקבל יותר כרטיסים צהובים?",
    options: [playerOpt("Gavi"), playerOpt("João Cancelo")] },
  { id: "screenings", pts: 1, en: "Who attends more watch-alongs this season? (Three or more team members needed to count)",
    he: "מי יגיע ליותר צפיות משותפות העונה? (צריך 3 משתתפים מהקבוצה ומעלה כדי שזה ייספר)",
    options: [
      { id: "assaf", en: "Assaf", he: "אסף", photo: "/assets/side/assaf.png" },
      { id: "omri", en: "Omri", he: "עומרי", photo: "/assets/side/omri.png" },
    ] },
  { id: "bigTv", pts: 1, icon: "/assets/side/ben.png", en: "Will Ben upgrade to a 65-inch TV or bigger?",
    he: "האם בן יחליף לטלוויזיה בגודל 65 אינץ' ומעלה?",
    options: [
      { id: "yes", en: "Yes", he: "כן" },
      { id: "no", en: "No", he: "לא" },
      { id: "drones", en: "Not enough money in the drones business", he: "אין מספיק כסף בעסק הרחפנים" },
    ] },
];
/* a bet's ceiling is its base points plus whichever option carries the biggest bonus
   (e.g. the Clasico bet's "Level" pick scores 4+2=6, so the bet's own ceiling is 6) */
const SIDE_TOTAL = SIDE_BETS.reduce((n, b) => n + b.pts + Math.max(0, ...b.options.map((o) => o.bonus || 0)), 0);

/* ---------------- storage ---------------- */
const K = { fx: "bm:fixtures", users: "bm:users", res: "bm:results", season: "bm:seasonresult", lineups: "bm:lineups", badges: "bm:badges", wipe: "bm:wipe", me: "bm:me", sideRes: "bm:sideres", sync: "bm:lastsync" };
const DEV_PASSWORD = "1357642";
/* Returned when a read could not be completed. Callers must keep whatever they
   already had rather than treating a failure as "this key is empty" — that is what
   used to wipe the user list and bounce everyone back to the sign-in screen. */
const READ_FAILED = Symbol("read-failed");

/* Who am I on this device?
   localStorage alone is not enough — Safari evicts script-writable storage for sites
   that go unused, and an installed PWA does not always escape that. So the profile id
   is written to both localStorage and a long-lived first-party cookie, and either one
   can bring it back. */
const ME_COOKIE = "bm_me";
function rememberMe(id) {
  try {
    if (id) window.localStorage.setItem("local:bm:me", JSON.stringify(id));
    else window.localStorage.removeItem("local:bm:me");
  } catch {}
  try {
    if (id) document.cookie = `${ME_COOKIE}=${encodeURIComponent(id)};path=/;max-age=34560000;samesite=lax`;
    else document.cookie = `${ME_COOKIE}=;path=/;max-age=0;samesite=lax`;
  } catch {}
}
function recallMe() {
  try {
    const raw = window.localStorage.getItem("local:bm:me");
    if (raw != null) return JSON.parse(raw);
  } catch {}
  try {
    const hit = document.cookie.split(";").map((c) => c.trim())
      .find((c) => c.startsWith(`${ME_COOKIE}=`));
    if (hit) return decodeURIComponent(hit.slice(ME_COOKIE.length + 1)) || null;
  } catch {}
  return null;
}

async function sget(key, shared = true, fb = null) {
  try {
    if (window.storage?.get) {
      const r = await window.storage.get(key, shared);
      return r ? JSON.parse(r.value) : fb;
    }
    if (!shared) {
      const raw = window.localStorage.getItem(`local:${key}`);
      return raw == null ? fb : JSON.parse(raw);
    }
    const r = await fetch(`/api/storage?key=${encodeURIComponent(key)}&shared=${shared ? "1" : "0"}`);
    if (r.ok) {
      const data = await r.json();
      return data.value == null ? fb : JSON.parse(data.value);
    }
  } catch {
    return cachedOr(key, shared, READ_FAILED);
  }
  return cachedOr(key, shared, READ_FAILED);
}

/* last-known-good copy kept in localStorage, so a dead network shows stale data
   instead of an empty app */
function cachedOr(key, shared, fallback) {
  try {
    const raw = window.localStorage.getItem(`${shared ? "shared" : "local"}:${key}`);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
function cacheLocally(key, shared, value) {
  try { window.localStorage.setItem(`${shared ? "shared" : "local"}:${key}`, JSON.stringify(value)); } catch {}
}

/* one request for many keys; falls back to the single-key path when unavailable */
async function sgetMany(keys, shared = true) {
  const out = {};
  if (!window.storage?.get) {
    try {
      const qs = keys.map(encodeURIComponent).join(",");
      const r = await fetch(`/api/storage?keys=${qs}&shared=${shared ? "1" : "0"}`);
      if (r.ok) {
        const data = await r.json();
        if (data?.values) {
          keys.forEach((k) => {
            const raw = data.values[k]?.value;
            if (raw == null) { out[k] = null; return; }
            try { out[k] = JSON.parse(raw); cacheLocally(k, shared, out[k]); }
            catch { out[k] = null; }
          });
          return out;
        }
      }
    } catch {}
  }
  for (const k of keys) out[k] = await sget(k, shared, null);
  return out;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* storage is rate limited, so a dropped write gets retried rather than lost in silence */
async function sset(key, val, shared = true, tries = 3) {
  const body = JSON.stringify(val);
  if (!window.storage?.set) {
    if (!shared) {
      try {
        if (val == null) window.localStorage.removeItem(`local:${key}`);
        else window.localStorage.setItem(`local:${key}`, body);
        return true;
      } catch { return false; }
    }
    try {
      const r = await fetch("/api/storage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: body, shared }),
      });
      if (r.ok) return true;
    } catch {}
    try {
      const storageKey = `${shared ? "shared" : "local"}:${key}`;
      if (val == null) window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, body);
      return true;
    } catch { return false; }
  }
  for (let i = 0; i < tries; i++) {
    try { await window.storage.set(key, body, shared); return true; }
    catch { if (i < tries - 1) await sleep(200 * (i + 1)); }
  }
  console.warn("BarcaManyak: write failed for", key);
  return false;
}

async function sdel(key, shared = true) {
  try {
    if (window.storage?.delete) return await window.storage.delete(key, shared);
    if (!shared) { window.localStorage.removeItem(`local:${key}`); return true; }
    const r = await fetch(`/api/storage?key=${encodeURIComponent(key)}&shared=${shared ? "1" : "0"}`, { method: "DELETE" });
    if (r.ok) return true;
  } catch {}
  try { window.localStorage.removeItem(`${shared ? "shared" : "local"}:${key}`); return true; }
  catch { return false; }
}

/* ---------------- marks ---------------- */
function Crest({ size = 40 }) {
  return <img src={APP_LOGO} alt="BarcaManyak" width={size} height={Math.round(size * 1.015)}
    style={{ objectFit: "contain", display: "block" }} />;
}

/* Team badge: custom image if the league has added one, otherwise a club-colour shield */
function Badge({ team, size = 34, badges = {} }) {
  const key = canonicalTeam(team);
  const url = badges[key] || badges[team] || TEAM_BADGES[key] || null;
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [url]);
  if (url && !broken) return (
    <img src={url} alt={team} width={size} height={size} onError={() => setBroken(true)}
      style={{ objectFit: "contain", display: "block", margin: "0 auto" }} />
  );
  const { abbr, a, b, t } = teamInfo(team);
  const fs = size * 0.3;
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 44 48" aria-label={team} style={{ display: "block", margin: "0 auto" }}>
      <path d="M3 3h38v26c0 10-9 15-19 19C12 44 3 39 3 29Z" fill={a} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <path d="M22 3h19v26c0 10-9 15-19 19Z" fill={b} opacity=".9" />
      <text x="22" y="27" textAnchor="middle" fill={t} fontSize={fs * 44 / size} fontFamily="Anton, Impact, sans-serif" letterSpacing=".5">{abbr}</text>
    </svg>
  );
}

const Ico = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const ICONS = {
  next: "M12 8v4l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0",
  fx: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  table: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  season: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
  me: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
};

const BOT_EMOJI = { xs: 19, s: 25, m: 33, l: 62 };
function Avatar({ user, size = "m" }) {
  if (!user) return <div className={`av ${size}`}>?</div>;
  if (user.pic) return <img className={`av ${size}`} src={user.pic} alt="" />;
  return <div className={`av ${size}`}
    style={{ background: user.isBot ? "#3A2A10" : (user.color || "var(--blue)"),
             fontSize: user.isBot ? BOT_EMOJI[size] : undefined, lineHeight: 1 }}>
    {user.isBot ? "🐵" : (user.name || "?").slice(0, 1).toUpperCase()}
  </div>;
}

/* ============================ app ============================ */
export default function BarcaManyak() {
  const [lang, setLang] = useState("en");
  const languageLoaded = useRef(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("next");
  const [fixtures, setFixtures] = useState([]);
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState({});
  const [results, setResults] = useState({});
  const [apiResults, setApiResults] = useState({});
  const [lineups, setLineups] = useState({});
  const [badges, setBadges] = useState({});
  const [seasonRes, setSeasonRes] = useState({ topScorer: null, topAssister: null });
  const [sideRes, setSideRes] = useState({});
  const [meId, setMeId] = useState(null);
  const [openFx, setOpenFx] = useState(null);
  const [lineupFx, setLineupFx] = useState(null);
  const [toast, setToast] = useState(null);
  const [clockTick, setClockTick] = useState(0);
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const polling = useRef(false);
  const t = useCallback((key) => UI_COPY[lang]?.[key] || UI_COPY.en[key] || key, [lang]);
  const toggleLanguage = useCallback(() => setLang((current) => current === "en" ? "he" : "en"), []);

  useEffect(() => {
    if (!languageLoaded.current) {
      languageLoaded.current = true;
      const savedLanguage = window.localStorage.getItem("bm:lang");
      if (savedLanguage && savedLanguage !== lang) { setLang(savedLanguage); return; }
    }
    window.localStorage.setItem("bm:lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  const usersRef = useRef([]);
  useEffect(() => { if (users.length) usersRef.current = users; }, [users]);
  const lastMe = useRef(null);
  /* If the league list is momentarily unavailable, fall back to the profile we last
     resolved instead of dropping the signed-in user onto the sign-in screen. */
  const resolvedMe = users.find((u) => u.id === meId) || null;
  if (resolvedMe) lastMe.current = resolvedMe;
  const me = resolvedMe || (meId && lastMe.current?.id === meId ? lastMe.current : null);
  const myBets = bets[meId] || { games: {}, season: {} };

  /* A refresh only ever replaces state it actually managed to read. Anything that
     failed keeps its previous value, so a flaky phone connection can no longer empty
     the league and throw you back to the sign-in screen. */
  const loadShared = useCallback(async (userList) => {
    const core = await sgetMany([K.users, K.res, K.season, K.lineups, K.badges, K.sideRes], true);

    let list = userList;
    if (!list) {
      const read = core[K.users];
      if (read === READ_FAILED || read == null) list = null;   // could not read: keep what we have
      else list = read;
    }
    if (Array.isArray(list)) { setUsers(list); cacheLocally(K.users, true, list); }

    const apply = (key, setter) => {
      const v = core[key];
      if (v === READ_FAILED || v == null) return;
      setter(v); cacheLocally(key, true, v);
    };
    apply(K.res, setResults); apply(K.season, setSeasonRes);
    apply(K.lineups, setLineups); apply(K.badges, setBadges);
    apply(K.sideRes, setSideRes);

    const ids = (Array.isArray(list) ? list : usersRef.current).map((u) => `bm:bets:${u.id}`);
    if (ids.length) {
      const betMap = await sgetMany(ids, true);
      setBets((prev) => {
        const next = { ...prev };
        Object.entries(betMap).forEach(([key, value]) => {
          if (value === READ_FAILED || value == null) return;   // keep the last good copy
          next[key.replace("bm:bets:", "")] = value;
        });
        return next;
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      let fx = await sget(K.fx, true, null);
      if (!fx || !fx.length) { fx = seedFixtures(); await sset(K.fx, fx); }
      else {
        let patched = false;
        if (fx.some((f) => f.opp === "To be drawn")) {
          // fixtures saved before the label changed
          fx = fx.map((f) => (f.opp === "To be drawn" ? { ...f, opp: "Unknown" } : f));
          patched = true;
        }
        // the opening Elche fixture was seeded a day late (24 Aug instead of 23 Aug)
        if (fx.some((f) => f.id === "liga-1" && f.opp === "Elche" && f.date === "2026-08-24")) {
          fx = fx.map((f) => (f.id === "liga-1" && f.opp === "Elche" && f.date === "2026-08-24" ? { ...f, date: "2026-08-23" } : f));
          patched = true;
        }
        if (patched) await sset(K.fx, fx);
      }
      setFixtures(fx);
      // best-effort: pull the real fixture list from football-data.org/TheSportsDB and
      // attach a live apiId plus the true date/opponent to whichever seeded games match
      // by competition + matchday number (see matchApiFixtures above). This is the one
      // thing that makes "Refresh score", the live match view and the live-recalculating
      // table actually work for a real game rather than just the seed schedule. Fire-and-
      // forget: a missing FOOTBALL_DATA_KEY secret or a network hiccup here must never
      // block the app from loading — it just keeps running on the seed schedule alone,
      // same as it does today.
      (async () => {
        try {
          const lastSync = (await sget(K.sync, true, 0)) || 0;
          if (Date.now() - lastSync < 3 * 3600e3) return;   // synced recently enough
          const { payload } = await footballGet("fixtures");
          const matches = matchApiFixtures(fx, payload);
          for (const { seedId, patch, apiResult } of matches) {
            await saveFixture(seedId, patch);
            if (apiResult) await saveResult(seedId, { h: apiResult.h, a: apiResult.a, status: apiResult.status, minute: apiResult.minute });
          }
          await sset(K.sync, Date.now());
        } catch { /* no key configured yet, or the API is unreachable right now */ }
      })();
      let list = (await sget(K.users, true, [])) || [];
      const mk = list.find((u) => u.id === "monkey");
      if (!mk) { list = [...list, { id: "monkey", name: "Dembele", isBot: true, pic: null }]; await sset(K.users, list); }
      else if (mk.name !== "Dembele") { list = list.map((u) => (u.id === "monkey" ? { ...u, name: "Dembele" } : u)); await sset(K.users, list); }
      // one-time cleanup: clear the sample players, their bets and the made-up results
      const wiped = await sget(K.wipe, true, 0);
      if (wiped < 1) {
        // clear bets for everyone who existed, sample players included, then drop the samples
        const ids = new Set([...list.map((u) => u.id), "monkey"]);
        for (const id of ids) { await sdel(`bm:bets:${id}`, true); await sleep(80); }
        const keep = list.filter((u) => !u.demo);
        if (keep.length !== list.length) { await sset(K.users, keep); }
        list = keep;
        await sset(K.res, {});
        await sset(K.wipe, 1);
      }
      const savedMe = recallMe();
      if (savedMe && list.some((u) => u.id === savedMe)) setMeId(savedMe);
      await loadShared(list);
      setReady(true);
    })();
  }, [loadShared]);

  useEffect(() => {
    const a = setInterval(() => loadShared(), 25000);
    const b = setInterval(() => setClockTick((n) => n + 1), 30000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [loadShared]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  /* Dembele fills every locked game he hasn't bet on. His picks come from his own
     approved card and no longer depend on what anyone else bet. */
  useEffect(() => {
    if (!ready || !fixtures.length) return;
    const mk = bets.monkey || { games: {}, season: {} };
    const need = fixtures.filter((f) => locked(f) && !mk.games[f.id]);
    if (!need.length) return;
    const games = { ...mk.games };
    need.forEach((f) => { games[f.id] = monkeyBet(f); });
    const next = { ...mk, games };
    sset("bm:bets:monkey", next).then(() => setBets((b) => ({ ...b, monkey: next })));
  }, [ready, fixtures, bets]);

  /* ---- actions ---- */
  async function createUser(name, pic) {
    const id = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const fresh = (await sget(K.users, true, [])) || [];
    const list = [...fresh, { id, name, pic }];
    await sset(K.users, list); await sset(`bm:bets:${id}`, { games: {}, season: {} });
    rememberMe(id); setMeId(id); await loadShared(list);
  }
  async function updateMe(patch) {
    const fresh = (await sget(K.users, true, [])) || [];
    const list = fresh.map((u) => (u.id === meId ? { ...u, ...patch } : u));
    await sset(K.users, list); setUsers(list);
  }
  async function saveMyBet(fxId, bet) {
    const next = { ...myBets, games: { ...myBets.games, [fxId]: bet } };
    await sset(`bm:bets:${meId}`, next); setBets((b) => ({ ...b, [meId]: next }));
  }
  async function saveSeason(sb) {
    const next = { ...myBets, season: { ...sb, lockedAt: Date.now() } };
    await sset(`bm:bets:${meId}`, next); setBets((b) => ({ ...b, [meId]: next }));
    flash(t("seasonLockedToast"));
  }
  async function saveResult(fxId, r) {
    const fresh = (await sget(K.res, true, {})) || {};
    const next = { ...fresh, [fxId]: { ...(fresh[fxId] || {}), ...r, updatedAt: Date.now() } };
    await sset(K.res, next); setResults(next);
  }
  async function saveLineup(fxId, data) {
    const fresh = (await sget(K.lineups, true, {})) || {};
    const next = { ...fresh, [fxId]: { ...(fresh[fxId] || {}), ...data, updatedAt: Date.now() } };
    await sset(K.lineups, next); setLineups(next);
  }
  async function saveFixture(fxId, patch) {
    if (String(fxId).startsWith("api-")) {
      setFixtures((current) => current.map((f) => (f.id === fxId ? { ...f, ...patch } : f)).sort((a, b) => a.date.localeCompare(b.date)));
      return;
    }
    const fresh = (await sget(K.fx, true, [])) || [];
    const next = fresh.map((f) => (f.id === fxId ? { ...f, ...patch } : f)).sort((a, b) => a.date.localeCompare(b.date));
    await sset(K.fx, next); setFixtures(next);
  }
  async function saveSideBets(picks) {
    if (!sideBetsOpen()) { flash(t("sideBetsClosed")); return; }
    const current = bets[meId] || { games: {}, season: {} };
    const next = { ...current, side: picks };
    const ok = await sset(`bm:bets:${meId}`, next);
    if (!ok) { flash(t("saveFailed")); return; }
    setBets((b) => ({ ...b, [meId]: next }));
    flash(t("sideBetsSaved"));
  }
  /* ---- dev-mode actions (password-gated in the UI, see DevPanel) ---- */
  async function saveSideResults(patch) {
    const fresh = (await sget(K.sideRes, true, {})) || {};
    const next = { ...fresh, ...patch };
    await sset(K.sideRes, next); setSideRes(next);
  }
  async function adminUpdateUser(uid, patch) {
    const fresh = (await sget(K.users, true, [])) || [];
    const list = fresh.map((u) => (u.id === uid ? { ...u, ...patch } : u));
    await sset(K.users, list); setUsers(list);
  }
  async function adminDeleteUser(uid) {
    const fresh = (await sget(K.users, true, [])) || [];
    const list = fresh.filter((u) => u.id !== uid);
    await sset(K.users, list);
    await sdel(`bm:bets:${uid}`, true);
    setUsers(list);
    setBets((b) => { const next = { ...b }; delete next[uid]; return next; });
    if (uid === meId) { rememberMe(null); setMeId(null); }
  }
  /* Dev-only helper for populating a test league with plausible-looking data: fills
     in a random score (and sometimes a scorer/assist) for every fixture that doesn't
     already have a bet, for every non-bot user. Never overwrites an existing pick. */
  async function adminSeedRandomBets() {
    const players = users.filter((u) => !u.isBot);
    const pool = SQUAD.filter((p) => p.pos !== "GK");
    const pick = () => pool[Math.floor(Math.random() * pool.length)]?.name || null;
    const updated = {};
    for (const u of players) {
      const current = bets[u.id] || { games: {}, season: {} };
      const games = { ...(current.games || {}) };
      fixtures.forEach((f) => {
        if (games[f.id]) return;
        games[f.id] = {
          h: Math.floor(Math.random() * 4), a: Math.floor(Math.random() * 4),
          scorer: Math.random() < 0.6 ? pick() : null,
          assister: Math.random() < 0.4 ? pick() : null,
        };
      });
      const next = { ...current, games };
      updated[u.id] = next;
      await sset(`bm:bets:${u.id}`, next);
    }
    setBets((b) => ({ ...b, ...updated }));
  }
  const betFor = useCallback((uid, f) => {
    const own = bets[uid]?.games?.[f.id];
    if (own) return own;
    if (uid === "monkey") return null;
    if (locked(f)) { const mk = bets.monkey?.games?.[f.id]; if (mk) return { ...mk, inherited: true }; }
    return null;
  }, [bets]);

  const displayResults = useMemo(() => ({ ...apiResults, ...results }), [apiResults, results]);

  const standings = useMemo(() => users.map((u) => {
    const t = runTally(u.id, fixtures, displayResults, betFor);
    const sb = bets[u.id]?.season || {};
    let seasonPts = 0;
    if (seasonRes.topScorer && sb.scorer === seasonRes.topScorer) seasonPts += 10;
    if (seasonRes.topAssister && sb.assister === seasonRes.topAssister) seasonPts += 10;
    const picks = bets[u.id]?.side || {};
    let sidePts = 0;
    SIDE_BETS.forEach((bet) => {
      if (!sideRes[bet.id] || picks[bet.id] !== sideRes[bet.id]) return;
      const opt = bet.options.find((o) => o.id === sideRes[bet.id]);
      sidePts += bet.pts + (opt?.bonus || 0);
    });
    return { u, ...t, pts: t.pts + seasonPts + sidePts, seasonPts, sidePts };
  }).sort((a, b) => b.pts - a.pts || b.exact - a.exact || a.u.name.localeCompare(b.u.name)),
    [users, fixtures, displayResults, bets, seasonRes, sideRes, betFor]);

  const nextFx = useMemo(() => fixtures.find((f) => !started(f) && displayResults[f.id]?.h == null) || null, [fixtures, displayResults, clockTick]);
  const liveFx = useMemo(() => {
    const now = Date.now();
    return fixtures.find((f) => {
      const t = koDate(f).getTime();
      return now >= t && now < t + 3 * 3600e3 && displayResults[f.id]?.status !== "finished";
    }) || null;
  }, [fixtures, displayResults, clockTick]);

  /* ---- live score: auto refresh every 2 minutes while a game is on ---- */
  const refreshScore = useCallback(async (fx, silent) => {
    if (!fx || polling.current) return;
    polling.current = true;
    try {
      if (!fx.apiId) throw new Error("Fixture is not linked to API-Football");
      const response = await footballGet("match", fx.apiId);
      const match = normalizeMatch(response.payload);
      if (match.status === "scheduled") {
        await saveResult(fx.id, { status: "scheduled" });
        if (!silent) flash(t("nothingLive"));
        polling.current = false; return;
      }
      await saveResult(fx.id, {
        h: match.h, a: match.a, status: match.status, minute: match.minute,
        scorers: match.scorers, assists: match.assists, events: match.events,
      });
      if (!silent) flash(match.status === "finished" ? t("fullTimeUpdated") : `${t("scoreUpdated")} · ${match.minute || t("live")}'`);
    } catch { if (!silent) flash(t("scoreReadError")); }
    polling.current = false;
  }, [t]);

  useEffect(() => {
    if (!liveFx || !ready) return;
    const tryPoll = () => {
      const r = displayResults[liveFx.id] || {};
      const age = Date.now() - (r.updatedAt || 0);
      if (r.status !== "finished" && age >= 2 * 60000) refreshScore(liveFx, true);
    };
    tryPoll();
    const i = setInterval(tryPoll, 30000);
    return () => clearInterval(i);
  }, [liveFx, ready, displayResults, refreshScore]);

  const displayBadges = badges;
  const shared = { users, bets, results: displayResults, lineups, fixtures, badges: displayBadges, me, betFor, saveMyBet, saveResult, saveLineup, saveFixture, flash, refreshScore, setOpenFx, setLineupFx };

  if (!ready) return (
    <LanguageContext.Provider value={{ lang, t }}>
    <FootballContext.Provider value={{ squad: SQUAD }}>
      <div className="bm" dir={lang === "he" ? "rtl" : "ltr"}><style>{CSS}</style>
        <Splash />
        <div className="wrap center" style={{ paddingTop: 100 }}><Crest size={64} /><p className="note" style={{ marginTop: 16 }}>{t("loading")}</p></div>
      </div>
    </FootballContext.Provider>
    </LanguageContext.Provider>
  );
  if (!me) return (
    <LanguageContext.Provider value={{ lang, t }}>
      <div className="bm" dir={lang === "he" ? "rtl" : "ltr"}><style>{CSS}</style>
        <Onboard users={users} onPick={(id) => { rememberMe(id); setMeId(id); }} onCreate={createUser} onToggleLanguage={toggleLanguage} />
      </div>
    </LanguageContext.Provider>
  );

  return (
    <LanguageContext.Provider value={{ lang, t }}>
    <FootballContext.Provider value={{ squad: SQUAD }}>
    <div className="bm" dir={lang === "he" ? "rtl" : "ltr"}>
      <style>{CSS}</style>
      <Splash />
      <div className="topbar">
        <div className="brand-icons">
          <img className="messi-mark" src="/assets/brand/messi.jpeg" alt="Lionel Messi" />
          <Crest size={38} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="wordmark"><span className="wm-a">Barca</span><span className="wm-b">Manyak</span></div>
          <div className="tagline">
            <span className="tagline-count">{users.filter((u) => !u.isBot).length}&nbsp;{t("players")}</span>
            <span className="tagline-dot">·</span>
            <span className="mono tagline-season">2026/27</span>
          </div>
        </div>
        <button className="av-btn" onClick={() => setTab("me")} aria-label={t("me")} aria-current={tab === "me"}>
          <Avatar user={me} size="s" />
          <span className="av-btn-label">{t("me")}</span>
        </button>
        <button className="lang-toggle" onClick={toggleLanguage} aria-label={lang === "he" ? "Switch to English" : "החלפה לעברית"}>{t("switchLanguage")}</button>
      </div>
      {tab === "next" && <NextView {...shared} {...{ nextFx, liveFx, fixtures, standings }} />}
      {tab === "fixtures" && <FixturesView {...shared} {...{ fixtures }} />}
      {tab === "side" && <SideBetsView {...{ me, users, bets, saveSideBets }} />}
      {tab === "table" && <TableView standings={standings} fixtures={fixtures} results={displayResults} users={users} bets={bets} liveFx={liveFx} betFor={betFor} />}
      {tab === "me" && <MeView {...{ me, updateMe, users, standings, flash, myBets, saveSeason, bets, seasonRes, setSeasonRes, onSwitchUser: () => { rememberMe(null); setMeId(null); }, devUnlocked, onDevUnlock: () => setDevUnlocked(true), onOpenDev: () => setDevOpen(true), onLockDev: () => { setDevUnlocked(false); setDevOpen(false); } }} />}

      {openFx && <MatchSheet fx={openFx} onClose={() => setOpenFx(null)} {...shared} />}
      {lineupFx && <LineupSheet fx={lineupFx} onClose={() => setLineupFx(null)} {...shared} />}
      {devOpen && devUnlocked && (
        <DevPanel
          onClose={() => setDevOpen(false)}
          users={users} bets={bets} sideRes={sideRes} saveSideResults={saveSideResults}
          adminUpdateUser={adminUpdateUser} adminDeleteUser={adminDeleteUser} adminSeedRandomBets={adminSeedRandomBets}
          fixtures={fixtures} saveFixture={saveFixture} badges={badges} flash={flash}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 96, left: 16, right: 16, maxWidth: 728, margin: "0 auto", zIndex: 60 }}>
          <div className="card" style={{ background: "var(--ink-3)", fontSize: 13, textAlign: "center" }}>{toast}</div>
        </div>
      )}

      <nav className="nav">
        {[["side", t("sideBets"), "season"], ["fixtures", t("games"), "fx"], ["next", t("nextUp"), "next"], ["table", t("table"), "table"]].map(([k, label, ic]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} aria-current={tab === k}>
            <Ico d={ICONS[ic]} /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
    </FootballContext.Provider>
    </LanguageContext.Provider>
  );
}

/* ============================ web lookups ============================ */
async function askClaude(prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", max_tokens: 1400,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  const data = await r.json();
  const text = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
  const m = text.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
  if (!m) throw new Error("no data");
  return JSON.parse(m[0]);
}

/* ============================ onboarding ============================ */
function Onboard({ users, onPick, onCreate, onToggleLanguage }) {
  const { lang, t } = useI18n();
  const [name, setName] = useState("");
  const [pic, setPic] = useState(null);
  const people = users.filter((u) => !u.isBot);
  return (
    <>
      <div className="topbar" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <div style={{ textAlign: "center", width: "100%" }}>
          <div style={{ display: "inline-block" }}><Crest size={72} /></div>
          <h1 style={{ fontSize: 40, marginTop: 12 }}>Barca<span style={{ color: "var(--gold)" }}>Manyak</span></h1>
          <div className="tagline" style={{ marginTop: 8 }}>{t("tagline")}</div>
        </div>
        <button className="lang-toggle" onClick={onToggleLanguage} aria-label={lang === "he" ? "Switch to English" : "החלפה לעברית"}>{t("switchLanguage")}</button>
      </div>
      <div className="wrap">
        {people.length > 0 && (
          <div className="card">
            <div className="eyebrow">{t("whoAreYou")}</div>
            <div style={{ marginTop: 10 }}>
              {people.map((u) => (
                <button key={u.id} className="pick" onClick={() => onPick(u.id)}>
                  <Avatar user={u} size="s" /><span>{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="card">
          <div className="eyebrow">{people.length ? t("joinLeague") : t("startLeague")}</div>
          <label className="fl" htmlFor="bm-name">{t("yourName")}</label>
          <input id="bm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("nameExample")} />
          <label className="fl">{t("profilePicture")}</label>
          <PicPicker pic={pic} onPic={setPic} />
          <div style={{ height: 14 }} />
          <button className="btn" disabled={!name.trim()} onClick={() => onCreate(name.trim(), pic)}>{t("join")}</button>
          <p className="note" style={{ marginTop: 12 }}>{t("sharedLeague")}</p>
        </div>
      </div>
    </>
  );
}

function PresetPhotos({ pic, onPic }) {
  const { t } = useI18n();
  return <div>
    <div className="eyebrow">{t("choosePreset")}</div>
    <div className="avatar-presets">
      {PROFILE_PRESETS.map(({ src, position }, index) => (
        <button key={src} type="button" className={`avatar-preset ${pic === src ? "on" : ""}`}
          onClick={() => onPic(src)} aria-label={`${t("choosePreset")} ${index + 1}`}>
          <img src={src} alt="" style={{ objectPosition: position }} />
        </button>
      ))}
    </div>
  </div>;
}

function PicPicker({ pic, onPic }) {
  const { t } = useI18n();
  const ref = useRef();
  const handle = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const img = new Image(); const fr = new FileReader();
    fr.onload = () => { img.onload = () => {
      const c = document.createElement("canvas"); c.width = c.height = 160;
      const ctx = c.getContext("2d"); const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
      onPic(c.toDataURL("image/jpeg", 0.72));
    }; img.src = fr.result; };
    fr.readAsDataURL(file);
  };
  return (
    <div>
      <div className="row" style={{ alignItems: "center" }}>
        {pic ? <img className="av l" src={pic} alt="" /> : <div className="av l">📷</div>}
        <div style={{ flex: 1 }}>
          <button className="btn ghost" onClick={() => ref.current?.click()}>{t("uploadYourOwn")}</button>
          {pic && <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => onPic(null)}>{t("remove")}</button>}
          <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display: "none" }} />
        </div>
      </div>
      <div className="avatar-panel"><PresetPhotos pic={pic} onPic={onPic} /></div>
    </div>
  );
}

/* Shared "what's happened in this match so far" card — minute-by-minute goals, cards
   and subs (and, inline in each goal row, the scorer/assist) straight from the API.
   Used both in the match sheet and, live, directly on the Up Next tab so nobody has
   to open the sheet just to see what's going on during a live game. */
function MatchEventsCard({ r, isStarted }) {
  const { lang, t } = useI18n();
  if (!isStarted) return null;
  return (
    <div className="card">
      <div className="eyebrow">{t("matchEvents")}</div>
      {(r.events || []).length ? <div style={{ marginTop: 8 }}>
        {r.events.map((event, index) => {
          const isGoal = event.type === "Goal";
          const isCard = event.type === "Card";
          const isSub = String(event.type).toLowerCase() === "subst";
          const red = /Red/i.test(event.detail || "");
          const icon = isGoal ? "⚽" : isCard ? (red ? "🟥" : "🟨") : isSub ? "🔄" : "•";
          const label = isGoal ? t("goalEvent") : isCard ? (red ? t("redCardEvent") : t("yellowCardEvent")) : isSub ? t("substitutionEvent") : event.detail;
          const minute = `${event.minute ?? ""}${event.extra ? `+${event.extra}` : ""}'`;
          return <div className="event-row" key={`${event.minute}-${index}`}>
            <span className="mono">{minute}</span><span className="event-icon">{icon}</span>
            <div><b>{label}</b> · {playerLabel(event.player, lang) || teamLabel(event.team, lang)}{event.assist ? ` → ${playerLabel(event.assist, lang)}` : ""}</div>
          </div>;
        })}
      </div> : <p className="note" style={{ marginTop: 8 }}>{t("noEvents")}</p>}
    </div>
  );
}

/* ============================ next up ============================ */
function NextView({ nextFx, liveFx, fixtures, standings, users, bets, results, badges, me, betFor, saveMyBet, saveResult, saveFixture, saveLineup, flash, refreshScore, setOpenFx, setLineupFx }) {
  const { lang, t } = useI18n();
  const show = liveFx || nextFx;
  const [, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [inputMode, toggleInputMode] = useInputMode("next");
  useEffect(() => { const i = setInterval(() => setTick((t) => t + 1), 1000); return () => clearInterval(i); }, []);
  if (!show) return <div className="wrap"><div className="card center"><h3>{t("seasonDone")}</h3><p className="note" style={{ marginTop: 8 }}>{t("seasonDoneNote")}</p></div></div>;

  const r = results[show.id] || {};
  const isLive = !!liveFx && r.status !== "finished";
  const isStarted = started(show);
  const betsLocked = locked(show);
  const myBet = betFor(me.id, show);
  const humans = users.filter((u) => !u.isBot);
  const s = sides(show);
  const remaining = koDate(show).getTime() - Date.now();
  const d = Math.max(0, Math.floor(remaining / 86400e3)), h = Math.max(0, Math.floor((remaining % 86400e3) / 3600e3));
  const m = Math.max(0, Math.floor((remaining % 3600e3) / 60e3)), sec = Math.max(0, Math.floor((remaining % 60e3) / 1000));
  const lastDone = [...fixtures].filter((f) => results[f.id]?.h != null && f.id !== show.id).pop();

  return (
    <div className="wrap">
      <div className="hero">
        <div className="hero-in">
          <div className="center">
            {isLive
              ? <span className="comp-chip live-chip"><span className="dot" />{t("live")}{r.minute ? ` · ${r.minute}'` : ""}</span>
              : <span className="comp-chip">{compLabel(show.comp, lang)}{show.round ? ` · ${show.round}` : ""}{isDoublePointsFixture(show) ? ` · ${t("doublePointsBadge")}` : ""}</span>}
          </div>
          <div className="vs">
            <div className="team"><Badge team={s.home} size={44} badges={badges} /><div className="team-name display">{teamLabel(s.home, lang)}</div><div className="team-tag">{t("home")}</div></div>
            {r.h != null ? <div className="bigscore mono">{r.h}–{r.a}</div> : <div className="dash mono">VS</div>}
            <div className="team"><Badge team={s.away} size={44} badges={badges} /><div className="team-name display">{teamLabel(s.away, lang)}</div><div className="team-tag">{t("away")}</div></div>
          </div>
          <div className="center" style={{ marginTop: 10 }}>
            <button className="btn ghost sm" onClick={() => setLineupFx(show)}>{t("lineups")}</button>
          </div>
          {remaining > 0 ? (
            <>
              <div className="clock mono">
                <div><b>{d}</b><i>{t("days")}</i></div><div><b>{String(h).padStart(2, "0")}</b><i>{t("hrs")}</i></div>
                <div><b>{String(m).padStart(2, "0")}</b><i>{t("min")}</i></div><div><b>{String(sec).padStart(2, "0")}</b><i>{t("sec")}</i></div>
              </div>
              <div className="kickoff">{t("kickoff")} {fmtKO(show)}{show.tbd ? ` · ${t("timeTbc")}` : ""}</div>
            </>
          ) : (
            <div className="center" style={{ marginTop: 10 }}>
              {r.scorers?.length > 0 && <div style={{ fontSize: 13 }}>⚽ {r.scorers.join(" · ")}</div>}
              <div className="kickoff">{r.updatedAt ? `${t("updated")} ${new Date(r.updatedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}` : t("betsClosed")}</div>
            </div>
          )}
          <div className="card next-bet">
            <div className="row" style={{ alignItems: "center" }}>
              <div className="eyebrow">{t("yourBet")}</div>
              {myBet?.inherited && <span className="tag monkey">{t("dembeleFilled")}</span>}
              <InputModeToggle mode={inputMode} onToggle={toggleInputMode} style={{ marginInlineStart: "auto" }} />
            </div>
            {/* standing confirmation, so you can see at a glance that a bet is in */}
            {myBet && !myBet.inherited && (
              <div className="bet-in">
                <span className="bet-in-tick">✓</span>
                <div>
                  <div className="bet-in-title">{t("betIsIn")}</div>
                  <div className="bet-in-detail mono">
                    {myBet.h}–{myBet.a}
                    {myBet.scorer ? ` · ⚽ ${playerLabel(myBet.scorer, lang)}` : ""}
                    {myBet.assister ? ` · 🅰️ ${playerLabel(myBet.assister, lang)}` : ""}
                  </div>
                </div>
              </div>
            )}
            {!myBet && !betsLocked && <div className="bet-out">{t("betNotIn")}</div>}
            {!betsLocked
              ? <BetForm fx={show} initial={myBet} badges={badges} mode={inputMode} onSave={(b) => { saveMyBet(show.id, b); flash(t("betSaved")); }} />
              : <div style={{ marginTop: 12 }}>{myBet ? <BetLine bet={myBet} res={r} /> : <p className="note">{t("waitingMonkey")}</p>}</div>}
          </div>
          {isStarted && (
            <div className="row" style={{ marginTop: 14 }}>
              <button className={`btn sm ${isLive ? "red" : "gold"}`} style={{ flex: 1 }} disabled={busy}
                onClick={async () => { setBusy(true); await refreshScore(show, false); setBusy(false); }}>
                {busy ? <span className="spin" /> : isLive ? t("refreshScore") : t("getResult")}
              </button>
            </div>
          )}
          {isLive && <p className="note center" style={{ marginTop: 8 }}>{t("autoRefresh")}</p>}
        </div>
      </div>

      <MatchEventsCard r={r} isStarted={isStarted} />

      {lastDone && (
        <div className="card">
          <div className="eyebrow">{t("lastResult")}</div>
          <button className="fx" onClick={() => setOpenFx(lastDone)} style={{ paddingBottom: 0 }}>
            <Badge team={lastDone.opp} size={30} badges={badges} />
            <div className="grow"><div className="nm">{teamLabel(sides(lastDone).home, lang)} v {teamLabel(sides(lastDone).away, lang)}</div>
              <div className="sub">{compLabel(lastDone.comp, lang)} · {t("everyoneBetsTap")}</div></div>
            <span className="score-pill mono">{results[lastDone.id].h}–{results[lastDone.id].a}</span>
          </button>
        </div>
      )}

    </div>
  );
}

function BetLine({ bet, res }) {
  const { lang, t } = useI18n();
  const s = res?.h != null ? scoreBet(bet, res) : null;
  return (
    <div className="row" style={{ alignItems: "center", gap: 12 }}>
      <span className="score-pill mono" style={{ fontSize: 18 }}>{bet.h}–{bet.a}</span>
      <div className="grow">
        <div className="nm">{bet.scorer ? playerLabel(bet.scorer, lang) : t("noScorerPicked")}</div>
        {s && <div className="sub">{s.exact ? t("exactPlus") : s.direction ? t("directionPlus") : t("directionMissed")}{s.hit ? ` · ${t("scorerPlus")}` : ""}</div>}
      </div>
      {s && <span className="pts mono" style={{ color: s.pts ? "var(--win)" : "var(--bone-dim)" }}>{fmtPts(s.pts)}</span>}
    </div>
  );
}

/* ============================ bet forms ============================ */
function BonusSheet({ scorer, assister, onChange, onClose, fx, badges }) {
  const { lang, t } = useI18n();
  const { squad } = useFootball();
  const [mode, setMode] = useState("scorer");
  const cur = mode === "scorer" ? scorer : assister;
  const pick = (name) => onChange(mode === "scorer" ? { scorer: name } : { assister: name });
  const s = fx ? sides(fx) : null;
  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div><h3 style={{ fontSize: 19 }}>{t("bonusBets")}</h3>
            <div className="note">{t("bonusExplainer")}</div></div>
          <button className="x" onClick={onClose} aria-label={t("close")}>×</button>
        </div>
        {/* which game these bonuses belong to */}
        {s && (
          <div className="bonus-fx">
            <Badge team={s.home} size={24} badges={badges} />
            <span className="bonus-fx-name">{teamLabel(s.home, lang)}</span>
            <span className="bonus-fx-v">v</span>
            <span className="bonus-fx-name">{teamLabel(s.away, lang)}</span>
            <Badge team={s.away} size={24} badges={badges} />
            <span className="bonus-fx-when mono">{fmtKO(fx)}</span>
          </div>
        )}
        <div className="seg">
          <button className={mode === "scorer" ? "on" : ""} onClick={() => setMode("scorer")}>
            ⚽ {t("scorer")} <span className="segpt">+1</span>
          </button>
          <button className={mode === "assist" ? "on" : ""} onClick={() => setMode("assist")}>
            🅰️ {t("assist")} <span className="segpt">+0.5</span>
          </button>
        </div>
        <div className="row" style={{ marginTop: 10, gap: 6, flexWrap: "wrap" }}>
          <span className={`tag ${scorer ? "in" : ""}`}>⚽ {scorer ? playerLabel(scorer, lang) : t("none")}</span>
          <span className={`tag ${assister ? "in" : ""}`}>🅰️ {assister ? playerLabel(assister, lang) : t("none")}</span>
        </div>
        <div className="pick-list" style={{ marginTop: 10 }}>
          {["FW", "MF", "DF", "GK"].map((pos) => (
            <div key={pos}>
              <div className="month" style={{ marginTop: 10 }}>{{ FW: t("forwards"), MF: t("midfield"), DF: t("defenders"), GK: t("keepers") }[pos]}</div>
              {squad.filter((p) => p.pos === pos).map((p) => (
                <button key={p.name} className={`pick ${cur === p.name ? "on" : ""}`} onClick={() => pick(p.name)}>
                  {p.photo ? <img className="player-photo" src={p.photo} alt="" /> : <span className="num mono">{p.n ?? "–"}</span>}
                  <span>{playerLabel(p.name, lang)}</span><span className="pos">{p.pos}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          {cur && <button className="btn ghost" onClick={() => pick(null)}>{t("clearPick")}</button>}
          <button className="btn" onClick={onClose}>{t("done")}</button>
        </div>
      </div>
    </div>
    </Portal>
  );
}

/* Scroll wheel score picker — replaces the old +/- stepper everywhere a score is set.
   Flick or drag the column and it snaps to the nearest number; the centered item is
   the current value. Shows 0 by default before a bet exists, same as the stepper did
   once you tapped it the first time. */
function ScoreWheel({ value, onChange, max = 15, compact = false }) {
  const trackRef = useRef(null);
  const itemH = compact ? 20 : 40;
  const shown = value ?? 0;
  const draggingRef = useRef(false);
  const idleTimer = useRef(null);

  /* Sole place that ever forces scrollTop — a single plain (non-animated) jump, and
     only when the value changed from outside a live drag. commit() below never
     also tries to correct the scroll position itself: two independent correctors
     (an animated one in commit and an instant one here) fought each other and could
     leave the wheel settled on the wrong number, since each is itself a scrollTop
     write that re-triggers a native "scroll" event and restarts the other. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || draggingRef.current) return;
    const target = shown * itemH;
    if (Math.abs(track.scrollTop - target) > 1) track.scrollTop = target;
  }, [shown, itemH]);

  const commit = () => {
    const track = trackRef.current;
    if (!track) return;
    const idx = Math.max(0, Math.min(max, Math.round(track.scrollTop / itemH)));
    draggingRef.current = false;
    if (idx !== value) onChange(idx);
  };

  const handleScroll = () => {
    draggingRef.current = true;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(commit, 130);
  };

  return (
    <div className={`wheel${compact ? " compact" : ""}`}>
      <div className="wheel-window" />
      <div className="wheel-mask-top" />
      <div className="wheel-mask-bottom" />
      <div className="wheel-track" ref={trackRef} onScroll={handleScroll}>
        {Array.from({ length: max + 1 }, (_, n) => (
          <div key={n} className={`wheel-item${n === shown ? " on" : ""}`}>{n}</div>
        ))}
      </div>
    </div>
  );
}

/* Old up/down arrow stepper, kept alongside ScoreWheel as an alternative input style —
   the user can swap between them per tab via the "FN" toggle button. Hoisted to module
   scope for the same reason ScoreWheel is: defining it inside a parent component's body
   would give React a fresh function identity every render and remount it needlessly. */
function ScoreStepper({ value, onChange, max = 15, compact = false }) {
  const v = value ?? 0;
  return (
    <div className={`stepper${compact ? " compact" : ""}`}>
      <button type="button" className="stepper-btn" disabled={v >= max} aria-label="+1"
        onClick={() => onChange(Math.min(max, v + 1))}>▲</button>
      <div className="stepper-value mono">{v}</div>
      <button type="button" className="stepper-btn" disabled={v <= 0} aria-label="-1"
        onClick={() => onChange(Math.max(0, v - 1))}>▼</button>
    </div>
  );
}

/* Small localStorage-backed preference (device-local, not synced to the shared league
   data — it's purely "how do I like to enter a score", same idea as the language
   toggle) for which score-input control a tab uses: the scroll wheel or the old arrow
   stepper. Defaults to the wheel. */
function useInputMode(key) {
  const [mode, setMode] = useState(() => {
    try { return window.localStorage.getItem(`bm:inputmode:${key}`) === "arrows" ? "arrows" : "wheel"; }
    catch { return "wheel"; }
  });
  const toggle = () => {
    setMode((m) => {
      const next = m === "wheel" ? "arrows" : "wheel";
      try { window.localStorage.setItem(`bm:inputmode:${key}`, next); } catch {}
      return next;
    });
  };
  return [mode, toggle];
}

function InputModeToggle({ mode, onToggle, style }) {
  const { t } = useI18n();
  return (
    <button type="button" className={`fn-toggle${mode === "arrows" ? " on" : ""}`} style={style}
      onClick={onToggle} aria-label={t("inputModeToggle")} title={t("inputModeToggle")}>FN</button>
  );
}

/* Hoisted to module scope on purpose: a component defined *inside* another
   component's body is a fresh function reference every render, so React treats it
   as a brand-new component type each time and remounts it — fine for stateless
   buttons, but it silently threw away the wheel's live scroll position (and DOM
   node) on every single score change. */
function St({ v, set, label, mode }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div className="team-tag" style={{ marginBottom: 8 }}>{label}</div>
      {mode === "arrows" ? <ScoreStepper value={v} onChange={set} /> : <ScoreWheel value={v} onChange={set} />}
    </div>
  );
}

function BetForm({ fx, initial, onSave, badges, mode = "wheel" }) {
  const { lang, t } = useI18n();
  const [h, setH] = useState(initial?.h ?? null);
  const [a, setA] = useState(initial?.a ?? null);
  const [scorer, setScorer] = useState(initial?.scorer ?? null);
  const [assister, setAssister] = useState(initial?.assister ?? null);
  const [picking, setPicking] = useState(false);
  const s = sides(fx);
  return (
    <>
      <div className="row" style={{ marginTop: 14, gap: 16, justifyContent: "center" }}>
        <St v={h} set={setH} label={teamLabel(s.home, lang)} mode={mode} /><St v={a} set={setA} label={teamLabel(s.away, lang)} mode={mode} />
      </div>
      <p className="note center" style={{ marginTop: 10 }}>{t("scoreHint")}</p>
      <button className="btn ghost" style={{ marginTop: 14, justifyContent: "space-between" }} onClick={() => setPicking(true)}>
        <span>{scorer ? `⚽ ${playerLabel(scorer, lang)}` : `⚽ ${t("whoScores")}`}</span><span style={{ color: "var(--bone-dim)" }}>›</span>
      </button>
      <button className="btn ghost" style={{ marginTop: 8, justifyContent: "space-between" }} onClick={() => setPicking(true)}>
        <span>{assister ? `🅰️ ${playerLabel(assister, lang)}` : `🅰️ ${t("whoAssists")}`}</span><span style={{ color: "var(--bone-dim)" }}>›</span>
      </button>
      <button className="btn" style={{ marginTop: 10 }} disabled={h == null || a == null} onClick={() => onSave({ h, a, scorer, assister })}>
        {initial && !initial.inherited ? t("updateBet") : t("placeBet")}
      </button>
      {picking && <BonusSheet scorer={scorer} assister={assister} fx={fx} badges={badges}
        onChange={(p) => { if ("scorer" in p) setScorer(p.scorer); else setAssister(p.assister); }}
        onClose={() => setPicking(false)} />}
    </>
  );
}

/* compact score control: shows – until a bet is placed, then up/down around the number */
function RowBonus({ fx, initial, onSave }) {
  const { lang, t } = useI18n();
  const [picking, setPicking] = useState(false);
  const scorer = initial?.scorer ?? null;
  const assister = initial?.assister ?? null;
  const label = scorer ? playerLabel(scorer, lang).split(" ").pop()
    : assister ? playerLabel(assister, lang).split(" ").pop() : t("bonusShort");
  return (
    <>
      <button className={`fx-bonus ${scorer || assister ? "on" : ""}`} onClick={() => setPicking(true)}>
        ⚽ {label}{scorer && assister ? " +1" : ""}
      </button>
      {picking && (
        <BonusSheet scorer={scorer} assister={assister} fx={fx}
          onChange={(p) => onSave({
            h: initial?.h ?? 0, a: initial?.a ?? 0,
            scorer: "scorer" in p ? p.scorer : scorer,
            assister: "assister" in p ? p.assister : assister,
          })}
          onClose={() => setPicking(false)} />
      )}
    </>
  );
}

/* Hoisted to module scope — see the note above St() for why this can't live
   inside RowBet's own body. */
function Col({ team, v, onSet, mode }) {
  return (
    <div className="vb-col">
      <span className="vb-tag">{teamInfo(team).abbr}</span>
      {mode === "arrows" ? <ScoreStepper value={v} onChange={onSet} compact /> : <ScoreWheel value={v} onChange={onSet} compact />}
    </div>
  );
}

function RowBet({ fx, initial, onSave, mode }) {
  const [h, setH] = useState(initial ? initial.h : null);
  const [a, setA] = useState(initial ? initial.a : null);
  const first = useRef(true);
  /* The bonus picks are owned by RowBonus in the card header now. Read them from the
     live prop when saving a score — keeping a local copy here would overwrite a
     scorer the user chose a moment ago with a stale one. */
  const bonusRef = useRef({ scorer: initial?.scorer ?? null, assister: initial?.assister ?? null });
  bonusRef.current = { scorer: initial?.scorer ?? null, assister: initial?.assister ?? null };
  const s = sides(fx);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (h == null || a == null) return;              // nothing to save until both sides are set
    const timer = setTimeout(() => {
      onSave({ h, a, ...bonusRef.current });
    }, 700);
    return () => clearTimeout(timer);
  }, [h, a]);

  // the first scroll on either side starts the bet at 0–0 for the other side
  const setSide = (side, next) => {
    if (side === "h") { setH(next); setA((prev) => prev ?? 0); } else { setA(next); setH((prev) => prev ?? 0); }
  };

  return (
    <div className="vb">
      <Col team={s.home} v={h} onSet={(n) => setSide("h", n)} mode={mode} />
      <Col team={s.away} v={a} onSet={(n) => setSide("a", n)} mode={mode} />
    </div>
  );
}

function FixturesView({ fixtures, results, badges, users, bets, me, betFor, saveMyBet, setOpenFx, flash }) {
  const { lang, t } = useI18n();
  const [comp, setComp] = useState("All");
  const [open, setOpen] = useState(null);
  const [mode, toggleMode] = useInputMode("games");
  const comps = ["All", ...Array.from(new Set(fixtures.map((f) => f.comp)))];
  const list = fixtures.filter((f) => comp === "All" || f.comp === comp);
  let month = null;
  let toggleShown = false;
  return (
    <div className="wrap">
      <div className="row" style={{ overflowX: "auto", paddingBottom: 4 }}>
        {comps.map((c) => (
          <button key={c} className={`btn sm ${comp === c ? "gold" : "ghost"}`} style={{ flex: "none" }} onClick={() => setComp(c)}>{c === "All" ? t("all") : compLabel(c, lang)}</button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {list.map((f) => {
          const mk = monthKey(f.date, lang); const head = mk !== month; month = mk;
          const showToggle = head && !toggleShown;
          if (showToggle) toggleShown = true;
          const r = results[f.id]; const b = betFor(me.id, f);
          const sc = r?.h != null && b ? scoreBet(b, r, false, isDoublePointsFixture(f)) : null;
          const isOpen = open === f.id; const s = sides(f); const done = locked(f) || r?.h != null;
          return (
            <div key={f.id}>
              {head && (
                <div className="row" style={{ alignItems: "center", justifyContent: "space-between", margin: "18px 0 2px" }}>
                  <div className="month" style={{ margin: 0 }}>{mk}</div>
                  {showToggle && <InputModeToggle mode={mode} onToggle={toggleMode} style={{ flex: "none" }} />}
                </div>
              )}
              <div className="fxcard">
                <div className="fxcard-head">
                  <button className="fx-when" onClick={() => setOpen(isOpen ? null : f.id)}>
                    {koLabel(f, lang)}
                  </button>
                  {!done && <RowBonus fx={f} initial={b} onSave={(bet) => saveMyBet(f.id, bet)} />}
                </div>

                <div className="fxcard-body">
                  <button className="fx-teams" onClick={() => setOpen(isOpen ? null : f.id)}>
                    <span className="fx-side">
                      <Badge team={s.home} size={21} badges={badges} />
                      <ResponsiveTeamName team={s.home} />
                      <span className="fx-home" title={t("playsAtHome")}>🏟️</span>
                    </span>
                    <span className="fx-side">
                      <Badge team={s.away} size={21} badges={badges} />
                      <ResponsiveTeamName team={s.away} />
                    </span>
                  </button>

                  {done ? (
                    <div className="vb-done">
                      {r?.h != null ? <span className="score-pill mono">{r.h}–{r.a}</span>
                        : b ? <span className="tag in mono">{b.h}–{b.a}</span>
                        : <span className="tag out">{t("missed")}</span>}
                      {sc && <span className="pts mono" style={{ fontSize: 15, color: sc.pts ? "var(--win)" : "var(--bone-dim)" }}>{fmtPts(sc.pts)}</span>}
                    </div>
                  ) : (
                    <RowBet fx={f} initial={b} onSave={(bet) => saveMyBet(f.id, bet)} mode={mode} />
                  )}
                </div>

                <div className="sub fxcard-comp">
                  {compLabel(f.comp, lang)}{f.tbd ? " · TBC" : ""}
                  {isDoublePointsFixture(f) ? ` · ${t("doublePointsBadge")}` : ""}
                  {!done && b?.scorer ? ` · ⚽ ${playerLabel(b.scorer, lang)}` : ""}
                  {!done && b?.assister ? ` · 🅰️ ${playerLabel(b.assister, lang)}` : ""}
                </div>
              </div>

              {isOpen && done && (
                <div className="quick">
                   <div className="eyebrow">{t("everyoneBets")}</div>
                  {users.map((u) => {
                    const ub = betFor(u.id, f); const us = r?.h != null && ub ? scoreBet(ub, r, false, isDoublePointsFixture(f)) : null;
                    return (
                      <div className="frow" key={u.id} style={{ padding: "8px 0" }}>
                        <Avatar user={u} size="xs" />
                        <div className="grow"><div className="nm" style={{ fontSize: 13 }}>{u.name}</div>
                          <div className="sub">{ub ? (ub.scorer ? playerLabel(ub.scorer, lang) : t("noScorer")) : t("noBet")}</div></div>
                        {ub && <span className="score-pill mono" style={{ fontSize: 13 }}>{ub.h}–{ub.a}</span>}
                        {us && <span className="mono" style={{ fontSize: 14, color: us.pts ? "var(--win)" : "var(--bone-dim)" }}>{fmtPts(us.pts)}</span>}
                      </div>
                    );
                  })}
                  <button className="btn ghost sm" style={{ marginTop: 10, width: "100%" }} onClick={() => setOpenFx(f)}>{t("openMatch")}</button>
                </div>
              )}
              {isOpen && !done && (
                <button className="btn ghost sm" style={{ width: "100%", margin: "0 0 10px" }} onClick={() => setOpenFx(f)}>{t("openMatch")}</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ line-ups on a pitch ============================ */
function Pitch({ data, team, badges }) {
  const { lang, t } = useI18n();
  const players = data?.players || [];
  const rows = (data?.formation || "4-3-3").split("-").map((n) => parseInt(n, 10)).filter((n) => n > 0);
  const info = teamInfo(team);
  const shirt = info.a === "#F3EEE2" ? info.b : info.a;
  const txt = shirt === "#FFE500" || shirt === "#8AC3EE" ? "#1B1B1B" : "#FFF";

  const lines = [[players[0]].filter(Boolean)];
  let idx = 1;
  rows.forEach((n) => { lines.push(players.slice(idx, idx + n)); idx += n; });
  if (idx < players.length) lines[lines.length - 1] = lines[lines.length - 1].concat(players.slice(idx));

  const nBands = lines.length;
  return (
    <div className="pitch">
      <div className="pline" style={{ inset: "2%", borderRadius: 4 }} />
      <div className="pline" style={{ left: "2%", right: "2%", top: "50%", borderWidth: "2px 0 0" }} />
      <div className="pline" style={{ width: "26%", height: "20%", left: "37%", top: "50%", transform: "translateY(-50%)", borderRadius: "50%" }} />
      <div className="pline" style={{ left: "22%", right: "22%", top: "2%", height: "14%", borderTop: "none" }} />
      <div className="pline" style={{ left: "22%", right: "22%", bottom: "2%", height: "14%", borderBottom: "none" }} />
      <div className="pline" style={{ left: "36%", right: "36%", top: "2%", height: "6%", borderTop: "none" }} />
      <div className="pline" style={{ left: "36%", right: "36%", bottom: "2%", height: "6%", borderBottom: "none" }} />
      {lines.map((line, li) => {
        const y = 91 - (li * (78 / Math.max(1, nBands - 1)));
        return line.map((p, pi) => {
          const x = ((pi + 1) / (line.length + 1)) * 100;
          return (
            <div className="tok" key={`${li}-${pi}`} style={{ left: `${x}%`, top: `${y}%` }}>
              {p.photo ? <img className="tok-shirt" src={p.photo} alt="" style={{ objectFit: "cover", background: shirt }} />
                : <div className="tok-shirt" style={{ background: shirt, color: txt }}>{p.number ?? "–"}</div>}
              <div className="tok-nm">{playerLabel(p.name, lang)}</div>
            </div>
          );
        });
      })}
      {!players.length && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", fontSize: 13, textShadow: "0 1px 3px rgba(0,0,0,.8)" }}>
          {t("noLineup")}
        </div>
      )}
    </div>
  );
}

function LineupSheet({ fx, onClose, lineups, fixtures, saveLineup, badges, flash }) {
  const { lang, t } = useI18n();
  const data = lineups[fx.id] || {};
  const s = sides(fx);
  const [side, setSide] = useState("Barcelona");
  const [busy, setBusy] = useState(false);
  const [showingLast, setShowingLast] = useState(false);
  const key = side === "Barcelona" ? "barcelona" : "opponent";
  const previousFx = [...(fixtures || [])]
    .filter((candidate) => koDate(candidate).getTime() < koDate(fx).getTime() && (lineups[candidate.id]?.barcelona || lineups[candidate.id]?.opponent))
    .sort((a, b) => koDate(b).getTime() - koDate(a).getTime())[0] || null;
  const previousData = previousFx ? lineups[previousFx.id] : null;
  const lastData = previousData?.barcelona ? previousData : DEFAULT_LAST_LINEUP;
  const activeData = showingLast ? lastData : data;
  const cur = showingLast ? activeData.barcelona : activeData[key];
  const pitchTeam = showingLast ? "Barcelona" : side;

  const fetchBoth = async () => {
    setBusy(true);
    try {
      if (!fx.apiId) throw new Error("Fixture is not linked to API-Football");
      const response = await footballGet("match", fx.apiId);
      const parsed = normalizeLineups(normalizeMatch(response.payload));
      if (!parsed.barcelona || !parsed.opponent) throw new Error("Line-ups are not available yet");
      await saveLineup(fx.id, parsed);
      setShowingLast(false);
      flash(t("lineupsLoaded"));
    } catch { flash(t("lineupsError")); }
    setBusy(false);
  };

  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <h3 style={{ fontSize: 19 }}>{t("lineups")}</h3>
            <div className="note">{teamLabel(s.home, lang)} v {teamLabel(s.away, lang)} · {fmtKO(fx)}</div>
          </div>
          <button className="x" onClick={onClose} aria-label={t("close")}>×</button>
        </div>

        <div className="seg">
          {(showingLast ? ["Barcelona"] : [s.home, s.away]).map((tm) => (
            <button key={tm} className={side === tm ? "on" : ""} onClick={() => setSide(tm)}>
              <Badge team={tm} size={20} badges={badges} /><span>{teamLabel(tm, lang)}</span>
            </button>
          ))}
        </div>

        <div className="row center" style={{ margin: "14px 0 10px", justifyContent: "center", alignItems: "center", gap: 10 }}>
          {cur ? <span className={`tag big ${cur.confirmed ? "in" : ""}`}>{showingLast ? t("lastLineup") : cur.confirmed ? t("confirmedXI") : t("predictedXI")}</span>
            : <span className="tag big out">{t("notPulled")}</span>}
          {cur?.formation && <span className="tag big mono">{cur.formation}</span>}
        </div>

        <Pitch data={cur} team={pitchTeam} badges={badges} />

        {!data[key] && !showingLast && (
          <>
            <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => { setSide("Barcelona"); setShowingLast(true); }}>
              {t("viewLastLineup")}
            </button>
          </>
        )}
        {showingLast && (
          <>
            {!previousData?.barcelona && <p className="note center" style={{ marginTop: 8 }}>{t("lastLineupSource")}</p>}
            <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setShowingLast(false)}>{t("showCurrentLineup")}</button>
          </>
        )}

        <button className="btn gold" style={{ marginTop: 14 }} disabled={busy} onClick={fetchBoth}>
          {busy ? <span className="spin" /> : data.updatedAt ? t("refreshLineups") : t("getLineups")}
        </button>
        {activeData.updatedAt && <p className="note center" style={{ marginTop: 8 }}>{t("updated")} {new Date(activeData.updatedAt).toLocaleString(lang === "he" ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</p>}
      </div>
    </div>
    </Portal>
  );
}

/* ============================ match sheet ============================ */
function MatchSheet({ fx, onClose, users, bets, results, badges, me, betFor, saveMyBet, saveResult, saveFixture, flash, refreshScore, setLineupFx }) {
  const { lang, t } = useI18n();
  const r = results[fx.id] || {};
  const [manual, setManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mh, setMh] = useState(r.h ?? 0), [ma, setMa] = useState(r.a ?? 0);
  const [sc, setSc] = useState((r.scorers || []).join(", "));
  const isLocked = locked(fx); const isStarted = started(fx); const s = sides(fx);
  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="match-head-clubs"><Badge team={s.home} size={30} badges={badges} /><Badge team={s.away} size={30} badges={badges} /></div>
          <div>
            <h3 style={{ fontSize: 18 }}>{teamLabel(s.home, lang)} v {teamLabel(s.away, lang)}</h3>
            <div className="note">{compLabel(fx.comp, lang)}{fx.round ? ` · ${fx.round}` : ""}{isDoublePointsFixture(fx) ? ` · ${t("doublePointsBadge")}` : ""} · {fmtKO(fx)}</div>
          </div>
          <button className="x" onClick={onClose} aria-label={t("close")}>×</button>
        </div>

        {r.h != null && (
          <div className="card center">
            <div className="eyebrow">{r.status === "finished" ? t("fullTime") : `${t("live")}${r.minute ? ` · ${r.minute}'` : ""}`}</div>
            <div className="bigscore mono" style={{ paddingTop: 6 }}>{r.h}–{r.a}</div>
            {r.scorers?.length > 0 && <div style={{ fontSize: 13, marginTop: 6 }}>⚽ {r.scorers.join(" · ")}</div>}
          </div>
        )}

        <MatchEventsCard r={r} isStarted={isStarted} />

        {!isLocked && (
          <div className="card">
            <div className="eyebrow">{t("yourBet")}</div>
            <BetForm fx={fx} initial={betFor(me.id, fx)} badges={badges} onSave={(b) => { saveMyBet(fx.id, b); flash(t("betSaved")); }} />
          </div>
        )}

        {isLocked && (
          <div className="card">
            <div className="eyebrow">{t("everyoneBets")}</div>
            <div style={{ marginTop: 8 }}>
              {users.map((u) => {
                const b = betFor(u.id, fx);
                const bs = r.h != null && b ? scoreBet(b, r, false, isDoublePointsFixture(fx)) : null;
                return (
                  <div className="frow" key={u.id}>
                    <Avatar user={u} size="s" />
                    <div className="grow">
                      <div className="nm">{u.name}{u.id === me.id ? ` (${t("you")})` : ""}</div>
                       <div className="sub">{b ? (b.scorer ? playerLabel(b.scorer, lang) : t("noScorer")) : t("noBet")}{b?.inherited ? ` · ${t("dembeleFilled")}` : ""}</div>
                    </div>
                    {b && <span className="score-pill mono">{b.h}–{b.a}</span>}
                    {bs && <span className="pts mono" style={{ fontSize: 16, color: bs.pts ? "var(--win)" : "var(--bone-dim)" }}>{fmtPts(bs.pts)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn ghost" onClick={() => { onClose(); setLineupFx(fx); }}>{t("lineups")}</button>
          {isStarted && <button className="btn gold" disabled={busy}
            onClick={async () => { setBusy(true); await refreshScore(fx, false); setBusy(false); }}>
            {busy ? <span className="spin" /> : t("refreshScore")}</button>}
        </div>

        <div className="card">
          <div className="row" style={{ alignItems: "center" }}>
            <div className="eyebrow">{t("setResult")}</div>
            <button className="btn ghost sm" style={{ marginInlineStart: "auto" }} onClick={() => setManual(!manual)}>{manual ? t("hide") : t("open")}</button>
          </div>
          {manual && (
            <>
              <label className="fl">{t("finalScore")} ({teamLabel(s.home, lang)} – {teamLabel(s.away, lang)})</label>
              <div className="row">
                <input className="mono" type="number" min="0" value={mh} onChange={(e) => setMh(+e.target.value)} />
                <input className="mono" type="number" min="0" value={ma} onChange={(e) => setMa(+e.target.value)} />
              </div>
              <label className="fl">{t("barcaScorers")}</label>
              <input value={sc} onChange={(e) => setSc(e.target.value)} placeholder="Lamine Yamal, Raphinha" />
              <button className="btn" style={{ marginTop: 14 }} onClick={() => {
                saveResult(fx.id, { h: mh, a: ma, status: "finished", scorers: sc.split(",").map((x) => x.trim()).filter(Boolean) });
                flash(t("resultSaved"));
              }}>{t("saveFullTime")}</button>
            </>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}

/* ============================ table ============================ */
/* Opening zoom: shows once per app launch, then hands over to the UI. */
function Splash() {
  const [gone, setGone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGone(true), 1600); return () => clearTimeout(t); }, []);
  if (gone) return null;
  return (
    <div className="bm-splash" aria-hidden="true">
      <img className="bm-splash-crest" src="/assets/teams/barcelona.png" alt="" />
      <div className="bm-splash-word"><span className="wm-a">Barca</span><span className="wm-b">Manyak</span></div>
    </div>
  );
}

function SideBetsView({ me, users, bets, saveSideBets }) {
  const { lang, t } = useI18n();
  const mine = bets[me.id]?.side || {};
  const open = sideBetsOpen();
  const [draft, setDraft] = useState(mine);
  const answered = SIDE_BETS.filter((b) => draft[b.id]).length;
  const dirty = SIDE_BETS.some((b) => (draft[b.id] || null) !== (mine[b.id] || null));
  const label = (o) => (lang === "he" ? o.he : o.en);
  const sideDeadline = computeSideDeadline();
  const deadline = sideDeadline == null ? "" : new Date(sideDeadline).toLocaleDateString(lang === "he" ? "he-IL" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="wrap">
      <div className="card">
        <div className="eyebrow">{t("sideBets")}</div>
        <h3 style={{ fontSize: 22, marginTop: 4 }}>{SIDE_TOTAL} {t("pointsWord")}</h3>
        <p className="note" style={{ marginTop: 8 }}>{t("sideBetsIntro")}</p>
        <div className={`side-status ${open ? "" : "shut"}`}>
          {open ? `${t("closesOn")} ${deadline} · ${answered}/${SIDE_BETS.length}` : t("sideBetsClosed")}
        </div>
      </div>

      {SIDE_BETS.map((bet) => {
        const chosen = draft[bet.id] || null;
        const withPhotos = bet.options.some((o) => o.photo);
        return (
          <div className="card" key={bet.id}>
            <div className="row" style={{ alignItems: "center", gap: 10 }}>
              {bet.icon && <img className="side-icon" src={bet.icon} alt="" />}
              <div className="side-q">{lang === "he" ? bet.he : bet.en}</div>
              <span className="side-pts mono">{bet.pts} {t("ptsShort")}</span>
            </div>
            <div className={withPhotos ? `side-faces${bet.options.length > 2 ? " side-faces-grid" : ""}` : "side-opts"}>
              {bet.options.map((o) => {
                const on = chosen === o.id;
                return (
                  <button key={o.id} disabled={!open}
                    className={`${withPhotos ? "side-face" : "side-opt"} ${on ? "on" : ""}`}
                    onClick={() => setDraft((d) => ({ ...d, [bet.id]: on ? null : o.id }))}
                    aria-pressed={on}>
                    {o.photo && <img src={o.photo} alt="" />}
                    {withPhotos && !o.photo && <span className="side-noface">{label(o).slice(0, 1)}</span>}
                    <span>{label(o)}</span>
                    {!!o.bonus && <>{" "}<span className="opt-bonus mono">+{o.bonus}</span></>}
                  </button>
                );
              })}
            </div>
            {/* once the deadline passes, everyone's picks are public */}
            {!open && (() => {
              const players = users.filter((u) => !u.isBot);
              const silent = players.filter((u) => !bets[u.id]?.side?.[bet.id]);
              return (
                <div className="side-reveal">
                  {bet.options.map((o) => {
                    const voters = players.filter((u) => bets[u.id]?.side?.[bet.id] === o.id);
                    if (!voters.length) return null;
                    return (
                      <div className="side-reveal-row" key={o.id}>
                        <span className="side-reveal-opt">{label(o)}</span>
                        <div className="side-voters">
                          {voters.map((u) => (
                            <span className="side-voter" key={u.id}>
                              <Avatar user={u} size="xs" />{u.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {silent.length > 0 && (
                    <div className="side-reveal-row muted">
                      <span className="side-reveal-opt">{t("didNotAnswer")}</span>
                      <div className="side-voters">
                        {silent.map((u) => (
                          <span className="side-voter" key={u.id}><Avatar user={u} size="xs" />{u.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })}

      {open && (
        <div className="side-save">
          <button className="btn" disabled={!dirty} onClick={() => saveSideBets(draft)}>
            {dirty ? t("saveSideBets") : t("allSaved")}
          </button>
          <p className="note" style={{ marginTop: 8 }}>{t("sideBetsEditable")}</p>
        </div>
      )}

      <div className="card">
        <div className="eyebrow">{t("whoPicked")}</div>
        <div style={{ marginTop: 8 }}>
          {users.filter((u) => !u.isBot).map((u) => {
            const n = SIDE_BETS.filter((b) => bets[u.id]?.side?.[b.id]).length;
            return (
              <div className="frow" key={u.id}>
                <Avatar user={u} size="s" />
                <div className="grow"><div className="nm">{u.name}</div></div>
                <span className={`tag ${n === SIDE_BETS.length ? "in" : n ? "" : "out"}`}>{n}/{SIDE_BETS.length}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TableView({ standings, fixtures, results, users, bets, liveFx, betFor }) {
  const { lang, t } = useI18n();
  const [showHistory, setShowHistory] = useState(false);
  const played = fixtures.filter((f) => results[f.id]?.h != null && results[f.id]?.status !== "live").length;
  /* Once a match is under way, shame anyone who never got a bet in for it. */
  const shirkers = useMemo(() => {
    if (!liveFx) return new Set();
    const out = new Set();
    users.forEach((u) => { if (!u.isBot && !bets?.[u.id]?.games?.[liveFx.id]) out.add(u.id); });
    return out;
  }, [liveFx, users, bets]);
  return (
    <div className="wrap">
      <div className="card">
        <div className="row" style={{ alignItems: "center" }}>
          <div className="eyebrow">{t("standings")}</div>
          {liveFx && <span className="comp-chip live-chip" style={{ marginInlineStart: "auto" }}><span className="dot" />{t("live")}</span>}
        </div>
        <h3 style={{ fontSize: 22, marginTop: 4 }}>{played} {t("gamesScored")}</h3>
        {liveFx && <p className="note" style={{ marginTop: 6 }}>{t("liveTableNote")}</p>}
        <div style={{ marginTop: 12 }}>
          {standings.map((r, i) => (
            <div className={`frow${r.armed ? " armed" : ""}`} key={r.u.id}>
              <span className={`rank mono ${i === 0 ? "medal" : ""}`}>{i + 1}</span>
              <Avatar user={r.u} size="m" />
              <div className="grow">
                <div className="nm">{r.u.name}{r.u.isBot ? " 🐵" : ""}</div>
                {shirkers.has(r.u.id) && <span className="monkey-tag">{t("monkeyLike")}</span>}
                <div className="sub mono">{lang === "he" ? `${r.exact} תוצאות · ${r.direction} כיוון · ${r.hits}⚽ · ${r.assists}🅰️` : `${r.exact} exact · ${r.direction} dir · ${r.hits}⚽ · ${r.assists}🅰️`}{r.doubledGames ? ` · ${r.doubledGames}×2` : ""}{r.seasonPts ? ` · +${r.seasonPts} ${lang === "he" ? "עונתי" : "season"}` : ""}{r.sidePts ? ` · +${fmtPts(r.sidePts)} ${lang === "he" ? "צד" : "side"}` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="pts mono">{fmtPts(r.pts)}</span>
                {r.armed && <div className="dd-badge">×2 {t("armed")}</div>}
              </div>
            </div>
          ))}
        </div>
        <button className="btn ghost" style={{ marginTop: 14, width: "100%" }} onClick={() => setShowHistory(true)}>{t("betHistory")}</button>
      </div>
      <div className="card">
        <div className="eyebrow">{t("seasonalBets")}</div>
        <div style={{ marginTop: 8 }}>
          {users.filter((u) => !u.isBot).map((u) => {
            const s = bets[u.id]?.season || {};
            return (
              <div className="frow" key={u.id}>
                <Avatar user={u} size="s" />
                <div className="grow"><div className="nm">{u.name}</div>
                  <div className="sub">{s.scorer ? `⚽ ${playerLabel(s.scorer, lang)} · 🅰️ ${playerLabel(s.assister, lang)}` : t("hasntCalled")}</div></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <div className="eyebrow">{t("rules")}</div>
        <div className="rules">
          <div><b>{t("exactScore")}</b><i></i><span className="mono">{t("points3")}</span></div>
          <div><b>{t("rightDirection")}</b><i></i><span className="mono">{t("points1")}</span></div>
          <div><b>{t("bonusScorer")}</b><i></i><span className="mono">{t("points1")}</span></div>
          <div><b>{t("bonusAssist")}</b><i></i><span className="mono">{t("pointsHalf")}</span></div>
          <div><b>{t("seasonalScorer")}</b><i></i><span className="mono">{t("points10")}</span></div>
          <div><b>{t("seasonalAssister")}</b><i></i><span className="mono">{t("points10")}</span></div>
          <div><b>{t("finalScoreRule")}</b><i></i><span style={{ fontSize: 11.5, whiteSpace: "normal", textAlign: "end" }}>{t("finalScoreRuleText")}</span></div>
          <div><b>{t("betDeadlineRule")}</b><i></i><span style={{ fontSize: 11.5, whiteSpace: "normal", textAlign: "end" }}>{t("betDeadlineRuleText")}</span></div>
          <div><b>{t("doublePointsRule")}</b><i></i><span style={{ fontSize: 11.5, whiteSpace: "normal", textAlign: "end" }}>{t("doublePointsRuleText")}</span></div>
        </div>
        <div className="dd-box">
          <div className="dd-title">🔥 {t("doubleDown")}</div>
          <p>{t("doubleDownText")}</p>
        </div>
        <p className="note" style={{ marginTop: 14 }}>{t("monkeyRule")}</p>
      </div>
      {showHistory && <BetHistorySheet fixtures={fixtures} results={results} users={users} betFor={betFor} onClose={() => setShowHistory(false)} />}
    </div>
  );
}

/* ============================ bet history (every game played so far) ============================ */
function BetHistorySheet({ fixtures, results, users, betFor, onClose }) {
  const { lang, t } = useI18n();
  const played = [...fixtures]
    .filter((f) => results[f.id]?.h != null && results[f.id]?.status !== "live")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Portal>
      <div className="scrim" onClick={onClose}>
        <div className="sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-head">
            <h3 style={{ fontSize: 19 }}>{t("betHistory")}</h3>
            <button className="x" onClick={onClose}>✕</button>
          </div>
          {!played.length && <p className="note" style={{ marginTop: 12 }}>{t("noGamesYet")}</p>}
          {played.map((f) => {
            const r = results[f.id];
            const s = sides(f);
            return (
              <div className="card" key={f.id} style={{ marginTop: 12 }}>
                <div className="nm">{teamLabel(s.home, lang)} <span className="mono">{r.h}–{r.a}</span> {teamLabel(s.away, lang)}</div>
                <div className="sub">{compLabel(f.comp, lang)}{f.round ? ` · ${f.round}` : ""} · {fmtKO(f)}</div>
                <div style={{ marginTop: 8 }}>
                  {users.map((u) => {
                    const ub = betFor(u.id, f);
                    const us = ub ? scoreBet(ub, r, false, isDoublePointsFixture(f)) : null;
                    return (
                      <div className="frow" key={u.id} style={{ padding: "6px 0" }}>
                        <Avatar user={u} size="xs" />
                        <div className="grow">
                          <div className="nm" style={{ fontSize: 13 }}>{u.name}{u.isBot ? " 🐵" : ""}</div>
                          <div className="sub">{ub ? (ub.scorer ? playerLabel(ub.scorer, lang) : t("noScorer")) : t("noBet")}</div>
                        </div>
                        {ub && <span className="score-pill mono" style={{ fontSize: 13 }}>{ub.h}–{ub.a}</span>}
                        {us && <span className="mono" style={{ fontSize: 14, color: us.pts ? "var(--win)" : "var(--bone-dim)", marginInlineStart: 8 }}>{fmtPts(us.pts)}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Portal>
  );
}

/* ============================ season bets (inside Me) ============================ */
function SeasonBets({ myBets, saveSeason, users, bets, seasonRes, setSeasonRes, flash, devUnlocked }) {
  const { lang, t } = useI18n();
  const { squad } = useFootball();
  const sb = myBets.season || {};
  const isLocked = !!sb.lockedAt;
  const [scorer, setScorer] = useState(sb.scorer || null);
  const [assister, setAssister] = useState(sb.assister || null);
  const [picking, setPicking] = useState(null);
  const [busy, setBusy] = useState(false);

  const pullLive = async () => {
    setBusy(true);
    try {
      const j = await askClaude(
        `Search the web for FC Barcelona's current top goalscorer and top assist provider across all competitions in the 2026/27 season. ` +
        `Return ONLY JSON: {"topScorer":"name","goals":0,"topAssister":"name","assists":0,"asOf":"YYYY-MM-DD"}.`
      );
      setSeasonRes(j); await sset(K.season, j);
      flash(`${t("leading")}: ${j.topScorer} (${j.goals}), ${j.topAssister} (${j.assists} ${t("assistsWord")}).`);
    } catch { flash(t("seasonStatsError")); }
    setBusy(false);
  };

  return (
    <>
      <div className="card">
        <div className="eyebrow">{t("seasonCalls")}</div>
        <h3 style={{ fontSize: 22, marginTop: 6 }}>{t("seasonalChoices")}</h3>
        <p className="note" style={{ marginTop: 8 }}>{t("seasonIntro")}</p>
        <button className="btn ghost" style={{ marginTop: 16, justifyContent: "space-between" }} disabled={isLocked} onClick={() => setPicking("scorer")}>
          <span>{scorer ? `⚽ ${playerLabel(scorer, lang)}` : `⚽ ${t("topGoalscorer")}`}</span><span style={{ color: "var(--bone-dim)" }}>{isLocked ? "🔒" : "›"}</span>
        </button>
        <button className="btn ghost" style={{ marginTop: 10, justifyContent: "space-between" }} disabled={isLocked} onClick={() => setPicking("assister")}>
          <span>{assister ? `🅰️ ${playerLabel(assister, lang)}` : `🅰️ ${t("topAssist")}`}</span><span style={{ color: "var(--bone-dim)" }}>{isLocked ? "🔒" : "›"}</span>
        </button>
        {!isLocked ? (
          <>
            <button className="btn" style={{ marginTop: 14 }} disabled={!scorer || !assister} onClick={() => saveSeason({ scorer, assister })}>{t("lockBoth")}</button>
            <p className="warn" style={{ marginTop: 12 }}>{t("noEdits")}</p>
          </>
        ) : <p className="note" style={{ marginTop: 14 }}>{t("locked")} {new Date(sb.lockedAt).toLocaleDateString(lang === "he" ? "he-IL" : undefined)}.</p>}
      </div>

      <div className="card">
        <div className="row" style={{ alignItems: "center" }}>
          <div className="eyebrow">{t("whereStands")}</div>
          {devUnlocked && (
            <button className="btn ghost sm" style={{ marginInlineStart: "auto" }} disabled={busy} onClick={pullLive}>{busy ? <span className="spin" /> : t("checkOnline")}</button>
          )}
        </div>
        <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.9 }}>
          <div>{t("topScorer")}: <b>{seasonRes.topScorer ? playerLabel(seasonRes.topScorer, lang) : t("none")}</b>{seasonRes.goals != null ? ` (${seasonRes.goals})` : ""}</div>
          <div>{t("topAssists")}: <b>{seasonRes.topAssister ? playerLabel(seasonRes.topAssister, lang) : t("none")}</b>{seasonRes.assists != null ? ` (${seasonRes.assists})` : ""}</div>
        </div>
        <p className="note" style={{ marginTop: 8 }}>{t("seasonPointsNote")}</p>
      </div>

      {picking && (
        <Portal>
        <div className="scrim" onClick={() => setPicking(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <h3 style={{ fontSize: 19 }}>{picking === "scorer" ? t("topGoalscorer") : t("topAssist")}</h3>
              <button className="x" onClick={() => setPicking(null)} aria-label={t("close")}>×</button>
            </div>
            <div className="pick-list">
              {squad.map((p) => {
                const cur = picking === "scorer" ? scorer : assister;
                return (
                  <button key={p.name} className={`pick ${cur === p.name ? "on" : ""}`}
                    onClick={() => { picking === "scorer" ? setScorer(p.name) : setAssister(p.name); setPicking(null); }}>
                    {p.photo ? <img className="player-photo" src={p.photo} alt="" /> : <span className="num mono">{p.n ?? "–"}</span>}
                    <span>{playerLabel(p.name, lang)}</span><span className="pos">{p.pos}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}

/* ============================ badge row ============================ */
/* ---------------- badge file helpers ---------------- */
const TEAM_ALIASES = {
  "Barcelona": ["fcbarcelona", "barcelona", "barca"],
  "Real Madrid": ["realmadridcf", "realmadrid", "madridcf"],
  "Atlético Madrid": ["clubatleticodemadrid", "atleticodemadrid", "atleticomadrid", "atletico"],
  "Athletic Club": ["athleticbilbao", "athleticclub", "athletic"],
  "Elche": ["elchecf", "elche"],
  "Rayo Vallecano": ["rayovallecano", "rayo"],
  "Valencia": ["valenciacf", "valencia"],
  "Levante": ["levanteud", "levante"],
  "Racing Santander": ["realracingclubdesantander", "racingsantander", "racingdesantander", "racing"],
  "Sevilla": ["sevillafc", "sevilla"],
  "Getafe": ["getafecf", "getafe"],
  "Real Betis": ["realbetisbalompie", "realbetis", "betis"],
  "Deportivo Alavés": ["deportivoalaves", "alaves"],
  "Villarreal": ["villarrealcf", "villarreal"],
  "Deportivo La Coruña": ["rcdeportivodelacoruna", "deportivolacoruna", "lacoruna", "coruna"],
  "Celta Vigo": ["rcceltadevigo", "celtadevigo", "celtavigo", "celta"],
  "Málaga": ["malagacf", "malaga"],
  "Real Sociedad": ["realsociedaddefutbol", "realsociedad"],
  "Espanyol": ["rcdespanyol", "espanyol"],
  "Osasuna": ["caosasuna", "osasuna"],
  "Paris Saint-Germain": ["parissaintgermain", "parissg", "psg"],
  "Manchester City": ["manchestercity", "mancity", "mcfc"],
  "Liverpool": ["liverpoolfc", "liverpool"],
  "Newcastle United": ["newcastleunited", "newcastle", "nufc"],
  "Tottenham Hotspur": ["tottenhamhotspur", "tottenham", "spurs"],
  "Inter Milan": ["internazionale", "intermilan", "interfc", "inter"],
  "Juventus": ["juventusfc", "juventus", "juve"],
  "Napoli": ["sscnapoli", "napoli"],
  "Marseille": ["olympiquedemarseille", "olympiquemarseille", "marseille"],
  "PSV Eindhoven": ["psveindhoven", "psv"],
  "Sporting CP": ["sportingclubedeportugal", "sportinglisbon", "sportingcp", "sporting"],
  "Olympiacos": ["olympiacospiraeus", "olympiacos", "olympiakos"],
  "Galatasaray": ["galatasarayspor", "galatasaray", "gala"],
  "Slavia Praha": ["skslaviapraha", "slaviaprague", "slaviapraha", "slavia"],
  "Union Saint-Gilloise": ["royaleunionsaintgilloise", "unionsaintgilloise", "unionsg", "usg"],
  "Qarabağ": ["qarabagfk", "qarabag"],
  "Pafos": ["pafosfc", "pafos"],
  "Kairat": ["kairatalmaty", "kairat"],
  "Arsenal": ["arsenalfc", "arsenal"],
  "Chelsea": ["chelseafc", "chelsea"],
  "Bayern München": ["fcbayernmunchen", "bayernmunchen", "bayernmunich", "bayern"],
  "Bayer Leverkusen": ["bayerleverkusen", "leverkusen"],
  "Borussia Dortmund": ["borussiadortmund", "dortmund", "bvb"],
  "Eintracht Frankfurt": ["eintrachtfrankfurt", "eintracht", "frankfurt"],
  "Atalanta": ["atalantabc", "atalanta"],
  "AS Monaco": ["asmonaco", "monaco"],
  "Ajax": ["afcajax", "ajax"],
  "Benfica": ["slbenfica", "benfica"],
  "Club Brugge": ["clubbruggekv", "clubbrugge", "brugge"],
  "FC Copenhagen": ["fckobenhavn", "kobenhavn", "kbenhavn", "copenhagen", "kopenhagen"],
  "Bodø/Glimt": ["bodoglimt", "bodglimt", "glimt"],
};
const normKey = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");

/* match a filename to a team by the longest alias it contains */
function teamFromFilename(filename) {
  const f = normKey(filename.replace(/\.[a-z0-9]+$/i, ""));
  let best = null, bestLen = 0;
  Object.entries(TEAM_ALIASES).forEach(([team, aliases]) => {
    aliases.forEach((al) => {
      if (f.includes(al) && al.length > bestLen) { best = team; bestLen = al.length; }
    });
  });
  return best;
}

/* read an image file into a small data URL (SVG kept as-is, rasters shrunk to 96px) */
function imageFileToDataURL(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 4_000_000) { reject(new Error("too big")); return; }
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("read failed"));
    fr.onload = () => {
      const raw = fr.result;
      if (file.type === "image/svg+xml" || file.size < 60_000) { resolve(raw); return; }
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas"); c.width = c.height = 96;
        const ctx = c.getContext("2d");
        const s = Math.max(img.width, img.height);
        const w = (img.width / s) * 96, h = (img.height / s) * 96;
        ctx.drawImage(img, (96 - w) / 2, (96 - h) / 2, w, h);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("decode failed"));
      img.src = raw;
    };
    fr.readAsDataURL(file);
  });
}

/* ============================ bulk badge upload ============================ */
function MeView({ me, updateMe, users, standings, flash, myBets, saveSeason, bets, seasonRes, setSeasonRes, onSwitchUser, devUnlocked, onDevUnlock, onOpenDev, onLockDev }) {
  const { lang, t } = useI18n();
  const [name, setName] = useState(me.name);
  const [editingName, setEditingName] = useState(false);
  const [pic, setPic] = useState(me.pic || null);
  const [showPhotos, setShowPhotos] = useState(false);
  const [askingPassword, setAskingPassword] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const fileRef = useRef();
  const mine = standings.find((s) => s.u.id === me.id);

  const submitPassword = () => {
    if (pwd === DEV_PASSWORD) { setAskingPassword(false); setPwd(""); setPwdError(false); onDevUnlock(); onOpenDev(); }
    else { setPwdError(true); }
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas"); c.width = c.height = 160;
          const ctx = c.getContext("2d"); const sq = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width - sq) / 2, (img.height - sq) / 2, sq, sq, 0, 0, 160, 160);
          const out = c.toDataURL("image/jpeg", 0.72);
          setPic(out); updateMe({ pic: out }); flash(t("photoUpdated"));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    } catch { flash(lang === "he" ? "לא הצלחנו לקרוא את התמונה." : "Couldn't read that image."); }
    e.target.value = "";
  };

  return (
    <div className="wrap">
      <div className="card">
        <div className="row" style={{ alignItems: "center", gap: 14 }}>
          <div className="av-edit">
            <Avatar user={{ ...me, pic }} size="l" />
            <button className="pen" onClick={() => setShowPhotos((value) => !value)} aria-label={t("changePhoto")}>
              <Ico d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
          </div>
          <div className="grow">
            {editingName ? (
              <div className="row" style={{ alignItems: "center" }}>
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { updateMe({ name: name.trim() || me.name }); setEditingName(false); flash(t("nameUpdated")); }
                    if (e.key === "Escape") { setName(me.name); setEditingName(false); }
                  }} aria-label={t("editName")} />
                <button className="name-edit" onClick={() => { updateMe({ name: name.trim() || me.name }); setEditingName(false); flash(t("nameUpdated")); }} aria-label={t("saveName")}>✓</button>
                <button className="name-edit" onClick={() => { setName(me.name); setEditingName(false); }} aria-label={t("cancel")}>×</button>
              </div>
            ) : (
              <div className="row" style={{ alignItems: "center", gap: 8 }}>
                <h3 style={{ fontSize: 24 }}>{name || me.name}</h3>
                <button className="name-edit" onClick={() => setEditingName(true)} aria-label={t("editName")}>
                  <Ico d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </button>
              </div>
            )}
            <div className="sub mono">{mine ? (lang === "he" ? `${fmtPts(mine.pts)} נק׳ · ${mine.exact} תוצאות · ${mine.hits} כובשים` : `${fmtPts(mine.pts)} pts · ${mine.exact} exact · ${mine.hits} scorers`) : t("noPoints")}</div>
          </div>
        </div>
        {showPhotos && (
          <div className="avatar-panel">
            <PresetPhotos pic={pic} onPic={(nextPic) => { setPic(nextPic); updateMe({ pic: nextPic }); flash(t("photoUpdated")); }} />
            <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => fileRef.current?.click()}>{t("uploadYourOwn")}</button>
            {pic && <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => { setPic(null); updateMe({ pic: null }); flash(t("photoUpdated")); }}>{t("remove")}</button>}
          </div>
        )}
        <button className="btn ghost" style={{ marginTop: 14 }} onClick={onSwitchUser}>{t("switchUser")}</button>
      </div>

      <SeasonBets {...{ myBets, saveSeason, users, bets, seasonRes, setSeasonRes, flash, devUnlocked }} />

      <div className="card">
        <div className="eyebrow">{t("theLeague")}</div>
        <div style={{ marginTop: 8 }}>
          {users.map((u) => (
            <div className="frow" key={u.id}>
              <Avatar user={u} size="s" />
              <div className="grow"><div className="nm">{u.name}{u.id === me.id ? " (you)" : ""}</div></div>
              {u.isBot && <span className="tag monkey">{t("bot")}</span>}
            </div>
          ))}
        </div>
        <p className="note" style={{ marginTop: 12 }}>{t("shareNote")}</p>
      </div>

      <div className="card">
        {devUnlocked ? (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }} onClick={onOpenDev}>{t("openDevPanel")}</button>
            <button className="btn ghost sm" onClick={onLockDev}>{t("lockDev")}</button>
          </div>
        ) : (
          <button className="btn ghost" style={{ width: "100%" }} onClick={() => { setAskingPassword(true); setPwd(""); setPwdError(false); }}>{t("devMode")}</button>
        )}
      </div>

      {askingPassword && (
        <Portal>
        <div className="scrim" onClick={() => setAskingPassword(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <h3 style={{ fontSize: 19 }}>{t("devMode")}</h3>
              <button className="x" onClick={() => setAskingPassword(false)} aria-label={t("close")}>×</button>
            </div>
            <label className="fl">{t("enterPassword")}</label>
            <input
              type="password" autoFocus inputMode="numeric" value={pwd}
              onChange={(e) => { setPwd(e.target.value); setPwdError(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") submitPassword(); }}
            />
            {pwdError && <p className="warn" style={{ marginTop: 8 }}>{t("wrongPassword")}</p>}
            <button className="btn" style={{ marginTop: 14 }} onClick={submitPassword}>{t("unlock")}</button>
          </div>
        </div>
        </Portal>
      )}

    </div>
  );
}

/* ============================ dev mode (password-gated admin) ============================ */
function DevPanel({ onClose, users, bets, sideRes, saveSideResults, adminUpdateUser, adminDeleteUser, adminSeedRandomBets, fixtures, saveFixture, badges, flash }) {
  const { lang, t } = useI18n();
  const [section, setSection] = useState("side");
  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "88vh", overflowY: "auto" }}>
        <div className="sheet-head">
          <h3 style={{ fontSize: 19 }}>{t("devMode")}</h3>
          <button className="x" onClick={onClose} aria-label={t("close")}>×</button>
        </div>
        <div className="seg">
          <button className={section === "side" ? "on" : ""} onClick={() => setSection("side")}><span>{t("devSideBets")}</span></button>
          <button className={section === "users" ? "on" : ""} onClick={() => setSection("users")}><span>{t("devUsers")}</span></button>
          <button className={section === "fixtures" ? "on" : ""} onClick={() => setSection("fixtures")}><span>{t("devFixtures")}</span></button>
        </div>
        {section === "side" && <DevSideBets {...{ users, bets, sideRes, saveSideResults, flash }} />}
        {section === "users" && <DevUsers {...{ users, adminUpdateUser, adminDeleteUser, adminSeedRandomBets, flash }} />}
        {section === "fixtures" && <DevFixtures {...{ fixtures, saveFixture, badges, flash }} />}
      </div>
    </div>
    </Portal>
  );
}

function DevSideBets({ users, bets, sideRes, saveSideResults, flash }) {
  const { lang, t } = useI18n();
  const players = users.filter((u) => !u.isBot);
  const closed = Object.keys(sideRes || {}).length;
  return (
    <div style={{ marginTop: 14 }}>
      <p className="note">{t("devSideBetsIntro")} · {closed}/{SIDE_BETS.length} {t("devClosed")}</p>
      {SIDE_BETS.map((bet) => {
        const current = sideRes[bet.id] || null;
        const tally = bet.options.map((o) => ({ o, n: players.filter((u) => bets[u.id]?.side?.[bet.id] === o.id).length }));
        return (
          <div className="card" key={bet.id} style={{ marginTop: 10 }}>
            <div className="eyebrow">{lang === "he" ? bet.he : bet.en} <span className="mono">· {bet.pts}pt</span></div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tally.map(({ o, n }) => (
                <button
                  key={o.id}
                  className={`btn sm ${current === o.id ? "gold" : "ghost"}`}
                  onClick={async () => { await saveSideResults({ [bet.id]: o.id }); flash(t("devOutcomeSaved")); }}
                >
                  {lang === "he" ? o.he : o.en} <span className="mono">({n})</span>
                </button>
              ))}
              {current && (
                <button className="btn ghost sm" onClick={async () => { await saveSideResults({ [bet.id]: null }); flash(t("devOutcomeCleared")); }}>
                  {t("devClearOutcome")}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DevUsers({ users, adminUpdateUser, adminDeleteUser, adminSeedRandomBets, flash }) {
  const { t } = useI18n();
  const [drafts, setDrafts] = useState({});
  const [confirming, setConfirming] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const people = users.filter((u) => !u.isBot);
  return (
    <div style={{ marginTop: 14 }}>
      <div className="card">
        <div className="eyebrow">{t("devSeedTitle")}</div>
        <p className="note" style={{ marginTop: 8 }}>{t("devSeedNote")}</p>
        <button className="btn ghost" style={{ marginTop: 12 }} disabled={seeding}
          onClick={async () => { setSeeding(true); await adminSeedRandomBets(); setSeeding(false); flash(t("devSeedDone")); }}>
          {seeding ? <span className="spin" /> : t("devSeedButton")}
        </button>
      </div>
      {people.map((u) => {
        const draft = drafts[u.id] ?? u.name;
        const dirty = draft !== u.name;
        return (
          <div className="card" key={u.id} style={{ marginTop: 10 }}>
            <div className="row" style={{ alignItems: "center", gap: 10 }}>
              <Avatar user={u} size="s" />
              <input
                style={{ flex: 1 }}
                value={draft}
                onChange={(e) => setDrafts((d) => ({ ...d, [u.id]: e.target.value }))}
              />
            </div>
            <div className="row" style={{ marginTop: 10, gap: 8 }}>
              <button
                className="btn ghost sm" disabled={!dirty}
                onClick={async () => { await adminUpdateUser(u.id, { name: draft.trim() || u.name }); flash(t("devUserSaved")); }}
              >{t("save")}</button>
              {confirming === u.id ? (
                <>
                  <button className="btn sm" style={{ background: "var(--loss, #b33)", color: "#fff" }}
                    onClick={async () => { await adminDeleteUser(u.id); flash(t("devUserDeleted")); }}>
                    {t("devConfirmDelete")}
                  </button>
                  <button className="btn ghost sm" onClick={() => setConfirming(null)}>{t("cancel")}</button>
                </>
              ) : (
                <button className="btn ghost sm" style={{ marginInlineStart: "auto" }} onClick={() => setConfirming(u.id)}>{t("devDeleteUser")}</button>
              )}
            </div>
          </div>
        );
      })}
      {!people.length && <p className="note" style={{ marginTop: 8 }}>{t("devNoUsers")}</p>}
    </div>
  );
}

function DevFixtures({ fixtures, saveFixture, badges, flash }) {
  const { lang, t } = useI18n();
  const [comp, setComp] = useState("All");
  const [drafts, setDrafts] = useState({});
  const comps = ["All", ...Array.from(new Set(fixtures.map((f) => f.comp)))];
  const list = fixtures.filter((f) => comp === "All" || f.comp === comp);
  const draftFor = (f) => drafts[f.id] || { date: f.date, time: f.time || "21:00", opp: f.opp, apiId: f.apiId ? String(f.apiId) : "" };
  const setDraft = (f, patch) => setDrafts((d) => ({ ...d, [f.id]: { ...draftFor(f), ...patch } }));
  return (
    <div style={{ marginTop: 14 }}>
      <div className="row" style={{ overflowX: "auto", paddingBottom: 4 }}>
        {comps.map((c) => (
          <button key={c} className={`btn sm ${comp === c ? "gold" : "ghost"}`} style={{ flex: "none" }} onClick={() => setComp(c)}>{c === "All" ? t("all") : compLabel(c, lang)}</button>
        ))}
      </div>
      {list.map((f) => {
        const d = draftFor(f);
        const dirty = d.date !== f.date || d.time !== (f.time || "21:00") || d.opp !== f.opp || d.apiId !== (f.apiId ? String(f.apiId) : "");
        return (
          <div className="card" key={f.id} style={{ marginTop: 10 }}>
            <div className="row" style={{ alignItems: "center", gap: 8 }}>
              <Badge team={f.opp} size={22} badges={badges} />
              <div className="sub">{compLabel(f.comp, lang)}{f.round ? ` · ${f.round}` : ""}</div>
            </div>
            <label className="fl">{t("devOpponent")}</label>
            <input value={d.opp} onChange={(e) => setDraft(f, { opp: e.target.value })} />
            <div className="row" style={{ marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <label className="fl">{t("devDate")}</label>
                <input type="date" value={d.date} onChange={(e) => setDraft(f, { date: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="fl">{t("devTime")}</label>
                <input type="time" value={d.time} onChange={(e) => setDraft(f, { time: e.target.value })} />
              </div>
            </div>
            <label className="fl" style={{ marginTop: 8 }}>{t("devApiId")}</label>
            <input value={d.apiId} placeholder="sdb:2549460" onChange={(e) => setDraft(f, { apiId: e.target.value })} />
            <p className="note" style={{ marginTop: 4 }}>{t("devApiIdHint")}</p>
            <button
              className="btn" style={{ marginTop: 12 }} disabled={!dirty}
              onClick={async () => {
                const trimmed = d.apiId.trim();
                await saveFixture(f.id, { date: d.date, time: d.time, opp: d.opp, tbd: false, apiId: trimmed || undefined });
                flash(t("devFixtureSaved"));
              }}
            >{t("save")}</button>
          </div>
        );
      })}
    </div>
  );
}
