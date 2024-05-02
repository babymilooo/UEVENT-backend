import  { Request, Response } from "express";
import { errorMessageObj } from "../helpers/errorMessageObj";
import { findOrganizationById} from "../services/organizationsService";
import { generateMediaPath } from "../helpers/updateAndDeleteImage";
import { updateFile, removeSingleFile } from "../helpers/updateAndDeleteImage";
import { checkEventOrganization } from "../services/eventsService";

export async function updateOrganizationEventMedia(req: Request | any, res: Response) {
  try {
    const id = req.params.id;
    const userId = req.userId;
    const entityType = req.params.entityType as 'organization' | 'event'; 
    const mediaType = req.query.mediaType as 'logo' | 'picture'; 

    const file: Express.Multer.File = req.file as any;
    if (!file)
      return res.status(400).json(errorMessageObj("No image uploaded."));

    let entity;
    if (entityType === 'organization')
      entity = await findOrganizationById(id);
    else if (entityType === 'event')
      entity = await checkEventOrganization(id, userId);
    else
      return res.status(400).json(errorMessageObj("Invalid entity type."));
    if (!entity)
      return res.status(404).json(errorMessageObj(`${entityType} not found.`));
    await updateFile(entity, entityType, mediaType, file);
    await entity.save();

    const filename = entity[mediaType];
    const mediaPath = filename ? await generateMediaPath(`/static/${entityType}/${mediaType}/`, filename) : null;
    res.status(200).json({ [mediaType]: mediaPath });
  } catch (error: any) {
    if (req.file)
      await removeSingleFile(req.file);
    if (error instanceof Error)
      res.status(500).json(errorMessageObj(error.message));
    else
      res.status(500).json(errorMessageObj("An error occurred while updating the image."));
  }
}
