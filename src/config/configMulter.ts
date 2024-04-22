import multer from "multer";
import path from "path";
import fs from "fs";


function createMulterConfig(dirName: string) {
  const targetDir = path.join(__dirname, "..", "..", "static", dirName);

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
const uploadOrganizationImages = createMulterConfig("organizations");

const uploadMultiple = uploadOrganizationImages.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'picture', maxCount: 1 }
]);

export { uploadAvatars, uploadOrganizationImages, uploadMultiple };
