import { google } from "googleapis";

/**
 * Fetch only new unread Gmail messages
 * @param {Array} existingNotifications - current notifications
 * @param {Set} seenMessageIds - Set of message IDs already processed
 * @param {google.auth.OAuth2} auth - authenticated OAuth2 client
 * @returns {Promise<{notifications: Array, seenMessageIds: Set}>}
 */
export async function fetchNewGmailNotifications(existingNotifications, seenMessageIds, auth) {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: 10, // optional limit
    });

    if (!res.data.messages || res.data.messages.length === 0) {
      return { notifications: existingNotifications, seenMessageIds };
    }

    const newNotifications = [];

    for (const msg of res.data.messages) {
      if (seenMessageIds.has(msg.id)) continue; // skip already seen

      const message = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From"],
      });

      const headers = message.data.payload.headers;
      const subject = headers.find(h => h.name === "Subject")?.value || "No Subject";
      const from = headers.find(h => h.name === "From")?.value || "Unknown";

      newNotifications.push({
        type: "email",
        unread: true,
        subject,
        from,
        link: "https://mail.google.com/mail/u/0/#inbox",
        message: `New email from ${from}: ${subject}`,
      });

      seenMessageIds.add(msg.id); // mark as seen
    }

    return {
      notifications: [...existingNotifications, ...newNotifications],
      seenMessageIds,
    };
  } catch (err) {
    console.error("Failed to fetch Gmail notifications:", err);
    return { notifications: existingNotifications, seenMessageIds };
  }
}
