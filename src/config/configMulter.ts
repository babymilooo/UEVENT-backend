import multer from "multer";
import path from "path";
import fs from "fs";


function createMulterConfig(dirName: string) {
  const targetDir = path.join(__dirname, "..", "static", dirName);

  if (!fs.existsSync(targetDir)) 
    fs.mkdirSync(targetDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      cb(null, uniqueSuffix);
    }
  });

  return multer({ storage: storage });
}

const uploadAvatars = createMulterConfig("avatars");
const uploadOrganizationImages = createMulterConfig("organization_images");

export { uploadAvatars, uploadOrganizationImages };
