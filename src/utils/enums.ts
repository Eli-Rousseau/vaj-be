export enum S3ContentType {
  // Images
  JPEG = "image/jpeg",
  PNG = "image/png",
  GIF = "image/gif",
  BMP = "image/bmp",
  WEBP = "image/webp",
  SVG = "image/svg+xml",
  TIFF = "image/tiff",
  ICO = "image/x-icon",

  // Video
  MP4 = "video/mp4",
  MPEG = "video/mpeg",
  OGV = "video/ogg",
  WEBM = "video/webm",
  QUICKTIME = "video/quicktime",
  AVI = "video/x-msvideo",
  FLV = "video/x-flv",

  // Audio
  MP3 = "audio/mpeg",
  WAV = "audio/wav",
  OGG = "audio/ogg",
  AAC = "audio/aac",
  FLAC = "audio/flac",
  WEBA = "audio/webm",

  // Text
  PLAIN = "text/plain",
  CSV = "text/csv",
  HTML = "text/html",
  CSS = "text/css",
  JAVASCRIPT = "text/javascript",
  JSON = "application/json",
  XML = "application/xml",
  YAML = "application/x-yaml",
  MARKDOWN = "text/markdown",

  // Documents / Office
  PDF = "application/pdf",
  DOC = "application/msword",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLS = "application/vnd.ms-excel",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PPT = "application/vnd.ms-powerpoint",
  PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  RTF = "application/rtf",

  // Archives / Compressed
  ZIP = "application/zip",
  TAR = "application/x-tar",
  GZIP = "application/gzip",
  SEVEN_Z = "application/x-7z-compressed",
  RAR = "application/x-rar-compressed",
  BZIP2 = "application/x-bzip2",

  // Fonts
  TTF = "font/ttf",
  OTF = "font/otf",
  WOFF = "font/woff",
  WOFF2 = "font/woff2",

  // Other / Binary
  OCTET_STREAM = "application/octet-stream",
  XUL = "application/vnd.mozilla.xul+xml",
  SQL = "application/sql",
  GRAPHQL = "application/graphql",
  KML = "application/vnd.google-earth.kml+xml",
  SHELL = "application/x-sh",
}

export function findEnumsValue<E extends Record<string, string>>(
  value: string,
  enums: E
): E[keyof E] | null {
  const enumValues = Object.values(enums) as E[keyof E][];
  const found = enumValues.find(v => v === value);
  return found ?? null;
}

