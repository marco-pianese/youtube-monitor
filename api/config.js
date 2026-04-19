export const DEFAULT_CHANNELS = [
  // --- ENABLED BY DEFAULT ---
  { id: "UCNp1e5n6rlnfm5aWbHe3cJw", handle: "TheBullPodcast",      name: "The Bull - Il tuo Podcast di Finanza Personale",  enabled: true  },
  { id: "UCngfIs8G9JHVTeyXPEyb_tQ", handle: "MarcoCasarioEXTRA",   name: "Marco Casario EXTRA",                             enabled: true  },
  { id: "UCsS30zeHypsxi6RBba_tNtw", handle: "justETFItalia",        name: "justETF Italia",                                  enabled: true  },
  { id: "UCx7EWheHmjCW3vX8K2d09vg", handle: "geopop",               name: "Geopop",                                          enabled: true  },
  { id: "UCZM5aON36Iw0o0ngTaQSWVA", handle: "willmedia",            name: "Will Media",                                      enabled: true  },
  { id: "UCoOae5nYA7VqaXzerajD0lg", handle: "aliabdaal",            name: "Ali Abdaal",                                      enabled: true  },
  { id: "UCUyDOdBWhC1MCxEjC46d-zw", handle: "AlexHormozi",          name: "Alex Hormozi",                                    enabled: true  },

  // --- DISABLED BY DEFAULT ---
  { id: "UCGq-a57w-aPwyi3pW7XLiHw", handle: "TheDiaryOfACEO",       name: "The Diary Of A CEO",                              enabled: false },
  { id: "UCXUPKJO5MZQN11PqgIvyuvQ", handle: "AndrejKarpathy",       name: "Andrej Karpathy",                                 enabled: false },
  { id: null,                        handle: "TheCryptoGateway",     name: "The Crypto Gateway - Investire in Criptovalute",  enabled: false },
];

export const DEFAULT_DAYS = 7;
export const MIN_DURATION_SECONDS = 200; // ~3.5 min — filters out Shorts and very short clips
