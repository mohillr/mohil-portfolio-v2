const config = window.MESSAGE_VIEWER_CONFIG || {};
const list = document.querySelector("#messageList");
const statusPanel = document.querySelector("#statusPanel");
const setupNotice = document.querySelector("#setupNotice");
const refreshButton = document.querySelector("#refreshButton");
const searchInput = document.querySelector("#searchInput");
const count = document.querySelector("#messageCount");
const template = document.querySelector("#messageTemplate");

let messages = [];

const demoMessages = [
  {
    name: "Demo Visitor",
    email: "visitor@example.com",
    message: "Your real messages will appear here after you connect the database in config.js.",
    createdAt: new Date().toISOString()
  }
];

function field(row, key) {
  return row?.[config.fields?.[key] || key] || "";
}

function formatDate(value) {
  if (!value) return "";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function normalizeMessage(row) {
  return {
    name: field(row, "name") || "Unknown sender",
    email: field(row, "email"),
    message: field(row, "message") || "(No message text)",
    createdAt: field(row, "createdAt")
  };
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = messages.filter((item) => {
    const text = `${item.name} ${item.email} ${item.message}`.toLowerCase();
    return text.includes(query);
  });

  list.replaceChildren();
  count.textContent = filtered.length;

  if (!filtered.length) {
    statusPanel.classList.remove("hidden");
    statusPanel.textContent = query ? "No messages match your search." : "No messages found.";
    return;
  }

  statusPanel.classList.add("hidden");

  for (const item of filtered) {
    const card = template.content.firstElementChild.cloneNode(true);
    card.querySelector('[data-field="name"]').textContent = item.name;

    const email = card.querySelector('[data-field="email"]');
    email.textContent = item.email || "No email";
    if (item.email) email.href = `mailto:${item.email}`;

    card.querySelector('[data-field="createdAt"]').textContent = formatDate(item.createdAt);
    card.querySelector('[data-field="message"]').textContent = item.message;
    list.append(card);
  }
}

async function loadFirebaseMessages() {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const { getFirestore, collection, getDocs, orderBy, query } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
  const app = initializeApp(config.firebase);
  const db = getFirestore(app);
  const collectionName = config.firebase.collection || "messages";
  const createdAtField = config.fields?.createdAt || "createdAt";
  const snapshot = await getDocs(query(collection(db, collectionName), orderBy(createdAtField, "desc")));
  return snapshot.docs.map((doc) => normalizeMessage({ id: doc.id, ...doc.data() }));
}

async function loadSupabaseMessages() {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const client = createClient(config.supabase.url, config.supabase.anonKey);
  const table = config.supabase.table || "messages";
  let request = client.from(table).select("*");
  if (config.fields?.createdAt) {
    request = request.order(config.fields.createdAt, { ascending: false });
  }
  const { data, error } = await request;
  if (error) throw error;
  return data.map(normalizeMessage);
}

async function loadMessages() {
  refreshButton.disabled = true;
  statusPanel.classList.remove("hidden");
  statusPanel.textContent = "Loading messages...";

  try {
    if (config.provider === "firebase") {
      setupNotice.classList.add("hidden");
      messages = await loadFirebaseMessages();
    } else if (config.provider === "supabase") {
      setupNotice.classList.add("hidden");
      messages = await loadSupabaseMessages();
    } else {
      setupNotice.classList.remove("hidden");
      messages = demoMessages.map(normalizeMessage);
    }
    render();
  } catch (error) {
    messages = [];
    list.replaceChildren();
    count.textContent = "0";
    statusPanel.classList.remove("hidden");
    statusPanel.textContent = `Could not load messages: ${error.message}`;
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadMessages);
searchInput.addEventListener("input", render);

loadMessages();
