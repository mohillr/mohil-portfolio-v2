window.MESSAGE_VIEWER_CONFIG = {
  provider: "supabase",

  // Supabase setup:
  supabase: {
    url: "https://ipfxklpmfzmkrbsfluig.supabase.co",
    anonKey: "sb_publishable_sF3CDeHMtqLudsl1cVW1Nw_JhwxX3L-",
    table: "messages"
  },

  fields: {
    id: "id",
    name: "name",
    email: "email",
    message: "message"
  }
};
