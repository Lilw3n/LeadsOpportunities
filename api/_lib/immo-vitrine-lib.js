const MEDIA_FIELD_IDS = [
  { id: "lien_video", label: "Vidéo de présentation", icon: "🎬", group: "video" },
  { id: "video_aerienne", label: "Vidéo drone", icon: "🚁", group: "video" },
  { id: "pitch_reel", label: "Reel / Short", icon: "📱", group: "video" },
  { id: "visite_virtuelle", label: "Visite virtuelle 3D", icon: "🏠", group: "tour" },
  { id: "visite_privee", label: "Visite privée", icon: "🔒", group: "tour", private: true },
  { id: "url_360", label: "360°", icon: "🔄", group: "tour" },
  { id: "plan_2d_3d", label: "Plan 2D/3D", icon: "📐", group: "tour" },
  { id: "url_myphoto", label: "MyPhotoAgency", icon: "📷", group: "tour" },
  { id: "stream_url", label: "Live", icon: "🔴", group: "live" },
  { id: "stream_replay", label: "Replay live", icon: "▶️", group: "live" },
  { id: "stream_scheduled", label: "Prochain live", icon: "📅", group: "live" },
];

function parseEmbed(url) {
  if (!url || typeof url !== "string") return null;
  const u = url.trim();
  if (!u) return null;

  const yt =
    u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/) ||
    u.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/);
  if (yt) {
    return {
      type: "youtube",
      id: yt[1],
      embedUrl: "https://www.youtube-nocookie.com/embed/" + yt[1] + "?rel=0",
      thumbUrl: "https://img.youtube.com/vi/" + yt[1] + "/hqdefault.jpg",
      original: u,
    };
  }

  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return {
      type: "vimeo",
      id: vimeo[1],
      embedUrl: "https://player.vimeo.com/video/" + vimeo[1],
      thumbUrl: "",
      original: u,
    };
  }

  const matterport =
    u.match(/matterport\.com\/show\/\?m=([a-zA-Z0-9]+)/) ||
    u.match(/my\.matterport\.com\/show\/\?m=([a-zA-Z0-9]+)/);
  if (matterport) {
    return {
      type: "matterport",
      id: matterport[1],
      embedUrl: "https://my.matterport.com/show/?m=" + matterport[1],
      thumbUrl: "",
      original: u,
    };
  }

  const tiktok = u.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tiktok) {
    return {
      type: "tiktok",
      id: tiktok[1],
      embedUrl: "https://www.tiktok.com/embed/v2/" + tiktok[1],
      thumbUrl: "",
      original: u,
    };
  }

  if (/facebook\.com|fb\.watch/i.test(u)) {
    return { type: "facebook", embedUrl: u, thumbUrl: "", original: u };
  }

  if (/instagram\.com\/(p|reel|tv)\//i.test(u)) {
    return { type: "instagram", embedUrl: u, thumbUrl: "", original: u };
  }

  return { type: "link", embedUrl: u, thumbUrl: "", original: u };
}

module.exports = { parseEmbed, MEDIA_FIELD_IDS };
