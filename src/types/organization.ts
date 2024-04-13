export interface IOrganizationDto {
  name: string;
  description?: string;
  website?: string;
  location?: string;
}

export interface IOrganizationUpdateDto {
  name?: string;
  description?: string;
  website?: string;
  isVerified?: boolean;
  location?: string;
  followers?: string[]
}

