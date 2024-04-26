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
const uploadOrganizationLogo = createMulterConfig("organization/logo");
const uploadOrganizationPicture = createMulterConfig("organization/picture");
const uploadEventLogo = createMulterConfig("event/logo");
const uploadEventPicture = createMulterConfig("event/picture");

const multerConfigs = {
  organization: {
    logo: uploadOrganizationLogo,
    picture: uploadOrganizationPicture
  },
  event: {
    logo: uploadEventLogo,
    picture: uploadEventPicture
  }
};
export { uploadAvatars, 
         uploadOrganizationLogo, uploadOrganizationPicture, 
         uploadEventLogo, uploadEventPicture, 
         multerConfigs 
        };
