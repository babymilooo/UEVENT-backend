import fs from 'fs';
import path from "path";


export async function updateFile(updateData: any, entityType: 'organization' | 'event' | 'profile', fieldname: string, file: Express.Multer.File) {
  if (file && file.path) {
    const normalizedNewFilePath = file.path.replace(/\\/g, '/');
    const filenameOnly = normalizedNewFilePath.split('/').pop();
    let basePath;
    if (entityType === 'organization') 
      basePath = path.posix.join('static', 'organization', fieldname);
    else if (entityType === 'event') 
      basePath = path.posix.join('static', 'event', fieldname);
    else 
      basePath = path.posix.join('static', 'avatars');

    const currentFilename = updateData[fieldname];
    if (currentFilename) {
      const oldFilePath = path.posix.join(basePath, currentFilename);
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


export async function generateMediaPath(basePath: string, fileName: string) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  return fileName ? backendUrl + basePath + fileName : fileName;
}

export async function modifyEntityPaths(entity: any, basePath: string) {
  entity.logo = entity.logo ? await generateMediaPath(`${basePath}logo/`, entity.logo) : entity.logo;
  entity.picture = entity.picture ? await generateMediaPath(`${basePath}picture/`, entity.picture) : entity.picture;
  return entity;
}

export async function modifyMultipleEntityPaths(entities: any[], logoPath: string) {
  const updatedEntities = await Promise.all(entities.map(async entity => {
    return modifyEntityPaths(entity, logoPath);
  }));

  return updatedEntities;
}
