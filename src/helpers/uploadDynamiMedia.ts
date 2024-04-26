import { NextFunction, Request, Response } from "express";
import { multerConfigs } from "../config/configMulter";
import { errorMessageObj } from "./errorMessageObj";

export async function uploadDynamicMedia(req: Request, res: Response, next: NextFunction) {
  const entityType = req.params.entityType as 'organization' | 'event'; 
  const uploadType = req.query.mediaType as 'logo' | 'picture'; 

  if (multerConfigs.hasOwnProperty(entityType) && multerConfigs[entityType].hasOwnProperty(uploadType)) {
    const multerConfig = multerConfigs[entityType][uploadType];
    
    const uploader = multerConfig.single(uploadType as string);
    uploader(req, res, function (err) {
      if (err)
        return res.status(500).json(errorMessageObj("Error uploading file."));
      next();
    });
  } else {
    return res.status(400).json(errorMessageObj("Invalid upload type or entity type."));
  }
}
