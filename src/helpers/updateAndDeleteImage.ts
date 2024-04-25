import fs from 'fs';
import path from "path";

// export async function handleImageUpdate(updateData: any, images: { [fieldname: string]: Express.Multer.File[] }) {
//   for (const [imageField, files] of Object.entries(images)) {
//     const file = files[0];
    
//     if (file && file.path) {
//       const currentImagePath = updateData[imageField];

//       if (currentImagePath) {
//         const oldImagePath = path.join('static', currentImagePath.replace(`${process.env.BACKEND_URL}/static/`, ''));
//         try {
//           if (fs.existsSync(oldImagePath))
//             await fs.promises.unlink(oldImagePath);
//         } catch (error) {
//           console.error(`Error deleting old ${imageField}:`, error);
//         }
//       }

//       const relativeFilePath = file.path.split('static')[1];
//       updateData[imageField] = `${process.env.BACKEND_URL}/static${relativeFilePath}`;
//     }
//   }
// }



export async function handleImageUpdate(updateData: any, nameFile: string, files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File ) {
  if (Array.isArray(files)) {
    files.forEach((file) => {
      updateFile(updateData, nameFile, file);
    });
  } else {
    for (const [fieldname, fileArray] of Object.entries(files)) {
      fileArray.forEach((file: Express.Multer.File) => {
        updateFile(updateData, fieldname, file);
      });
    }
  }
}

export async function updateFile(updateData: any, fieldname: string, file: Express.Multer.File) {
  if (file && file.path) {
    const normalizedNewFilePath = file.path.replace(/\\/g, '/');
    const filenameOnly = normalizedNewFilePath.split('/').pop();

    const basePath = fieldname === 'profilePicture'
      ? path.join('static', 'avatars')
      : path.join('static', 'organizations', fieldname);

    const currentFilename = updateData[fieldname];
    if (currentFilename) {
      const oldFilePath = path.join(basePath, currentFilename);
      await removeSingleFile(oldFilePath);
    }
    updateData[fieldname] = filenameOnly;
  }
}

export async function removeSingleFile(file: Express.Multer.File | string) {
  const filePath = typeof file === 'string' ? file : file.path;
  try {
    await fs.promises.unlink(filePath);
    console.log(`Successfully removed file: ${filePath}`);
  } catch (error) {
    console.error(`Error removing file: ${filePath}`, error);
  }
}


export async function removeFiles(files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]) {
  if (Array.isArray(files)) {
    for (const file of files) {
      try {
        await fs.promises.unlink(file.path);
        console.log(`Successfully removed file: ${file.path}`);
      } catch (error) {
        console.error(`Error removing file: ${file.path}`, error);
      }
    }
  } else {
    for (const fileArray of Object.values(files)) {
      for (const file of fileArray) {
        try {
          await fs.promises.unlink(file.path);
          console.log(`Successfully removed file: ${file.path}`);
        } catch (error) {
          console.error(`Error removing file: ${file.path}`, error);
        }
      }
    }
  }
}
