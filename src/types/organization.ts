export interface IOrganizationDto {
  name: string;
  description?: string;
  website?: string;
  picture?: string;
  location?: {
    latitude?: string;
    longitude?: string;
  };
  email: string; 
  phone: string;  
  logo?: string;
}

export interface IOrganizationUpdateDto {
  name?: string;
  description?: string;
  website?: string;
  picture?: string;
  location?: {
    latitude?: string;
    longitude?: string;
  };
  email?: string;
  phone?: string;
  logo?: string;
  followers?: string[];
}

