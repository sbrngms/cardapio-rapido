const MAX_SIZE = 1600;
const QUALITY = 0.8;

export async function resizeImage(file: File): Promise<{ base64: string; mimeType: string }> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (width >= height) {
      height = Math.round((height / width) * MAX_SIZE);
      width = MAX_SIZE;
    } else {
      width = Math.round((width / height) * MAX_SIZE);
      height = MAX_SIZE;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const b64 = dataUrl.split(",")[1];
    return { base64: b64, mimeType: file.type || "image/jpeg" };
  }
  ctx.drawImage(img, 0, 0, width, height);

  const resized = canvas.toDataURL("image/jpeg", QUALITY);
  return { base64: resized.split(",")[1], mimeType: "image/jpeg" };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
