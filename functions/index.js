const admin = require("firebase-admin");
const functions = require("firebase-functions/v2");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.database();

const MINUTES_BEFORE = 60; // Send 1 hour before prayer
const CHECK_WINDOW_MIN = 5; // Allow 5-minute margin
const USERS_PATH = "/users";

// --------------------------- Helpers ----------------------------------------

function toTodayDate(timeHHMM) {
  const [h, m] = String(timeHHMM).split(":").map((x) => parseInt(x, 10));
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function isWithinWindow(now, target, windowMin) {
  const diffMin = Math.abs((now - target) / 60000);
  return diffMin < windowMin;
}

async function fetchTodaysPrayerTimes(city, country) {
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
    city
  )}&country=${encodeURIComponent(country)}&method=2`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Aladhan API ${res.status}`);
  const data = await res.json();
  const t = data?.data?.timings || {};
  return {
    Fajr: t.Fajr,
    Dhuhr: t.Dhuhr,
    Asr: t.Asr,
    Maghrib: t.Maghrib,
    Isha: t.Isha,
  };
}

// Send notification safely with cleanup on failure
async function sendNotification(uid, token, title, body) {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data: { type: "prayer_reminder" },
    });
    functions.logger.info(`✅ Sent to ${uid} (${token.slice(0, 12)}...)`);
    return true;
  } catch (err) {
    const code = err?.errorInfo?.code;
    if (
      code === "messaging/invalid-registration-token" ||
      code === "messaging/registration-token-not-registered"
    ) {
      await db.ref(`${USERS_PATH}/${uid}/fcmToken`).remove();
      functions.logger.warn(`🧹 Removed invalid token for user: ${uid}`);
    } else {
      functions.logger.error(`❌ Error sending to ${uid}:`, err.message);
    }
    return false;
  }
}

// --------------------------- Main Function ----------------------------------

exports.sendPersonalPrayerReminders = functions.scheduler.onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "UTC",
    region: "us-central1",
  },
  async () => {
    functions.logger.info("🕌 Checking prayer reminder window for all users...");

    const usersSnap = await db.ref(USERS_PATH).once("value");
    if (!usersSnap.exists()) {
      functions.logger.info("🙈 No users found in DB.");
      return;
    }

    const now = new Date();
    const users = usersSnap.val();
    let sentCount = 0;

    for (const [uid, user] of Object.entries(users)) {
      const { city, country, fcmToken } = user || {};
      if (!city || !country || !fcmToken) continue;

      try {
        const times = await fetchTodaysPrayerTimes(city, country);

        const schedule = Object.entries(times).map(([name, hhmm]) => {
          const at = toTodayDate(hhmm);
          const remindAt = new Date(at.getTime() - MINUTES_BEFORE * 60000);
          return { name, at, remindAt };
        });

        const due = schedule.filter((s) =>
          isWithinWindow(now, s.remindAt, CHECK_WINDOW_MIN)
        );

        if (due.length) {
          for (const d of due) {
            const title = `${d.name} Prayer Reminder`;
            const body = `🕌 ${d.name} is in ${MINUTES_BEFORE} minutes (${city}, ${country}).`;
            const ok = await sendNotification(uid, fcmToken, title, body);
            if (ok) sentCount++;
          }
        }
      } catch (err) {
        functions.logger.error(
          `⚠️ Error processing ${uid} (${city}, ${country}):`,
          err.message
        );
      }
    }

    functions.logger.info(`✅ Reminder cycle done. Sent ${sentCount} notifications.`);
  }
);
