export interface IOrganizationDto {
  name: string;
  description?: string;
  website?: string;
  picture?: string;
  location?: string;
}

export interface IOrganizationUpdateDto {
  name?: string;
  description?: string;
  website?: string;
  location?: string;
  followers?: string[];
  picture?: string;
}

